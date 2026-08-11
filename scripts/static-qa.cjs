const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
const notes = [];
const fail = (message) => failures.push(message);
const note = (message) => notes.push(message);
const exists = (relative) => fs.existsSync(path.join(root, relative));
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const requiredPages = [
  'index.html',
  'services.html',
  'ecommerce.html',
  'websites.html',
  'brand-content.html',
  'growth.html',
  'custom-systems.html',
  'tharaa.html',
  'portfolio.html',
  'knowledge.html',
  'about.html',
  'contact.html',
  'store-launch.html',
  'storefront-customization.html',
  'store-redesign.html',
  'product-page-optimization.html',
  'ecommerce-growth.html',
  'ecommerce-support.html',
  '404.html'
];

const retiredPages = ['salla.html', 'zid.html', 'shopify.html', 'woocommerce.html', 'wordpress.html'];
const accidentalFiles = ['NEVER', 'THIS_SHOULD_NOT_BE_CREATED', 'THIS_SHOULD_NOT_EXIST', 'TEMP_MERGE_MARKER', 'README_SYNC_TEMP', 'UNWANTED'];

requiredPages.forEach((file) => {
  if (!exists(file)) fail(`Required page missing: ${file}`);
});
retiredPages.forEach((file) => {
  if (exists(file)) fail(`Retired platform page unexpectedly exists: ${file}`);
});
accidentalFiles.forEach((file) => {
  if (exists(file)) fail(`Temporary file must not exist: ${file}`);
});

const shellPath = 'assets/js/page-shell.js';
const configPath = 'assets/js/site-config.js';
const servicesExperiencePath = 'assets/js/services-experience.js';
const contentFinalizationPath = 'assets/js/content-finalization.js';

[shellPath, configPath, servicesExperiencePath, contentFinalizationPath].forEach((file) => {
  if (!exists(file)) fail(`Required runtime missing: ${file}`);
});

if (exists(shellPath)) {
  const shell = read(shellPath);
  if (!shell.includes('الحلول والخدمات')) fail('Shared shell must contain combined “الحلول والخدمات” navigation.');
  if (shell.includes('>المنصات<')) fail('Shared shell must not expose “المنصات” as a top-level navigation item.');
  if (!shell.includes('portfolio.html')) fail('Shared shell must expose أعمالنا.');
  if (!shell.includes('knowledge.html')) fail('Shared shell must expose المعرفة.');
  if (!shell.includes('tharaa.html')) fail('Shared shell must expose ثيم ثراء.');
}

if (exists(configPath)) {
  const config = read(configPath);
  if (config.includes('[TODO:')) fail('site-config.js contains publishable TODO placeholder text.');
  if (config.includes('967000000000')) fail('site-config.js contains the known fake WhatsApp number.');
}

if (exists(servicesExperiencePath)) {
  const code = read(servicesExperiencePath);
  const discoveryCount = (code.match(/family:'/g) || []).length;
  if (discoveryCount !== 8) fail(`Expected 8 fast-discovery services, found ${discoveryCount}.`);
  if (!code.includes("custom-systems.html#apps")) fail('Services cinema must deep-link the apps/systems family.');
  if (!code.includes("custom-systems.html#automation")) fail('Services cinema must deep-link the automation family.');
}

function validateAssetReferences(file) {
  const source = read(file);
  const refs = [];
  const attrRe = /\b(?:src|href)=["']([^"']+)["']/gi;
  let match;
  while ((match = attrRe.exec(source))) refs.push(match[1]);

  refs.forEach((raw) => {
    const value = raw.trim();
    if (!value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return;
    const clean = value.split('#')[0].split('?')[0];
    if (!clean) return;
    const ext = path.extname(clean).toLowerCase();
    if (!['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'].includes(ext)) return;
    const resolved = path.normalize(path.join(path.dirname(file), clean));
    if (!exists(resolved)) fail(`${file} references missing asset: ${clean}`);
  });
}

requiredPages.forEach((file) => {
  if (!exists(file)) return;
  validateAssetReferences(file);
  const source = read(file);
  if (!/<title>[^<]+<\/title>/i.test(source)) fail(`${file} is missing a non-empty <title>.`);
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(source) &&
      !/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(source)) {
    fail(`${file} is missing a non-empty meta description.`);
  }
});

note(`Checked ${requiredPages.length} public HTML routes.`);
note(`Confirmed ${retiredPages.length} retired platform pages remain deleted.`);

notes.forEach((message) => console.log(`✓ ${message}`));
if (failures.length) {
  console.error('\nStatic QA failed:');
  failures.forEach((message) => console.error(`✗ ${message}`));
  process.exit(1);
}
console.log('✓ Static QA passed.');
