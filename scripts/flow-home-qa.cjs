const { spawnSync } = require('child_process');
const fs = require('fs');

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const pages = (process.env.QA_PAGES || [
  'index.html','services.html','ecommerce.html','websites.html','brand-content.html','growth.html',
  'custom-systems.html','tharaa.html','portfolio.html','knowledge.html','about.html','contact.html',
  'store-launch.html','storefront-customization.html','store-redesign.html','product-page-optimization.html',
  'ecommerce-growth.html','ecommerce-support.html','404.html'
].join(',')).split(',').map((item) => item.trim()).filter(Boolean);

const failures = [];
const fail = (message) => failures.push(message);
const pass = (message) => console.log(`✓ ${message}`);

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

function dumpDom(page) {
  const chrome = chromePath();
  if (!chrome) throw new Error('Chrome/Chromium executable not found');
  const result = spawnSync(chrome, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--disable-dev-shm-usage',
    '--window-size=1440,960',
    '--virtual-time-budget=3200',
    '--dump-dom',
    `${baseUrl}/${page}`
  ], {
    encoding: 'utf8',
    maxBuffer: 24 * 1024 * 1024,
    timeout: 20000
  });

  if (result.error) throw result.error;
  if (result.status !== 0 || !result.stdout) {
    throw new Error(`${page}: Chrome dump-dom failed (${result.status}) ${String(result.stderr || '').slice(-500)}`);
  }
  return result.stdout;
}

const hasClass = (dom, className) => new RegExp(`class=["'][^"']*\\b${className}\\b`, 'i').test(dom);
const count = (dom, pattern) => (dom.match(pattern) || []).length;

for (const page of pages) {
  let dom = '';
  try { dom = dumpDom(page); }
  catch (error) {
    fail(error.message);
    continue;
  }

  if (!hasClass(dom, 'ibt-continuous-flow')) {
    fail(`${page}: continuous-flow class was not applied to body.`);
  }

  const hasMain = /<main\b/i.test(dom);
  const hasSection = /<section\b/i.test(dom);
  if (hasMain && hasSection && !hasClass(dom, 'ibt-flow-section')) {
    fail(`${page}: top-level sections were not classified by continuous-flow runtime.`);
  }

  if (page === 'index.html') {
    const requiredLogoFiles = [
      'salla.svg','zid.svg','shopify.svg','woocommerce.svg','wordpress.svg','custom-solutions.svg'
    ];
    requiredLogoFiles.forEach((file) => {
      if (!dom.includes(`assets/images/platforms/${file}`)) {
        fail(`index.html: platform logo missing from rendered DOM: ${file}`);
      }
    });

    const logoImageCount = count(dom, /<img[^>]+assets\/images\/platforms\//gi);
    if (logoImageCount < 12) {
      fail(`index.html: expected duplicated marquee logo images (>=12), found ${logoImageCount}.`);
    }
    if (!hasClass(dom, 'home-services-slider')) fail('index.html: homepage services section was not converted to slider mode.');
    if (!dom.includes('data-home-services-prev')) fail('index.html: previous service control missing.');
    if (!dom.includes('data-home-services-next')) fail('index.html: next service control missing.');
    if (!dom.includes('data-home-services-current')) fail('index.html: service counter missing.');

    const serviceCards = count(dom, /class=["'][^"']*services-mobile-card\b/gi);
    if (serviceCards !== 6) fail(`index.html: expected 6 homepage service cards, found ${serviceCards}.`);

    if (!/data-home-services-current[^>]*>01</i.test(dom) && !/>01<\/strong>/i.test(dom)) {
      fail('index.html: homepage services slider must initialize at 01.');
    }
  }

  pass(`flow DOM ${page}`);
}

if (failures.length) {
  console.error('\nContinuous flow / homepage experience QA failed:');
  failures.forEach((message) => console.error(`✗ ${message}`));
  process.exit(1);
}

console.log(`\n✓ Continuous flow active across ${pages.length} routes.`);
console.log('✓ Homepage platform logos and services carousel rendered in Chrome DOM.');
