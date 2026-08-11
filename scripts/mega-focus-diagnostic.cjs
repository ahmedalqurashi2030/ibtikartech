const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
const path = require('path');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const debugPort = 9227;
const profileDir = path.join(process.cwd(), '.qa-mega-focus-profile');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safeRm = (target) => { try { fs.rmSync(target, { recursive:true, force:true }); } catch (_) {} };

function chromePath() {
  return [process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser']
    .filter(Boolean).find((candidate) => fs.existsSync(candidate));
}
async function poll(url) {
  let last;
  for (let i=0;i<60;i+=1) {
    try { const r=await fetch(url); if(r.ok) return await r.json(); throw new Error(String(r.status)); }
    catch(error){ last=error; await wait(200); }
  }
  throw last;
}
function encodeFrame(data) {
  const payload=Buffer.from(data), mask=crypto.randomBytes(4);
  let header;
  if(payload.length<126){ header=Buffer.alloc(2); header[1]=payload.length|0x80; }
  else { header=Buffer.alloc(4); header[1]=126|0x80; header.writeUInt16BE(payload.length,2); }
  header[0]=0x81;
  const masked=Buffer.alloc(payload.length);
  for(let i=0;i<payload.length;i+=1) masked[i]=payload[i]^mask[i%4];
  return Buffer.concat([header,mask,masked]);
}
function decodeFrames(buffer) {
  const messages=[]; let offset=0;
  while(offset+2<=buffer.length){
    const first=buffer[offset], second=buffer[offset+1]; let length=second&0x7f, headerLength=2;
    if(length===126){ if(offset+4>buffer.length) break; length=buffer.readUInt16BE(offset+2); headerLength=4; }
    const maskLength=(second&0x80)?4:0, end=offset+headerLength+maskLength+length;
    if(end>buffer.length) break;
    let payload=buffer.slice(offset+headerLength+maskLength,end);
    if(maskLength){ const mask=buffer.slice(offset+headerLength,offset+headerLength+4); payload=Buffer.from(payload.map((b,i)=>b^mask[i%4])); }
    if((first&0x0f)===1) messages.push(payload.toString('utf8')); offset=end;
  }
  return {messages,rest:buffer.slice(offset)};
}
function connect(wsUrl){
  const url=new URL(wsUrl), socket=net.connect(Number(url.port),url.hostname), key=crypto.randomBytes(16).toString('base64');
  let handshake='',rest=Buffer.alloc(0),connected=false,nextId=1; const pending=new Map();
  socket.on('data',(chunk)=>{
    if(!connected){ handshake+=chunk.toString('binary'); const end=handshake.indexOf('\r\n\r\n'); if(end===-1)return; connected=true; rest=Buffer.from(handshake.slice(end+4),'binary'); }
    else rest=Buffer.concat([rest,chunk]);
    const decoded=decodeFrames(rest); rest=decoded.rest;
    decoded.messages.forEach((message)=>{ const data=JSON.parse(message); if(data.id&&pending.has(data.id)){ pending.get(data.id)(data); pending.delete(data.id); } });
  });
  socket.write([`GET ${url.pathname}${url.search} HTTP/1.1`,`Host: ${url.host}`,'Upgrade: websocket','Connection: Upgrade',`Sec-WebSocket-Key: ${key}`,'Sec-WebSocket-Version: 13','\r\n'].join('\r\n'));
  return { send(method,params={}){ const id=nextId++; socket.write(encodeFrame(JSON.stringify({id,method,params}))); return new Promise((resolve)=>pending.set(id,resolve)); }, close(){socket.destroy();} };
}
async function evaluate(client, expression){
  const r=await client.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  return r?.result?.result?.value;
}
async function megaSnapshot(client,label){
  const state=await evaluate(client,`(() => {
    const t=document.querySelector('[data-ibt-mega-toggle][aria-controls="solutionsServicesMega"]');
    const m=document.getElementById('solutionsServicesMega');
    const f=m?.querySelector('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
    const a=document.activeElement;
    const desc=(el)=>el?{tag:el.tagName,id:el.id||'',cls:String(el.className||''),href:el.getAttribute?.('href')||'',text:String(el.textContent||'').trim().slice(0,70),tabIndex:el.tabIndex,inert:el.hasAttribute?.('inert')||false}:null;
    return {expanded:t?.getAttribute('aria-expanded'),menuOpen:m?.classList.contains('is-open'),menuHidden:m?.getAttribute('aria-hidden'),menuInert:m?.hasAttribute('inert'),active:desc(a),first:desc(f),activeIsToggle:a===t,activeInsideMenu:m?.contains(a)};
  })()`);
  console.log(`${label}: ${JSON.stringify(state)}`);
}
async function mobileSnapshot(client,label){
  const state=await evaluate(client,`(() => {
    const t=document.querySelector('.ibt-shell-menu-toggle[data-ibt-menu-toggle][aria-controls="ibtikarMobileMenu"]');
    const m=document.getElementById('ibtikarMobileMenu');
    const a=document.activeElement;
    return {expanded:t?.getAttribute('aria-expanded'),menuOpen:m?.classList.contains('open'),menuHidden:m?.getAttribute('aria-hidden'),bodyOpen:document.body.classList.contains('menu-open'),activeTag:a?.tagName,activeClass:String(a?.className||''),activeIsToggle:a===t,activeInsideMenu:m?.contains(a)};
  })()`);
  console.log(`${label}: ${JSON.stringify(state)}`);
}

(async()=>{
  const executable=chromePath(); if(!executable){console.error('Chrome missing');process.exit(75);}
  safeRm(profileDir);
  const chrome=spawn(executable,['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profileDir}`,'about:blank'],{stdio:'ignore'});
  let client;
  try{
    const targets=await poll(`http://127.0.0.1:${debugPort}/json`), page=targets.find((t)=>t.type==='page');
    client=connect(page.webSocketDebuggerUrl); await wait(120); await client.send('Page.enable'); await client.send('Runtime.enable');

    await client.send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,mobile:false,deviceScaleFactor:1});
    await client.send('Page.navigate',{url:`${baseUrl}/index.html`}); await wait(1900);
    await evaluate(client,`(() => { const t=document.querySelector('[data-ibt-mega-toggle][aria-controls="solutionsServicesMega"]'); t.focus(); return true; })()`);
    await megaSnapshot(client,'mega-before');
    const enter={key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13};
    await client.send('Input.dispatchKeyEvent',{type:'keyDown',...enter});
    await wait(20); await megaSnapshot(client,'mega-after-keydown');
    await client.send('Input.dispatchKeyEvent',{type:'keyUp',...enter});
    await wait(50); await megaSnapshot(client,'mega-after-keyup');

    await client.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,mobile:true,deviceScaleFactor:1});
    await client.send('Page.navigate',{url:`${baseUrl}/index.html`}); await wait(1900);
    await evaluate(client,`(() => { const t=document.querySelector('.ibt-shell-menu-toggle[data-ibt-menu-toggle][aria-controls="ibtikarMobileMenu"]'); t.focus(); return true; })()`);
    await mobileSnapshot(client,'mobile-before');
    await client.send('Input.dispatchKeyEvent',{type:'keyDown',...enter,text:'\r',unmodifiedText:'\r'});
    await wait(20); await mobileSnapshot(client,'mobile-after-keydown');
    await client.send('Input.dispatchKeyEvent',{type:'keyUp',...enter});
    await wait(120); await mobileSnapshot(client,'mobile-after-keyup');
  }catch(error){console.error(error.stack||error.message);process.exitCode=1;}
  finally{try{client?.close();}catch(_){} try{chrome.kill('SIGTERM');}catch(_){} await wait(100);safeRm(profileDir);}
})();
