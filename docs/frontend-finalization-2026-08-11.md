# Ibtikar Tech — Frontend Finalization

Date: 2026-08-11  
Branch: `feature/competitor-analysis-preserve-original`  
Current base branch: `main`  
QA reference commit: `9e8361aee7bcf560b46548d33966a30739b1015a`

## Goal

Finish the public-facing frontend system without replacing the approved cinematic source pages, while making navigation, category pages, ecommerce service discovery, service-detail pages, content integrity, responsive behavior, accessibility safeguards and runtime behavior consistent.

## Preservation rule

The approved/source-owned compositions remain source-owned. Finalization is additive or narrowly corrective around them. The original homepage, solutions/services page, product-page optimization page and Tharaa experience are preserved rather than rewritten as generic templates.

## Public route architecture

Primary routes:

- `index.html` — homepage / master brand
- `services.html` — solutions + services discovery
- `ecommerce.html` — ecommerce category hub
- `websites.html` — websites category hub
- `brand-content.html` — brand + content category hub
- `growth.html` — visibility + measurement + growth category hub
- `custom-systems.html` — systems + automation category hub
- `tharaa.html` — Tharaa product page
- `portfolio.html` — works / case studies
- `knowledge.html` — practical knowledge hub
- `about.html` — company page
- `contact.html` — project brief preview
- `404.html` — error/recovery page

Ecommerce service-detail routes:

- `store-launch.html`
- `storefront-customization.html`
- `store-redesign.html`
- `product-page-optimization.html`
- `ecommerce-growth.html`
- `ecommerce-support.html`

Draft-only route:

- `legal.html` — remains `noindex` and excluded from shared navigation until official legal/company data is approved.

## Retired platform routes

Standalone platform pages remain intentionally deleted:

- `salla.html`
- `zid.html`
- `shopify.html`
- `woocommerce.html`
- `wordpress.html`

Platform expertise appears contextually inside ecommerce/services. Legacy links are defensively rewritten to the appropriate current route instead of recreating thin platform pages.

## Shared navigation

`assets/js/page-shell.js`

Current public header:

1. الرئيسية
2. الحلول والخدمات
3. منتجاتنا
4. أعمالنا
5. المعرفة
6. عن ابتكار
7. ابدأ مشروعك

Rules:

- `الحلول والخدمات` stays one combined top-level item.
- There is no standalone top-level `المنصات` item.
- Products currently expose only `ثيم ثراء`.
- Footer platform names are expertise/context labels, not standalone platform-page promises.

## Services experience

The approved cinematic service experience remains intact.

`assets/js/services-experience.js` now provides two intentionally different layers:

### Main cinematic families

1. المتاجر الإلكترونية → `ecommerce.html`
2. المواقع وصفحات الهبوط → `websites.html`
3. التطبيقات والأنظمة المخصصة → `custom-systems.html#apps`
4. الهوية والمحتوى → `brand-content.html`
5. الظهور والقياس والنمو → `growth.html`
6. الربط والأتمتة → `custom-systems.html#automation`

### Fast discovery slider

Eight concrete services are shown without duplicating the six main families:

1. إطلاق متجر إلكتروني
2. تخصيص واجهة المتجر
3. إعادة تصميم متجر قائم
4. تحسين صفحة المنتج
5. موقع أو صفحة هبوط
6. هوية ومحتوى رقمي
7. SEO وقياس وتحسين
8. ربط وأتمتة العمليات

The slider supports native scrolling/touch, pointer drag, keyboard arrows and direct service links.

## Ecommerce architecture

`المتاجر الإلكترونية` is the deepest productized service category.

The six subservices each route to a dedicated decision page with:

- problem/context
- expected result
- fit / no-fit
- scope
- deliverables
- exclusions
- process
- inputs/dependencies
- CTA

Pricing, timing and commercial commitments remain scope-first rather than invented.

The platform section describes platform context only and no longer claims dedicated platform pages exist or are planned as part of the current public architecture.

## Tharaa

Tharaa remains a product under Ibtikar Tech.

Preserved:

- original cinematic product presentation
- interactive previews
- mobile experience
- feature/component presentation
- customization studio

Finalization additions/guards:

- sector-fit positioning
- launch recipes
- unsupported generic comparison/support placeholders hidden
- no fake price, purchase link, version, update date, support channel or changelog
- legacy desktop animation compatibility guard prevents a removed library track from crashing ScrollTrigger
- mobile Canvas geometry guard prevents invalid negative corner radius errors while preserving valid drawing geometry

## Works and knowledge

### `portfolio.html`

No longer an empty placeholder. It contains the first documented internal case study for **ثيم ثراء**, explaining challenge, product decisions, experience decisions and technical foundation without inventing sales/conversion results.

### `knowledge.html`

No longer an empty content framework. It contains practical decision guides covering:

- customization vs redesign
- store-launch preparation
- product-page review
- measurement before GA4/GTM
- first-screen requirements for company websites

Both routes are public/indexable and restored to shared navigation.

## Contact and content integrity

`contact.html` remains a preview-only project brief until a real intake backend is connected.

Current behavior:

- `noindex,follow`
- submit action is labeled `حفظ مسودة الطلب`
- data is stored locally on the current device only
- success copy explicitly says the request has **not** reached Ibtikar Tech
- no official email/phone/WhatsApp is invented

Legacy homepage/services fake WhatsApp/email CTAs and the old fake-success Brief UI are retired from the public experience.

`assets/js/site-config.js` uses empty values for unavailable official data instead of publishable `[TODO: ...]` strings.

## Automated QA added in this finalization pass

Files:

- `.github/workflows/frontend-qa.yml`
- `scripts/static-qa.cjs`
- `scripts/browser-qa.cjs`
- `scripts/browser-qa-ci.cjs`

GitHub Actions runs on push and pull request.

### Passed on `9e8361aee7bcf560b46548d33966a30739b1015a`

#### JavaScript syntax

`node --check` passed for project JS/CJS files included by the workflow.

#### Static QA

Passed checks include:

- 19 public HTML routes exist
- five retired platform pages remain deleted
- known accidental temporary files are absent
- core shared navigation architecture is present
- no publishable `[TODO: ...]` values in site config
- no known fake WhatsApp number in site config
- required service-discovery routing exists
- referenced root-page CSS/JS/image assets checked by the script exist
- public routes have a non-empty title and meta description

#### Headless Chrome regression QA

Passed for **19 routes × 2 viewports = 38 page/viewport combinations**:

- Desktop: `1440 × 960`
- Mobile: `390 × 844`

Routes covered:

- homepage
- solutions/services
- ecommerce
- websites
- brand/content
- growth
- systems/automation
- Tharaa
- works
- knowledge
- about
- contact
- all six ecommerce service-detail pages
- 404

Runtime checks include:

- one H1 per tested route
- shared header/footer visible
- document-level horizontal overflow check
- visible fake contact-link check
- visible retired-platform-link check
- visible TODO-text check
- duplicate-ID check
- legacy homepage Brief/WhatsApp visibility check
- browser runtime exception scan
- error/network response scan
- services cinematic + eight-card discovery checks
- contact local-draft/noindex checks
- works/knowledge indexability checks
- Tharaa unsupported-placeholder visibility checks
- product-page related-route checks

### Non-blocking known asset warning

`/favicon.ico` is not configured yet. The browser QA treats **only this missing favicon request** as non-blocking until the official favicon/brand asset is approved. No placeholder favicon was committed just to make CI green.

## Release gates that are still NOT complete

Passing the automated frontend QA does **not** make the site production-ready by itself. The remaining gates are:

1. Tablet-specific visual review in addition to the tested desktop/mobile widths.
2. Manual keyboard-only traversal of all complex interactive components and focus order.
3. Safari regression review.
4. Firefox regression review.
5. Lighthouse / Core Web Vitals on the final real HTTP origin/staging deployment.
6. Official favicon and social/share assets.
7. Real form endpoint / CRM connection.
8. Official company/contact data.
9. Legal review and final privacy/terms data.
10. Analytics/consent configuration if analytics are enabled.
11. Additional external client case studies only when evidence and publishing permission exist.
12. Final Tharaa commercial/product metadata: official price, purchase URL, demo URL, version, update date, documentation, changelog and license/support wording.

## Merge policy

Do not equate automated QA with authorization to merge. This branch remains a review/finalization branch until the user approves the result. Because the branch history contains many iterative finalization commits, a **squash merge** is preferred when final approval is given, provided the final diff and CI remain clean.
