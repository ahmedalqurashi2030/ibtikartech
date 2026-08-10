const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const net = require("net");
const path = require("path");

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = Number(process.env.DEBUG_PORT || 9222);
const targetUrl = process.env.TARGET_URL || "http://127.0.0.1:4173/";
const profileDir = path.join(process.cwd(), ".codex-chrome-profile");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeRm(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch {
    // Chrome can keep Crashpad files locked briefly after exit on Windows.
  }
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function pollJson(url, tries = 40) {
  let lastError;
  for (let i = 0; i < tries; i += 1) {
    try {
      return await getJson(url);
    } catch (error) {
      lastError = error;
      await wait(250);
    }
  }
  throw lastError;
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
    if ((first & 0x0f) === 1) messages.push(payload.toString("utf8"));
    offset = frameEnd;
  }
  return { messages, rest: buffer.slice(offset) };
}

function connectWebSocket(wsUrl, onEvent) {
  const url = new URL(wsUrl);
  const socket = net.connect(Number(url.port), url.hostname);
  const key = crypto.randomBytes(16).toString("base64");
  let handshake = "";
  let rest = Buffer.alloc(0);
  let connected = false;
  const pending = new Map();
  let nextId = 1;

  socket.on("data", (chunk) => {
    if (!connected) {
      handshake += chunk.toString("binary");
      const end = handshake.indexOf("\r\n\r\n");
      if (end === -1) return;
      connected = true;
      const leftover = Buffer.from(handshake.slice(end + 4), "binary");
      rest = Buffer.concat([rest, leftover]);
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
      } else if (data.method) {
        onEvent(data);
      }
    });
  });

  socket.write([
    `GET ${url.pathname}${url.search} HTTP/1.1`,
    `Host: ${url.host}`,
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Key: ${key}`,
    "Sec-WebSocket-Version: 13",
    "\r\n"
  ].join("\r\n"));

  return {
    send(method, params = {}) {
      const id = nextId++;
      socket.write(encodeFrame(JSON.stringify({ id, method, params })));
      return new Promise((resolve) => pending.set(id, resolve));
    },
    close() {
      socket.destroy();
    }
  };
}

async function runViewport(client, viewport, consoleMessages) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile
  });
  await client.send("Page.navigate", { url: targetUrl });
  await wait(4200);
  const metrics = await client.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
    try {
      const overflowers = [...document.querySelectorAll('body *')].map((el) => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName.toLowerCase(), className: String(el.getAttribute('class') || ''), id: el.id || '', width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right) };
      }).filter((item) => item.right > innerWidth + 1 || item.left < -1 || item.width > innerWidth + 1).slice(0, 12);
      let mobileMenuWorks = false;
      const menuToggle = document.querySelector('[data-ibt-menu-toggle]');
      const mobileMenuEl = document.querySelector('[data-mobile-menu]');
      if (menuToggle && mobileMenuEl) {
        menuToggle.click();
        mobileMenuWorks = mobileMenuEl.classList.contains('open') || mobileMenuEl.classList.contains('is-open') || getComputedStyle(mobileMenuEl).display !== 'none';
        mobileMenuEl.classList.remove('open', 'is-open');
        mobileMenuEl.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
      const megaToggles = [...document.querySelectorAll('[data-ibt-mega-toggle]')];
      let megaMenuWorks = false;
      let megaMenuOpenedCount = 0;
      megaToggles.forEach((toggle) => {
        const menu = document.getElementById(toggle.getAttribute('aria-controls'));
        if (!menu) return;
        toggle.click();
        const opened = menu.classList.contains('is-open') || getComputedStyle(menu).visibility === 'visible';
        if (opened) megaMenuOpenedCount += 1;
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
      });
      megaMenuWorks = megaToggles.length > 0 && megaMenuOpenedCount === megaToggles.length;
      const megaLinks = [...document.querySelectorAll('[data-ibt-mega-root] > .ibt-shell-nav-link')];
      let megaLinkOpenedCount = 0;
      megaLinks.forEach((link) => {
        const root = link.closest('[data-ibt-mega-root]');
        const toggle = root?.querySelector('[data-ibt-mega-toggle]');
        const menu = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
        if (!menu) return;
        link.click();
        const opened = menu.classList.contains('is-open') || getComputedStyle(menu).visibility === 'visible';
        if (opened) megaLinkOpenedCount += 1;
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
      });
      const megaLinkWorks = megaLinks.length > 0 && megaLinkOpenedCount === megaLinks.length;
      return {
        title: document.title,
        width: innerWidth,
        height: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        header: Boolean(document.querySelector('[data-site-header]')),
        mega: Boolean(document.querySelector('[data-mega-menu]')),
        mobileMenu: Boolean(document.querySelector('[data-mobile-menu]')),
        footer: Boolean(document.querySelector('footer.site-footer')),
        visibleText: document.body.innerText.includes('ابتكار تك'),
        mobileMenuWorks,
        megaMenuWorks,
        megaMenuOpenedCount,
        megaLinkWorks,
        megaLinkOpenedCount,
        noStoryMotion: document.documentElement.classList.contains('no-story-motion'),
        cinematicFallbackVisible: Boolean(document.querySelector('.cinematic-story__fallback')) && getComputedStyle(document.querySelector('.cinematic-story__fallback')).display !== 'none',
        overflowers
      };
    } catch (error) {
      return { evalError: error.message, title: document.title, width: innerWidth, height: innerHeight };
    }
  })()`
  });
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false
  });
  const file = `.codex-${viewport.name}.png`;
  fs.writeFileSync(path.join(process.cwd(), file), Buffer.from(screenshot.result.data, "base64"));
  return {
    viewport: viewport.name,
    metrics: metrics.result.result.value,
    consoleMessages: [...consoleMessages]
  };
}

(async () => {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`);
  safeRm(profileDir);
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ], { stdio: "ignore" });

  try {
    await pollJson(`http://127.0.0.1:${debugPort}/json/version`);
    const targets = await pollJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page = targets.find((item) => item.type === "page");
    if (!page) throw new Error("No page target found");

    const consoleMessages = [];
    const client = connectWebSocket(page.webSocketDebuggerUrl, (event) => {
      if (event.method === "Runtime.consoleAPICalled") {
        consoleMessages.push({
          type: event.params.type,
          text: event.params.args.map((arg) => arg.value || arg.description || "").join(" ")
        });
      }
      if (event.method === "Runtime.exceptionThrown") {
        const details = event.params.exceptionDetails;
        consoleMessages.push({
          type: "exception",
          text: details.exception?.description || details.exception?.value || details.text,
          url: details.url,
          lineNumber: details.lineNumber,
          columnNumber: details.columnNumber
        });
      }
      if (event.method === "Network.responseReceived" && event.params.response.status >= 400) {
        consoleMessages.push({
          type: "network",
          status: event.params.response.status,
          text: event.params.response.url
        });
      }
      if (event.method === "Log.entryAdded") {
        consoleMessages.push({
          type: event.params.entry.level,
          text: event.params.entry.text
        });
      }
    });

    await wait(300);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Log.enable");
    await client.send("Network.enable");

    const results = [];
    for (const viewport of [
      { name: "desktop", width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
      { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
    ]) {
      consoleMessages.length = 0;
      results.push(await runViewport(client, viewport, consoleMessages));
    }

    client.close();
    console.log(JSON.stringify(results, null, 2));
  } finally {
    chrome.kill();
    await wait(500);
    safeRm(profileDir);
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});










