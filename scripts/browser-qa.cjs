const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const debugPort = Number(process.env.DEBUG_PORT || 9223);
const profileDir = path.join(process.cwd(), '.qa-chrome-profile');
const pages = (process.env.QA_PAGES || [
  'index.html',
  'services.html',
  'ecommerce.html',
  'product-page-optimization.html',
  'custom-systems.html',
  'tharaa.html',
  'portfolio.html',
  'knowledge.html',
  'about.html',
  'contact.html'
].join(',')).split(',').map((item) => item.trim()).filter(Boolean);

const viewports = [
  { name: 'desktop', width: 1440, height: 960, mobile: false, deviceScaleFactor: 1 },
  { name: 'tablet', width: 820, height: 1180, mobile: false, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, mobile: true, deviceScaleFactor: 1 }
];

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function safeRm(target) { try { fs.rmSync(target, { recursive: true, force: true }); } catch (_) {} }

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function pollJson(url, tries = 50) {
  let last;
  for (let i = 0; i < tries; i += 1) {
    try { return await getJson(url); }
    catch (error) { last = error; await wait(200); }
  }
  throw last;
}

function encodeFrame(data) {
  const payload = Buffer.from(data);
  const mask = crypto.randomBytes(4);
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[1] = payload.length | 0x80;
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126 | 0x80;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127 | 0x80;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  header[0] = 0x81;
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function decodeFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    let length = second & 0x7f;
    let headerLength = 2;
    if (length === 126) {
      if (offset + 4 > buffer.length) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (offset + 10 > buffer.length) break;
      length = Number(buffer.readBigUInt64BE(offset + 2));
      headerLength = 10;
    }
    const masked = Boolean(second & 0x80);
    const maskLength = masked ? 4 : 0;
    const frameEnd = offset + headerLength + maskLength + length;
    if (frameEnd > buffer.length) break;
    let payload = buffer.slice(offset + headerLength + maskLength, frameEnd);
    if (masked) {
      const mask = buffer.slice(offset + headerLength, offset + headerLength + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }
    if ((first & 0x0f) === 1) messages.push(payload.toString('utf8'));
    offset = frameEnd;
  }
  return { messages, rest: buffer.slice(offset) };
}

function connectWebSocket(wsUrl, onEvent) {
  const url = new URL(wsUrl);
  const socket = net.connect(Number(url.port), url.hostname);
  const key = crypto.randomBytes(16).toString('base64');
  let handshake = '';
  let rest = Buffer.alloc(0);
  let connected = false;
  const pending = new Map();
  let nextId = 1;

  socket.on('data', (chunk) => {
    if (!connected) {
      handshake += chunk.toString('binary');
      const end = handshake.indexOf('\r\n\r\n');
      if (end === -1) return;
      connected = true;
      rest = Buffer.concat([rest, Buffer.from(handshake.slice(end + 4), 'binary')]);
    } else {
      rest = Buffer.concat([rest, chunk]);
    }
    const decoded = decodeFrames(rest);
    rest = decoded.rest;
    decoded.messages.forEach((message) => {
      const data = JSON.parse(message);
      if (data.id && pending.has(data.id)) {
        pending.get(data.id)(data);
        pending.delete(data.id);
      } else if (data.method) onEvent(data);
    });
  });

  socket.write([
    `GET ${url.pathname}${url.search} HTTP/1.1`,
    `Host: ${url.host}`,
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Key: ${key}`,
    'Sec-WebSocket-Version: 13',
    '\r\n'
  ].join('\r\n'));

  return {
    send(method, params = {}) {
      const id = nextId++;
      socket.write(encodeFrame(JSON.stringify({ id, method, params })));
      return new Promise((resolve) => pending.set(id, resolve));
    },
    close() { socket.destroy(); }
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  const result = response?.result?.result;
  if (result?.subtype === 'error') throw new Error(result.description || 'Runtime evaluation error');
  return result?.value;
}

async function dispatchTab(client) {
  const key = { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 };
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
}

async function keyboardSmoke(client) {
  await evaluate(client, `(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); return true; })()`);
  const trail = [];
  for (let index = 0; index < 8; index += 1) {
    await dispatchTab(client);
    await wait(35);
    const descriptor = await evaluate(client, `(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return 'document';
      const classes = String(el.className || '').trim().split(' ').filter(Boolean).slice(0, 2).join('.');
      return [
        el.tagName.toLowerCase(),
        el.id ? '#' + el.id : '',
        classes ? '.' + classes : '',
        el.getAttribute('href') || '',
        el.getAttribute('aria-label') || '',
        String(el.textContent || '').trim().slice(0, 40)
      ].join('|');
    })()`);
    trail.push(descriptor);
  }
  const interactive = trail.filter((item) => item && item !== 'document');
  return {
    moved: new Set(interactive).size >= 2,
    uniqueCount: new Set(interactive).size,
    trail
  };
}

async function inspectPage(client, page, viewport, events) {
  await client.send('Emulation.setDeviceMetricsOverride', viewport);
  await client.send('Page.navigate', { url: `${baseUrl}/${page}` });
  await wait(1700);

  const metrics = await evaluate(client, `(() => {
    const retired = ['salla.html','zid.html','shopify.html','woocommerce.html','wordpress.html'];
    const fakeMarkers = ['967000000000','hello@ibtikar-tech.com','support@tharaa.com','t.me/tharaa_theme'];
    const links = [...document.querySelectorAll('a[href]')];
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) !== 0 && rect.width > 0 && rect.height > 0;
    };
    const overflowers = [...document.querySelectorAll('body *')].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        cls: String(el.className || '').slice(0,100),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        transform: getComputedStyle(el).transform,
        position: getComputedStyle(el).position
      };
    }).filter((item) => item.right > innerWidth + 2 || item.left < -2 || item.width > innerWidth + 2).slice(0, 16);
    const fakeContacts = links.filter((a) => {
      const href = String(a.getAttribute('href') || '').toLowerCase();
      return fakeMarkers.some((marker) => href.includes(marker)) && visible(a);
    }).map((a) => a.getAttribute('href'));
    const retiredLinks = links.filter((a) => retired.some((route) => (a.getAttribute('href') || '').split('#')[0].toLowerCase() === route) && visible(a)).map((a) => a.getAttribute('href'));
    const duplicateIds = [...document.querySelectorAll('[id]')].map((el) => el.id).filter((id, index, all) => id && all.indexOf(id) !== index).filter((id, index, all) => all.indexOf(id) === index);
    const robots = document.querySelector('meta[name="robots"]')?.content || '';
    return {
      title: document.title,
      h1: document.querySelectorAll('h1').length,
      shellHeader: visible(document.querySelector('.ibt-shell-header')),
      shellFooter: visible(document.querySelector('.ibt-shell-footer')),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowers,
      fakeContacts,
      retiredLinks,
      duplicateIds,
      todoVisible: document.body.innerText.includes('[TODO:'),
      robots,
      legacyBriefVisible: visible(document.querySelector('.brief-modal')),
      legacyWhatsappVisible: visible(document.querySelector('.whatsapp-float, a.whatsapp[href*="967000000000"]')),
      servicesDiscoveryCount: document.querySelectorAll('.fast-discovery-slide').length,
      servicesCinema: Boolean(document.querySelector('.services-primary-cinema')),
      contactSubmitLabel: document.querySelector('#quote-form button[type="submit"]')?.textContent?.trim() || '',
      tharaaCompareVisible: visible(document.querySelector('#compare')),
      tharaaLegacySupportVisible: visible(document.querySelector('#support')),
      productRelatedHrefs: [...document.querySelectorAll('.related-grid article a')].map((a) => a.getAttribute('href'))
    };
  })()`);

  metrics.keyboard = await keyboardSmoke(client);
  return { page, viewport: viewport.name, metrics, events: [...events] };
}

function validate(result, failures) {
  const { page, viewport, metrics, events } = result;
  const prefix = `${page} [${viewport}]`;
  if (!metrics.title) failures.push(`${prefix}: empty document title`);
  if (!metrics.shellHeader) failures.push(`${prefix}: shared header not visible`);
  if (!metrics.shellFooter) failures.push(`${prefix}: shared footer not visible`);
  if (metrics.h1 !== 1) failures.push(`${prefix}: expected exactly one H1, found ${metrics.h1}`);
  if (metrics.scrollWidth > metrics.clientWidth + 2) failures.push(`${prefix}: horizontal document overflow ${metrics.scrollWidth}px > ${metrics.clientWidth}px · elements=${JSON.stringify(metrics.overflowers)}`);
  if (metrics.fakeContacts.length) failures.push(`${prefix}: visible fake contact links: ${metrics.fakeContacts.join(', ')}`);
  if (metrics.retiredLinks.length) failures.push(`${prefix}: visible retired platform links: ${metrics.retiredLinks.join(', ')}`);
  if (metrics.todoVisible) failures.push(`${prefix}: visible TODO placeholder text`);
  if (metrics.duplicateIds.length) failures.push(`${prefix}: duplicate IDs: ${metrics.duplicateIds.join(', ')}`);
  if (metrics.legacyBriefVisible) failures.push(`${prefix}: retired legacy brief is visible`);
  if (metrics.legacyWhatsappVisible) failures.push(`${prefix}: retired fake WhatsApp control is visible`);
  if (!metrics.keyboard?.moved) failures.push(`${prefix}: keyboard Tab smoke did not move focus across at least two interactive elements`);

  const severeEvents = events.filter((event) => {
    if (/favicon/i.test(event.url || '')) return false;
    if (event.type === 'network') return event.status >= 400;
    return ['exception', 'error'].includes(event.type);
  });
  if (severeEvents.length) failures.push(`${prefix}: runtime/network errors: ${JSON.stringify(severeEvents.slice(0,5))}`);

  if (page === 'services.html') {
    if (!metrics.servicesCinema) failures.push(`${prefix}: services cinematic enhancement missing`);
    if (metrics.servicesDiscoveryCount !== 8) failures.push(`${prefix}: expected 8 discovery cards, found ${metrics.servicesDiscoveryCount}`);
  }
  if (page === 'contact.html') {
    if (!/noindex/i.test(metrics.robots)) failures.push(`${prefix}: contact preview must remain noindex until backend is connected`);
    if (metrics.contactSubmitLabel !== 'حفظ مسودة الطلب') failures.push(`${prefix}: contact form must clearly save a local draft, got “${metrics.contactSubmitLabel}”`);
  }
  if (page === 'portfolio.html' || page === 'knowledge.html') {
    if (/noindex/i.test(metrics.robots)) failures.push(`${prefix}: completed public content must not be noindex`);
  }
  if (page === 'tharaa.html') {
    if (metrics.tharaaCompareVisible) failures.push(`${prefix}: unsupported generic comparison block is visible`);
    if (metrics.tharaaLegacySupportVisible) failures.push(`${prefix}: legacy support placeholder block is visible`);
  }
  if (page === 'product-page-optimization.html' && metrics.productRelatedHrefs.length) {
    const required = ['storefront-customization.html','brand-content.html','ecommerce-growth.html','store-redesign.html'];
    required.forEach((href) => {
      if (!metrics.productRelatedHrefs.includes(href)) failures.push(`${prefix}: expected related-service route ${href}`);
    });
  }
}

(async () => {
  const executable = chromePath();
  if (!executable) throw new Error('Chrome/Chromium executable not found. Set CHROME_PATH.');
  safeRm(profileDir);

  const chrome = spawn(executable, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    'about:blank'
  ], { stdio: 'ignore' });

  const events = [];
  const failures = [];
  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const pageTarget = targets.find((item) => item.type === 'page');
    if (!pageTarget) throw new Error('No Chrome page target found.');

    const client = connectWebSocket(pageTarget.webSocketDebuggerUrl, (event) => {
      if (event.method === 'Runtime.exceptionThrown') {
        const d = event.params.exceptionDetails;
        events.push({ type: 'exception', text: d.exception?.description || d.text, url: d.url, line: d.lineNumber });
      }
      if (event.method === 'Log.entryAdded') {
        const entry = event.params.entry;
        if (entry.level === 'error') events.push({ type: entry.level, text: entry.text, url: entry.url });
      }
      if (event.method === 'Network.responseReceived') {
        const response = event.params.response;
        if (response.status >= 400) events.push({ type: 'network', status: response.status, url: response.url });
      }
    });

    await wait(250);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Log.enable');
    await client.send('Network.enable');

    const results = [];
    for (const page of pages) {
      for (const viewport of viewports) {
        events.length = 0;
        const result = await inspectPage(client, page, viewport, events);
        results.push(result);
        validate(result, failures);
        console.log(`✓ inspected ${page} [${viewport.name}] · keyboard focus ${result.metrics.keyboard.uniqueCount}`);
      }
    }

    client.close();
    if (failures.length) {
      console.error('\nBrowser QA failed:');
      failures.forEach((failure) => console.error(`✗ ${failure}`));
      process.exitCode = 1;
    } else {
      console.log(`✓ Browser QA passed for ${results.length} page/viewport combinations with keyboard Tab smoke.`);
    }
  } finally {
    chrome.kill();
    await wait(400);
    safeRm(profileDir);
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});