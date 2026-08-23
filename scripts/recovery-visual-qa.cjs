const fs = require('fs');
const assert = require('assert');

const shell = fs.readFileSync('assets/css/ibtikar-shell.css', 'utf8');
const home = fs.readFileSync('index.html', 'utf8');
const servicePages = [
  'store-launch.html',
  'storefront-customization.html',
  'store-redesign.html',
  'product-page-optimization.html',
  'ecommerce-growth.html',
  'ecommerce-support.html',
];

function declarationBlock(selector) {
  const start = shell.indexOf(selector);
  assert(start >= 0, `missing shell selector: ${selector}`);
  const open = shell.indexOf('{', start);
  const close = shell.indexOf('}', open);
  assert(open >= 0 && close > open, `invalid shell block: ${selector}`);
  return shell.slice(open + 1, close);
}

const headerBlock = declarationBlock('.ibt-shell-header,');
const navBlock = declarationBlock('.ibt-shell-nav,');
const desktopNavBlock = declarationBlock('.ibt-shell-desktop-nav,');

assert(shell.includes('P0 shell consolidation'), 'canonical shell marker missing');
assert(!shell.includes('APPROVED VISUAL RECOVERY'), 'retired visual recovery layer returned');
assert(!shell.includes('V11 refined combined solutions/services header'), 'retired V11 shell layer returned');
assert(/\btop:\s*0\s*;/.test(headerBlock), 'canonical header top position missing');
assert(/border:\s*0\s*!important/.test(headerBlock), 'canonical header border reset missing');
assert(/box-shadow:\s*none\s*!important/.test(headerBlock), 'canonical header shadow reset missing');
assert(/border:\s*0\s*!important/.test(navBlock), 'canonical navigation border reset missing');
assert(/border-radius:\s*0\s*!important/.test(navBlock), 'canonical navigation radius reset missing');
assert(/background:\s*transparent\s*!important/.test(navBlock), 'canonical navigation background reset missing');
assert(/box-shadow:\s*none\s*!important/.test(navBlock), 'canonical navigation shadow reset missing');
assert(/background:\s*transparent\s*!important/.test(desktopNavBlock), 'desktop navigation canonical background missing');
assert(shell.includes('radial-gradient(circle at 5px 5px'), 'four-dot mobile trigger missing');
assert(shell.includes('body.source-home #home.hero'), 'homepage shell offset contract missing');
assert(shell.includes('body.source-home .cinematic-story__brand'), 'homepage journey brand suppression missing');
assert(shell.includes('@media (prefers-reduced-motion: reduce)'), 'reduced-motion shell guard missing');

assert(home.includes('نبني منظومة رقمية'), 'approved hero heading missing');
assert(home.includes('ابدأ بتشخيص مشروعك'), 'secondary hero CTA missing');
assert(home.includes('استكشف منظومة الحلول'), 'primary hero CTA missing');
assert(home.includes('hero-dashboard hero-system-stage'), 'two-column hero visual stage missing');
assert(!home.includes('<div class="cinematic-story__brand"><span aria-hidden="true" class="cinematic-story__mark"'), 'Journey brand badge returned');
assert(home.includes('نبني منظومة واحدة'), 'Journey heading missing');
assert(home.includes('ابدأ من هدفك، ثم نبني المنظومة المناسبة'), 'approved services heading missing');
assert(home.includes('href="tharaa.html">ثيم ثراء</a>'), 'Tharaa navigation label missing');

for (const page of servicePages) {
  const html = fs.readFileSync(page, 'utf8');
  assert(!html.includes('data-service-decision-tab="results"'), `${page}: retired results tab returned`);
  assert(!html.includes('data-service-decision-panel="results"'), `${page}: retired results panel returned`);
}

console.log('Canonical visual QA passed.');
