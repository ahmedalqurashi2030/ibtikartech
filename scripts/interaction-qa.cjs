const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const debugPort = Number(process.env.INTERACTION_DEBUG_PORT || 9225);
const profileDir = path.join(process.cwd(), '.qa-interaction-chrome-profile');
const DESKTOP = { width: 1440, height: 960, mobile: false, deviceScaleFactor: 1 };
const MOBILE = { width: 390, height: 844, mobile: true, deviceScaleFactor: 1 };

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
function assert(condition, message) { if (!condition) throw new Error(message); }

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function pollJson(url, tries = 60) {
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

function connectWebSocket(wsUrl) {
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
      }
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
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`CDP command timed out: ${method}`));
        }, 15_000);
        pending.set(id, (data) => {
          clearTimeout(timeout);
          resolve(data);
        });
      });
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

async function key(client, keyName, options = {}) {
  const map = {
    Enter: { code:'Enter', keyCode:13 },
    ' ': { code:'Space', keyCode:32 },
    Escape: { code:'Escape', keyCode:27 },
    Tab: { code:'Tab', keyCode:9 },
    ArrowDown: { code:'ArrowDown', keyCode:40 },
    ArrowLeft: { code:'ArrowLeft', keyCode:37 },
    ArrowRight: { code:'ArrowRight', keyCode:39 }
  };
  const meta = map[keyName] || { code:keyName, keyCode:0 };
  const modifiers = options.shift ? 8 : 0;
  const common = {
    key: keyName,
    code: meta.code,
    windowsVirtualKeyCode: meta.keyCode,
    nativeVirtualKeyCode: meta.keyCode,
    modifiers
  };
  const text = keyName === 'Enter' ? '\r' : keyName === ' ' ? ' ' : undefined;
  const keyDown = { type:'keyDown', ...common };
  if (text !== undefined) {
    keyDown.text = text;
    keyDown.unmodifiedText = text;
  }
  await client.send('Input.dispatchKeyEvent', keyDown);
  await client.send('Input.dispatchKeyEvent', { type:'keyUp', ...common });
}

async function navigate(client, page, viewport, settle = 1900) {
  await client.send('Emulation.setDeviceMetricsOverride', viewport);
  await client.send('Page.navigate', { url: `${baseUrl}/${page}` });
  await wait(settle);
}

async function focus(client, selector, index = 0) {
  const ok = await evaluate(client, `(() => {
    const nodes = [...document.querySelectorAll(${JSON.stringify(selector)})];
    const el = nodes[${index}];
    if (!el) return false;
    el.scrollIntoView({block:'center',inline:'center'});
    el.focus({preventScroll:true});
    return document.activeElement === el;
  })()`);
  assert(ok, `Could not focus ${selector}[${index}]`);
}

async function setValue(client, selector, value) {
  const ok = await evaluate(client, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.value = ${JSON.stringify(value)};
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  })()`);
  assert(ok, `Could not set ${selector}`);
}

async function testMegaMenus(client) {
  await navigate(client, 'index.html', DESKTOP);
  const solutions = '[data-ibt-mega-toggle][aria-controls="solutionsServicesMega"]';
  await focus(client, solutions);
  await key(client, 'Enter');
  await wait(120);
  let state = await evaluate(client, `(() => {
    const t=document.querySelector(${JSON.stringify(solutions)}), m=document.getElementById('solutionsServicesMega');
    return {expanded:t?.getAttribute('aria-expanded'), hidden:m?.getAttribute('aria-hidden'), open:m?.classList.contains('is-open'), focusInside:m?.contains(document.activeElement)};
  })()`);
  assert(state.expanded === 'true' && state.hidden === 'false' && state.open && state.focusInside, `Solutions mega did not open/focus correctly: ${JSON.stringify(state)}`);
  await key(client, 'Escape');
  await wait(80);
  state = await evaluate(client, `(() => {
    const t=document.querySelector(${JSON.stringify(solutions)}), m=document.getElementById('solutionsServicesMega');
    return {expanded:t?.getAttribute('aria-expanded'), hidden:m?.getAttribute('aria-hidden'), open:m?.classList.contains('is-open'), focusBack:document.activeElement===t};
  })()`);
  assert(state.expanded === 'false' && state.hidden === 'true' && !state.open && state.focusBack, `Solutions mega Escape close failed: ${JSON.stringify(state)}`);

  const products = solutions;
  await focus(client, products);
  await key(client, 'ArrowDown');
  await wait(120);
  state = await evaluate(client, `(() => {
    const t=document.querySelector(${JSON.stringify(products)}), m=document.getElementById('solutionsServicesMega');
    return {expanded:t?.getAttribute('aria-expanded'), focusInside:m?.contains(document.activeElement)};
  })()`);
  assert(state.expanded === 'true' && state.focusInside, `Solutions mega ArrowDown failed: ${JSON.stringify(state)}`);
  await key(client, 'Escape');
  console.log('✓ desktop solutions mega menu: Enter / ArrowDown / Escape / focus restore');
}

async function testMobileMenu(client) {
  await navigate(client, 'index.html', MOBILE);
  const toggle = '[data-ibt-menu-toggle]:not([data-ibt-menu-managed="page"])';
  await focus(client, toggle);
  await key(client, 'Enter');
  await wait(120);
  let state = await evaluate(client, `(() => {
    const t=document.querySelector(${JSON.stringify(toggle)}), m=document.getElementById('ibtikarMobileMenu');
    return {expanded:t?.getAttribute('aria-expanded'), hidden:m?.getAttribute('aria-hidden'), open:m?.classList.contains('open'), body:document.body.classList.contains('menu-open'), focusInside:m?.contains(document.activeElement)};
  })()`);
  assert(state.expanded === 'true' && state.hidden === 'false' && state.open && state.body && state.focusInside, `Mobile menu open failed: ${JSON.stringify(state)}`);

  const wrap = await evaluate(client, `(() => {
    const m=document.getElementById('ibtikarMobileMenu');
    const items=[...m.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden&&el.getClientRects().length);
    if(items.length<2) return {ok:false,count:items.length};
    items.at(-1).focus(); return {ok:true,count:items.length};
  })()`);
  assert(wrap.ok, `Mobile menu needs >=2 focusables, got ${wrap.count}`);
  await key(client, 'Tab');
  state = await evaluate(client, `(() => {
    const m=document.getElementById('ibtikarMobileMenu');
    const items=[...m.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden&&el.getClientRects().length);
    return document.activeElement===items[0];
  })()`);
  assert(state, 'Mobile menu did not wrap Tab from last to first');
  await key(client, 'Tab', { shift:true });
  state = await evaluate(client, `(() => {
    const m=document.getElementById('ibtikarMobileMenu');
    const items=[...m.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden&&el.getClientRects().length);
    return document.activeElement===items.at(-1);
  })()`);
  assert(state, 'Mobile menu did not wrap Shift+Tab from first to last');

  await key(client, 'Escape');
  await wait(80);
  state = await evaluate(client, `(() => {
    const t=document.querySelector(${JSON.stringify(toggle)}), m=document.getElementById('ibtikarMobileMenu');
    return {expanded:t?.getAttribute('aria-expanded'), hidden:m?.getAttribute('aria-hidden'), body:document.body.classList.contains('menu-open'), focusBack:document.activeElement===t};
  })()`);
  assert(state.expanded === 'false' && state.hidden === 'true' && !state.body && state.focusBack, `Mobile menu Escape close failed: ${JSON.stringify(state)}`);
  console.log('✓ mobile menu: Enter / focus trap / Escape / focus restore');
}

async function testFaq(client) {
  await navigate(client, 'ecommerce.html', DESKTOP);
  const info = await evaluate(client, `(() => {
    const items=[...document.querySelectorAll('.faq,[data-faq-item],.accordion-item')];
    const item=items.find(el=>el.querySelector('button'));
    if(!item) return null;
    const button=item.querySelector('button');
    button.dataset.interactionQa='faq';
    return {count:items.length,expanded:button.getAttribute('aria-expanded')};
  })()`);
  assert(info && info.count > 0, 'No FAQ button found on ecommerce.html');
  await focus(client, '[data-interaction-qa="faq"]');
  await key(client, 'Enter');
  await wait(100);
  let state = await evaluate(client, `(() => {
    const b=document.querySelector('[data-interaction-qa="faq"]'), i=b?.closest('.faq,[data-faq-item],.accordion-item');
    return {expanded:b?.getAttribute('aria-expanded'),open:i?.classList.contains('open')||i?.classList.contains('is-open')};
  })()`);
  assert(state.expanded === 'true' && state.open, `FAQ Enter open failed: ${JSON.stringify(state)}`);
  await key(client, ' ');
  await wait(100);
  state = await evaluate(client, `(() => {
    const b=document.querySelector('[data-interaction-qa="faq"]'), i=b?.closest('.faq,[data-faq-item],.accordion-item');
    return {expanded:b?.getAttribute('aria-expanded'),open:i?.classList.contains('open')||i?.classList.contains('is-open')};
  })()`);
  assert(state.expanded === 'false' && !state.open, `FAQ Space close failed: ${JSON.stringify(state)}`);
  console.log('✓ FAQ: Enter opens and Space closes with ARIA state');
}

async function testServicesSlider(client) {
  await navigate(client, 'services.html', DESKTOP, 2300);
  const count = await evaluate(client, `document.querySelectorAll('.fast-discovery-slide').length`);
  assert(count === 8, `Expected 8 fast discovery slides, got ${count}`);
  await focus(client, '.fast-discovery-track');
  let current = await evaluate(client, `document.querySelector('[data-fast-current]')?.textContent?.trim()`);
  assert(current === '01', `Services slider initial index should be 01, got ${current}`);
  await key(client, 'ArrowLeft');
  await wait(450);
  current = await evaluate(client, `document.querySelector('[data-fast-current]')?.textContent?.trim()`);
  assert(current === '02', `Services slider ArrowLeft should move to 02 in RTL, got ${current}`);
  await key(client, 'ArrowRight');
  await wait(450);
  current = await evaluate(client, `document.querySelector('[data-fast-current]')?.textContent?.trim()`);
  assert(current === '01', `Services slider ArrowRight should return to 01, got ${current}`);
  console.log('✓ services discovery slider: RTL ArrowLeft / ArrowRight navigation');
}

async function testContactSteps(client) {
  await navigate(client, 'contact.html', DESKTOP);
  await focus(client, '[data-step-panel]:not([hidden]) [data-step-next]');
  await key(client, 'Enter');
  await wait(100);
  let state = await evaluate(client, `(() => ({visible:[...document.querySelectorAll('[data-step-panel]')].findIndex(p=>!p.hidden)}))()`);
  assert(state.visible === 0, `Empty required fields should block step 1, got visible step ${state.visible}`);

  await setValue(client, '#quote-name', 'اختبار تفاعلي');
  await setValue(client, '#quote-phone', '0500000000');
  await focus(client, '[data-step-panel]:not([hidden]) [data-step-next]');
  await key(client, 'Enter');
  await wait(120);
  state = await evaluate(client, `(() => ({visible:[...document.querySelectorAll('[data-step-panel]')].findIndex(p=>!p.hidden),focus:document.activeElement?.id||''}))()`);
  assert(state.visible === 1 && state.focus === 'quote-goal', `Step 1→2 or focus transfer failed: ${JSON.stringify(state)}`);

  await focus(client, '[data-step-panel]:not([hidden]) [data-step-prev]');
  await key(client, 'Enter');
  await wait(100);
  state = await evaluate(client, `[...document.querySelectorAll('[data-step-panel]')].findIndex(p=>!p.hidden)`);
  assert(state === 0, `Previous button should return to step 1, got ${state}`);
  await focus(client, '[data-step-panel]:not([hidden]) [data-step-next]');
  await key(client, 'Enter');
  await wait(100);

  await setValue(client, '#quote-goal', 'إطلاق متجر');
  await setValue(client, '#quote-stage', 'جاهز للتنفيذ');
  await focus(client, '[data-step-panel]:not([hidden]) [data-step-next]');
  await key(client, ' ');
  await wait(120);
  state = await evaluate(client, `(() => ({visible:[...document.querySelectorAll('[data-step-panel]')].findIndex(p=>!p.hidden),focus:document.activeElement?.id||''}))()`);
  assert(state.visible === 2 && state.focus === 'quote-details', `Step 2→3 or focus transfer failed: ${JSON.stringify(state)}`);

  await setValue(client, '#quote-details', 'هذه مسودة اختبار آلي للتأكد من الحفظ المحلي فقط.');
  await focus(client, '#quote-form button[type="submit"]');
  await key(client, 'Enter');
  await wait(800);
  state = await evaluate(client, `(() => {
    let saved=null; try { saved=JSON.parse(localStorage.getItem('ibtikar:lastBrief')||'null'); } catch(_) {}
    const panels=[...document.querySelectorAll('[data-step-panel]')];
    return {
      saved:Boolean(saved&&saved.name==='اختبار تفاعلي'),
      message:document.querySelector('[data-form-state]')?.textContent?.trim()||'',
      visible:panels.findIndex(p=>!p.hidden),
      submitDisabled:document.querySelector('#quote-form button[type="submit"]')?.disabled||false
    };
  })()`);
  assert(state.saved, `Contact draft was not saved locally: ${JSON.stringify(state)}`);
  assert(state.message.includes('لن يصل إلى الفريق'), `Contact success copy must state local-only behavior: ${state.message}`);
  assert(state.visible === 0 && !state.submitDisabled, `Contact form should reset to step 1 after save: ${JSON.stringify(state)}`);
  console.log('✓ contact form: validation / next / previous / focus / local draft submit / reset');
}

async function testTharaaStudio(client) {
  await navigate(client, 'tharaa.html', DESKTOP, 2500);
  let state = await evaluate(client, `(() => ({sectors:document.querySelectorAll('[data-sector]').length,views:document.querySelectorAll('[data-view]').length,devices:document.querySelectorAll('[data-device]').length}))()`);
  assert(state.sectors >= 2 && state.views >= 2 && state.devices >= 2, `Tharaa studio controls missing: ${JSON.stringify(state)}`);

  await focus(client, '[data-sector]', 1);
  await key(client, 'Enter');
  await wait(120);
  state = await evaluate(client, `(() => { const b=[...document.querySelectorAll('[data-sector]')]; return {first:b[0]?.getAttribute('aria-selected'),second:b[1]?.getAttribute('aria-selected')}; })()`);
  assert(state.first === 'false' && state.second === 'true', `Tharaa sector tab Enter failed: ${JSON.stringify(state)}`);

  await focus(client, '[data-view="product"]');
  await key(client, ' ');
  await wait(120);
  state = await evaluate(client, `(() => ({selected:document.querySelector('[data-view="product"]')?.getAttribute('aria-selected'),active:document.querySelector('[data-demo-view="product"]')?.classList.contains('active')}))()`);
  assert(state.selected === 'true' && state.active, `Tharaa product view Space failed: ${JSON.stringify(state)}`);

  await focus(client, '[data-device="mobile"]');
  await key(client, 'Enter');
  await wait(120);
  state = await evaluate(client, `(() => { const b=document.querySelector('[data-device="mobile"]'); return {pressed:b?.getAttribute('aria-pressed')}; })()`);
  assert(state.pressed === 'true', `Tharaa mobile device Enter failed: ${JSON.stringify(state)}`);
  console.log('✓ Tharaa preview studio: sector / view / device keyboard activation');
}

(async () => {
  const executable = chromePath();
  if (!executable) {
    console.error('Chrome/Chromium executable not found. Set CHROME_PATH.');
    process.exit(75);
  }
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
  ], { stdio:'ignore' });

  let client;
  try {
    let targets;
    try {
      targets = await pollJson(`http://127.0.0.1:${debugPort}/json`);
    } catch (error) {
      console.error(`Chrome/CDP startup failed: ${error.message}`);
      process.exitCode = 75;
      return;
    }
    const pageTarget = targets.find((target) => target.type === 'page');
    assert(pageTarget?.webSocketDebuggerUrl, 'No debuggable page target found');
    client = connectWebSocket(pageTarget.webSocketDebuggerUrl);
    await wait(120);
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    const tests = [
      ['desktop mega menus', testMegaMenus],
      ['mobile menu', testMobileMenu],
      ['FAQ', testFaq],
      ['services slider', testServicesSlider],
      ['contact steps', testContactSteps],
      ['Tharaa studio', testTharaaStudio]
    ];

    for (const [name, test] of tests) {
      try {
        await test(client);
      } catch (error) {
        throw new Error(`${name}: ${error.message}`);
      }
    }
    console.log(`✓ Interaction QA passed: ${tests.length} deep keyboard/state scenarios.`);
  } catch (error) {
    console.error(`Interaction QA failed: ${error.stack || error.message}`);
    process.exitCode = 1;
  } finally {
    try { client?.close(); } catch (_) {}
    try { chrome.kill('SIGTERM'); } catch (_) {}
    await wait(150);
    safeRm(profileDir);
  }
})();
