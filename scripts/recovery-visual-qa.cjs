const fs = require('fs');
const assert = require('assert');

const shell = fs.readFileSync('assets/css/ibtikar-shell.css', 'utf8');
const home = fs.readFileSync('index.html', 'utf8');
const recovered = shell.slice(shell.indexOf('APPROVED VISUAL RECOVERY'));
const servicePages = [
  'store-launch.html',
  'storefront-customization.html',
  'store-redesign.html',
  'product-page-optimization.html',
  'ecommerce-growth.html',
  'ecommerce-support.html',
];

assert(shell.includes('APPROVED VISUAL RECOVERY 2026-08-20'), 'recovery shell marker missing');
assert(shell.match(/APPROVED VISUAL RECOVERY 2026-08-20/g)?.length === 1, 'recovery shell must exist exactly once');
assert(shell.includes('radial-gradient(circle at 5px 5px'), 'four-dot mobile trigger missing');
assert(/\.ibt-shell-nav[\s\S]*?border:\s*0\s*!important/.test(recovered), 'header border recovery missing');
assert(/\.ibt-shell-nav[\s\S]*?box-shadow:\s*none\s*!important/.test(recovered), 'header shadow recovery missing');
assert(/\.ibt-shell-desktop-nav[\s\S]*?background:\s*transparent\s*!important/.test(recovered), 'desktop navigation recovery missing');
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

console.log('Recovery visual QA: 20/20 passed');
