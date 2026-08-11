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
const continuousFlowCssPath = 'assets/css/pages/continuous-flow.css';
const continuousFlowJsPath = 'assets/js/continuous-flow.js';
const homeExperienceCssPath = 'assets/css/pages/home-experience-v2.css';
const homeExperienceJsPath = 'assets/js/home-experience-v2.js';
const platformLogoPaths = [
  'assets/images/platforms/salla.svg',
  'assets/images/platforms/zid.svg',
  'assets/images/platforms/shopify.svg',
  'assets/images/platforms/woocommerce.svg',
  'assets/images/platforms/wordpress.svg',
  'assets/images/platforms/custom-solutions.svg'
];

[
  shellPath,
  configPath,
  servicesExperiencePath,
  contentFinalizationPath,
  continuousFlowCssPath,
  continuousFlowJsPath,
  homeExperienceCssPath,
  homeExperienceJsPath,
  ...platformLogoPaths
].forEach((file) => {
  if (!exists(file)) fail(`Required runtime/asset missing: ${file}`);
});

if (exists(shellPath)) {
  const shell = read(shellPath);
  if (!shell.includes('الحلول والخدمات')) fail('Shared shell must contain combined “الحلول والخدمات” navigation.');
  if (shell.includes('>المنصات<')) fail('Shared shell must not expose “المنصات” as a top-level navigation item.');
  if (!shell.includes('portfolio.html')) fail('Shared shell must expose أعمالنا.');
  if (!shell.includes('knowledge.html')) fail('Shared shell must expose المعرفة.');
  if (!shell.includes('tharaa.html')) fail('Shared shell must expose ثيم ثراء.');
  if (!shell.includes('assets/css/pages/continuous-flow.css')) fail('Shared shell must load the continuous background stylesheet globally.');
  if (!shell.includes('assets/js/continuous-flow.js')) fail('Shared shell must load the continuous background runtime globally.');
  if (!shell.includes('assets/js/home-experience-v2.js')) fail('Shared shell must load the homepage v2 runtime on the homepage.');
}

if (exists(homeExperienceJsPath)) {
  const home = read(homeExperienceJsPath);
  platformLogoPaths.forEach((asset) => {
    if (!home.includes(asset)) fail(`Homepage platform strip must reference ${asset}.`);
  });
  if (!home.includes('home-services-slider')) fail('Homepage runtime must activate the services slider class.');
  if (!home.includes('data-home-services-prev') || !home.includes('data-home-services-next')) {
    fail('Homepage services slider must expose previous/next controls.');
  }
  if (!home.includes("event.key === 'ArrowLeft'") || !home.includes("event.key === 'ArrowRight'")) {
    fail('Homepage services slider must support keyboard arrow navigation.');
  }
}

if (exists(continuousFlowJsPath)) {
  const flow = read(continuousFlowJsPath);
  if (!flow.includes('ibt-continuous-flow')) fail('Continuous flow runtime must activate the global page class.');
  if (!flow.includes('ibt-flow-section--blend')) fail('Continuous flow runtime must classify ordinary sections.');
  if (!flow.includes('ibt-flow-section--immersive')) fail('Continuous flow runtime must preserve immersive sections.');
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

// The four approved cinematic source pages may still contain legacy demo contact
// strings in raw HTML. Runtime finalization rewrites them before public use and
// browser QA separately fails if they become visible. Keep this debt tightly
// allow-listed so no newer/public page can copy those fake contact details.
const fakeContactTokens = [
  '967000000000',
  'mailto:hello@ibtikar-tech.com',
  'mailto:support@tharaa.com',
  't.me/tharaa_theme'
];
const legacyContactSourceAllowlist = new Set([
  'index.html',
  'services.html',
  'product-page-optimization.html',
  'tharaa.html'
]);
const legacyTokenPages = [];

requiredPages.forEach((file) => {
  if (!exists(file)) return;
  const source = read(file);
  const found = fakeContactTokens.filter((token) => source.toLowerCase().includes(token.toLowerCase()));
  if (!found.length) return;
  if (!legacyContactSourceAllowlist.has(file)) {
    fail(`${file} contains forbidden fake/legacy contact token(s): ${found.join(', ')}`);
    return;
  }
  legacyTokenPages.push(file);
});

if (exists(contentFinalizationPath)) {
  const guard = read(contentFinalizationPath).toLowerCase();
  fakeContactTokens.forEach((token) => {
    if (!guard.includes(token.toLowerCase())) {
      fail(`content-finalization.js must explicitly guard legacy contact token: ${token}`);
    }
  });
  if (!guard.includes("contact.html#quote")) {
    fail('content-finalization.js must route unverified legacy contact links to contact.html#quote.');
  }
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
note(`Confirmed ${platformLogoPaths.length} local platform/logo assets for the homepage expertise strip.`);
note('Continuous background runtime and homepage carousel assets are wired through the shared shell.');
if (legacyTokenPages.length) {
  note(`Legacy demo contact tokens remain confined to approved source files: ${[...new Set(legacyTokenPages)].join(', ')}.`);
}

notes.forEach((message) => console.log(`✓ ${message}`));
if (failures.length) {
  console.error('\nStatic QA failed:');
  failures.forEach((message) => console.error(`✗ ${message}`));
  process.exit(1);
}
console.log('✓ Static QA passed.');