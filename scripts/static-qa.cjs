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
  'article-store-launch.html',
  'article-product-page.html',
  'article-store-redesign.html',
  'about.html',
  'contact.html',
  'legal.html',
  'store-launch.html',
  'storefront-customization.html',
  'store-redesign.html',
  'product-page-optimization.html',
  'ecommerce-growth.html',
  'ecommerce-support.html',
  '404.html'
];
const finalizedFrontendPages = requiredPages.filter((file) => file !== 'portfolio.html');

// These pages started as approved standalone sources. Their large inline
// bundles must stay external so HTML remains quick to parse and assets can be
// cached between visits.
const approvedSourceAssets = {
  'index.html': ['assets/css/pages/source-home.css', 'assets/js/source-home.js'],
  'services.html': ['assets/css/pages/source-services.css', 'assets/js/source-services.js'],
  'tharaa.html': ['assets/css/pages/source-tharaa.css', 'assets/js/source-tharaa.js'],
  'product-page-optimization.html': ['assets/css/pages/source-product-page.css', 'assets/js/source-product-page.js']
};
const serviceDecisionPages = [
  'store-launch.html',
  'storefront-customization.html',
  'store-redesign.html',
  'product-page-optimization.html',
  'ecommerce-growth.html',
  'ecommerce-support.html'
];
const serviceDecisionContract = ['problems', 'fit', 'scope', 'deliverables', 'exclusions'];

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
  if (shell.includes('>المنصات<')) fail('Shared shell must not expose “المنصات” as a top-level navigation item.');
}

if (exists('404.html')) {
  const staticShell = read('404.html');
  if (!staticShell.includes('الحلول والخدمات')) fail('Static shared shell must contain combined “الحلول والخدمات” navigation.');
  if (!staticShell.includes('portfolio.html')) fail('Static shared shell must expose أعمالنا.');
  if (!staticShell.includes('knowledge.html')) fail('Static shared shell must expose المقالات.');
  if (!staticShell.includes('tharaa.html')) fail('Static shared shell must expose ثيم ثراء.');
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

function validateCssReferences(file) {
  const source = read(file);
  const refs = [...source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map((match) => match[1].trim());
  refs.forEach((value) => {
    if (!value || value.startsWith('#') || value.startsWith('%23') || /^(?:https?:|data:)/i.test(value)) return;
    const clean = value.split('#')[0].split('?')[0];
    const resolved = path.normalize(path.join(path.dirname(file), clean));
    if (!exists(resolved)) fail(`${file} references missing CSS asset: ${clean}`);
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

finalizedFrontendPages.forEach((file) => {
  if (!exists(file)) return;
  const source = read(file);

  const h1Count = (source.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) fail(`${file} must contain exactly one <h1>; found ${h1Count}.`);

  const sectionCount = (source.match(/<section\b/gi) || []).length;
  if (sectionCount > 12) fail(`${file} exceeds the frontend content budget with ${sectionCount} source sections.`);

  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(`${file} contains duplicate IDs: ${duplicateIds.join(', ')}.`);

  const emptySections = [...source.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)]
    .filter((match) => !match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim());
  if (emptySections.length) fail(`${file} contains ${emptySections.length} empty section(s).`);

  if (/data-(?:service-)?decision-(?:tab|panel)=["']results["']/i.test(source)) {
    fail(`${file} contains the retired hidden “results” decision content.`);
  }
});

Object.entries(approvedSourceAssets).forEach(([file, assets]) => {
  if (!exists(file)) return;
  const source = read(file);
  assets.forEach((asset) => {
    if (!exists(asset)) fail(`Approved source asset missing: ${asset}`);
    if (!source.includes(asset)) fail(`${file} must reference external source asset: ${asset}`);
    if (asset.endsWith('.css') && exists(asset)) validateCssReferences(asset);
  });
  if (/<style\b/i.test(source)) fail(`${file} must not restore inline <style> bundles.`);
  if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>/i.test(source)) fail(`${file} must not restore inline script bundles.`);
});

serviceDecisionPages.forEach((file) => {
  if (!exists(file)) return;
  const source = read(file);
  const tabs = [...source.matchAll(/data-(?:service-)?decision-tab=["']([^"']+)/gi)].map((match) => match[1]);
  const panels = [...source.matchAll(/data-(?:service-)?decision-panel=["']([^"']+)/gi)].map((match) => match[1]);
  if (tabs.join(',') !== serviceDecisionContract.join(',')) {
    fail(`${file} decision tabs must follow the shared five-part contract.`);
  }
  if (panels.join(',') !== serviceDecisionContract.join(',')) {
    fail(`${file} decision panels must follow the shared five-part contract.`);
  }
});

[
  'assets/css/pages/launch-readiness.css',
  'assets/js/commerce-service-detail.js',
  'assets/js/content-finalization.js',
  'assets/js/source-product-page.js'
].forEach((file) => {
  if (exists(file) && /decision-(?:tab|panel)=["']results["']/i.test(read(file))) {
    fail(`${file} still carries runtime deletion for retired results content.`);
  }
});

note(`Checked ${requiredPages.length} public HTML routes.`);
note(`Enforced final content architecture on ${finalizedFrontendPages.length} frontend routes (portfolio intentionally excluded).`);
note(`Confirmed ${retiredPages.length} retired platform pages remain deleted.`);
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
