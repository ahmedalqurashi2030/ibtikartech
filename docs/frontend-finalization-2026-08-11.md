# Ibtikar Tech — Frontend Finalization

Date: 2026-08-11  
Branch: `feature/competitor-analysis-preserve-original`  
Current base branch: `main`  
Latest validated code/CI commit before this documentation update: `1b62dd46c9643daae0390dcaabf9900468b1a5cf`  
Latest validated GitHub Actions run before this documentation update: `31467524022`

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

`assets/js/page-shell.js` and `assets/js/ibtikar-shell.js`

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

### Navigation accessibility corrections

The shared shell now has explicit, tested interaction behavior:

- desktop mega menus open from keyboard with `Enter`, `Space` or `ArrowDown`
- opening a mega menu moves focus into the disclosed panel immediately
- `Escape` closes the open mega menu and restores focus to its toggle
- the approved opacity/transform opening motion is preserved while the old `visibility` transition no longer delays keyboard focus
- mobile menu opens reliably from keyboard input
- mobile menu traps `Tab` / `Shift+Tab` within the open menu
- `Escape` closes the mobile menu and restores focus to the menu button
- Enter/Space activation on the mobile menu button is explicit and does not depend on browser-specific native activation timing

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

Interaction corrections completed during deep QA:

- initial state remains intentionally on service `01` instead of auto-selecting the card closest to the track center
- keyboard/button navigation state is independent from the amount of physical scrolling needed to expose an already-visible card
- `ArrowLeft` advances `01 → 02` and `ArrowRight` returns `02 → 01`
- manual pointer/wheel/touch scrolling still recalculates the nearest active service
- programmatic smooth scrolling cannot overwrite the service explicitly selected by the user while that movement is in progress

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
- legacy desktop animation compatibility guard prevents a removed library track from crashing ScrollTrigger without participating in final layout
- mobile Canvas geometry guard prevents invalid negative corner radius errors while preserving valid drawing geometry
- the decorative mobile-orbit composition is clipped at the full `#v4-mobile` section boundary so it remains visually intact inside the section without increasing document width on tablet / RTL layouts
- preview-studio sector, page-view and device controls are keyboard-tested for Enter/Space activation and ARIA-state updates

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

The multi-step form is now covered by deep interaction QA for:

- required-field blocking on step one
- next-step navigation after valid name/phone
- focus transfer to the first field of the next step
- previous-step navigation
- goal/stage validation and step-three navigation
- local-only draft storage in `localStorage`
- truthful success copy stating the request did not reach the team
- reset back to step one after saving a local draft

Legacy homepage/services fake WhatsApp/email CTAs and the old fake-success Brief UI are retired from the public experience.

`assets/js/site-config.js` uses empty values for unavailable official data instead of publishable `[TODO: ...]` strings.

## Automated QA

Permanent files:

- `.github/workflows/frontend-qa.yml`
- `scripts/static-qa.cjs`
- `scripts/browser-qa.cjs`
- `scripts/browser-qa-ci.cjs`
- `scripts/interaction-qa.cjs`

Temporary diagnostic scripts used while investigating focus behavior were removed after the permanent interaction suite passed.

GitHub Actions runs on push and pull request. The permanent order is:

1. JavaScript syntax
2. Static frontend QA
3. start local HTTP preview
4. deep interaction QA
5. 57-case responsive/browser regression QA
6. stop local preview

### Latest validated permanent-suite reference

Commit: `1b62dd46c9643daae0390dcaabf9900468b1a5cf`  
GitHub Actions run: `31467524022`

The run completed successfully after the temporary diagnostic step/file had already been removed from the branch.

### JavaScript syntax

`node --check` passed for project JS/CJS files included by the workflow.

### Static QA

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

### Deep interaction QA

`scripts/interaction-qa.cjs` launches real headless Chrome through Chrome DevTools Protocol and exercises six stateful keyboard/interaction scenarios before the broader responsive sweep.

Passed scenarios:

1. **Desktop mega menus** — Enter/ArrowDown opening, focus transfer, Escape close, focus restoration.
2. **Mobile menu** — Enter opening, focus containment, `Tab`/`Shift+Tab` wrapping, Escape close, focus restoration.
3. **FAQ** — Enter opens, Space closes, ARIA state follows visual state.
4. **Services discovery slider** — eight slides, initial `01`, ArrowLeft `01 → 02`, ArrowRight `02 → 01`.
5. **Contact flow** — validation, next/previous steps, focus transfer, local draft save, truthful success state and reset.
6. **Tharaa preview studio** — sector, page-view and device controls respond to keyboard activation and update selected/pressed state.

The keyboard emulator sends native-style Enter/Space text values through CDP to avoid false positives caused by incomplete synthetic key events.

### Headless Chrome responsive regression QA

Passed for **19 routes × 3 viewports = 57 page/viewport combinations**:

- Desktop: `1440 × 960`
- Tablet: `820 × 1180`
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

### Keyboard Tab smoke

Every one of the **57 page/viewport combinations** receives eight real `Tab` key events through Chrome DevTools Protocol.

The QA requires focus to move through at least two distinct interactive elements; the passing reference run records distinct focus progression across the tested combinations.

The dedicated deep interaction suite now extends this beyond simple Tab movement by checking Enter, Space, Escape, arrow keys, focus restoration, focus containment and state transitions on the most complex public interactions.

### Non-blocking known asset warning

`/favicon.ico` is not configured yet. The browser QA treats **only this missing favicon request** as non-blocking until the official favicon/brand asset is approved. No placeholder favicon was committed just to make CI green.

## Release gates that are still NOT complete

Passing the automated frontend QA does **not** make the site production-ready by itself. The remaining gates are:

1. Final manual keyboard/accessibility review by a human, especially reading order, visual focus quality and unusual interaction paths that automated scenarios do not cover.
2. Safari regression review.
3. Firefox regression review.
4. Lighthouse / Core Web Vitals on the final real HTTP origin/staging deployment.
5. Official favicon and social/share assets.
6. Real form endpoint / CRM connection.
7. Official company/contact data.
8. Legal review and final privacy/terms data.
9. Analytics/consent configuration if analytics are enabled.
10. Additional external client case studies only when evidence and publishing permission exist.
11. Final Tharaa commercial/product metadata: official price, purchase URL, demo URL, version, update date, documentation, changelog and license/support wording.

## Merge policy

Do not equate automated QA with authorization to merge. This branch remains a review/finalization branch until the user approves the result. Because the branch history contains many iterative finalization commits, a **squash merge** is preferred when final approval is given, provided the final diff and CI remain clean.
