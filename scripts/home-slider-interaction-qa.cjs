const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const debugPort = Number(process.env.HOME_SLIDER_DEBUG_PORT || 9227);
const profileDir = path.join(process.cwd(), '.qa-home-slider-profile');

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safeRm = (target) => { try { fs.rmSync(target, { recursive:true, force:true }); } catch (_) {} };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

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
      const frameMask = buffer.slice(offset + headerLength, offset + headerLength + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ frameMask[index % 4]));
    }
    if ((first & 0x0f) === 1) messages.push(payload.toString('utf8'));
    offset = frameEnd;
  }
  return { messages, rest:buffer.slice(offset) };
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
      return new Promise((resolve) => pending.set(id, resolve));
    },
    close() { socket.destroy(); }
  };
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', { expression, returnByValue:true, awaitPromise:true });
  const result = response?.result?.result;
  if (result?.subtype === 'error') throw new Error(result.description || 'Runtime evaluation error');
  return result?.value;
}

async function key(client, keyName) {
  const map = {
    ArrowLeft:{ code:'ArrowLeft', keyCode:37 },
    ArrowRight:{ code:'ArrowRight', keyCode:39 }
  };
  const meta = map[keyName];
  await client.send('Input.dispatchKeyEvent', { type:'keyDown', key:keyName, code:meta.code, windowsVirtualKeyCode:meta.keyCode, nativeVirtualKeyCode:meta.keyCode });
  await client.send('Input.dispatchKeyEvent', { type:'keyUp', key:keyName, code:meta.code, windowsVirtualKeyCode:meta.keyCode, nativeVirtualKeyCode:meta.keyCode });
}

async function currentIndex(client) {
  return evaluate(client, `document.querySelector('[data-home-services-current]')?.textContent?.trim() || ''`);
}

(async () => {
  const executable = chromePath();
  if (!executable) {
    console.error('Chrome/Chromium executable not found. Set CHROME_PATH.');
    process.exit(75);
  }

  safeRm(profileDir);
  const chrome = spawn(executable, [
    '--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check',
    `--remote-debugging-port=${debugPort}`,`--user-data-dir=${profileDir}`,'about:blank'
  ], { stdio:'ignore' });

  let client;
  try {
    let targets;
    try { targets = await pollJson(`http://127.0.0.1:${debugPort}/json`); }
    catch (error) {
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
    await client.send('Emulation.setDeviceMetricsOverride', { width:1440, height:960, mobile:false, deviceScaleFactor:1 });
    await client.send('Page.navigate', { url:`${baseUrl}/index.html` });
    await wait(2300);

    let state = await evaluate(client, `(() => ({
      cards:document.querySelectorAll('.home-services-slider .services-mobile-card').length,
      logos:document.querySelectorAll('.platform-track img[src*="assets/images/platforms/"]').length,
      current:document.querySelector('[data-home-services-current]')?.textContent?.trim(),
      stageVisible:Boolean(document.querySelector('.home-services-slider .services-cinema__stage')?.getClientRects().length),
      trackVisible:Boolean(document.querySelector('.home-services-slider .services-mobile-track')?.getClientRects().length)
    }))()`);
    assert(state.cards === 6, `Expected 6 home service cards: ${JSON.stringify(state)}`);
    assert(state.logos >= 12, `Expected duplicated platform logo strip: ${JSON.stringify(state)}`);
    assert(state.current === '01', `Home service slider must start at 01: ${JSON.stringify(state)}`);
    assert(!state.stageVisible && state.trackVisible, `Old cinematic stage must be hidden while carousel is visible: ${JSON.stringify(state)}`);

    await evaluate(client, `document.querySelector('[data-home-services-next]')?.click()`);
    await wait(620);
    assert(await currentIndex(client) === '02', 'Next button should move 01 → 02');

    await evaluate(client, `document.querySelector('[data-home-services-prev]')?.click()`);
    await wait(620);
    assert(await currentIndex(client) === '01', 'Previous button should move 02 → 01');

    const focused = await evaluate(client, `(() => { const t=document.querySelector('.home-services-slider .services-mobile-track'); t?.focus(); return document.activeElement===t; })()`);
    assert(focused, 'Could not focus homepage service carousel');
    await key(client, 'ArrowLeft');
    await wait(620);
    assert(await currentIndex(client) === '02', 'ArrowLeft should move 01 → 02');
    await key(client, 'ArrowRight');
    await wait(620);
    assert(await currentIndex(client) === '01', 'ArrowRight should move 02 → 01');

    // Real mouse drag through CDP. The track should settle on a later card and
    // must not trigger the card navigation click after dragging.
    const rect = await evaluate(client, `(() => { const r=document.querySelector('.home-services-slider .services-mobile-track')?.getBoundingClientRect(); return r?{x:r.left,y:r.top,w:r.width,h:r.height}:null; })()`);
    assert(rect && rect.w > 500, `Carousel rect unavailable: ${JSON.stringify(rect)}`);
    const y = Math.max(60, Math.min(900, rect.y + Math.min(rect.h, 360) / 2));
    const startX = Math.min(1180, rect.x + rect.w * .72);
    const endX = Math.max(260, startX - 520);
    await client.send('Input.dispatchMouseEvent', { type:'mousePressed', x:startX, y, button:'left', buttons:1, clickCount:1 });
    await client.send('Input.dispatchMouseEvent', { type:'mouseMoved', x:endX, y, button:'left', buttons:1 });
    await client.send('Input.dispatchMouseEvent', { type:'mouseReleased', x:endX, y, button:'left', buttons:0, clickCount:1 });
    await wait(760);
    state = await evaluate(client, `(() => ({ current:document.querySelector('[data-home-services-current]')?.textContent?.trim(), path:location.pathname }))()`);
    assert(state.path.endsWith('/index.html'), `Drag must not navigate away from homepage: ${JSON.stringify(state)}`);
    assert(Number(state.current) >= 2, `Mouse drag should advance carousel: ${JSON.stringify(state)}`);

    console.log('✓ homepage services slider: controls / keyboard / mouse drag / click suppression');
  } catch (error) {
    console.error(`Homepage slider interaction QA failed: ${error.stack || error.message}`);
    process.exitCode = 1;
  } finally {
    try { client?.close(); } catch (_) {}
    try { chrome.kill('SIGTERM'); } catch (_) {}
    await wait(150);
    safeRm(profileDir);
  }
})();
