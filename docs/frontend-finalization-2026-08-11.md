# Ibtikar Tech — Frontend Finalization

Date: 2026-08-11
Branch: `feature/competitor-analysis-preserve-original`
Base: `main@2860b24f65bf4893047f61c31d207f002277b4b4`

## Goal

Finish the public-facing frontend system without replacing the approved cinematic source pages, while making navigation, category pages, ecommerce service discovery, service-detail pages, responsive behavior, accessibility and runtime behavior consistent.

## Preservation rule

The approved/source-owned compositions remain source-owned. The finalization work is additive or narrowly corrective around them. The original home, services, product-page-optimization and Tharaa experiences are not rewritten as generic templates.

## Primary public routes

- `index.html` — homepage / master brand
- `services.html` — solutions + services discovery
- `ecommerce.html` — ecommerce category hub
- `websites.html` — websites category hub
- `brand-content.html` — brand + content category hub
- `growth.html` — growth category hub
- `custom-systems.html` — systems + automation category hub
- `tharaa.html` — Tharaa product page
- `portfolio.html` — case-study framework / works
- `knowledge.html` — knowledge hub
- `about.html` — company
- `contact.html` — structured quote/support entry
- `legal.html` — legal draft shell
- `404.html` — error/recovery page

### Ecommerce service-detail routes

- `store-launch.html`
- `storefront-customization.html`
- `store-redesign.html`
- `product-page-optimization.html`
- `ecommerce-growth.html`
- `ecommerce-support.html`

All six ecommerce cards are routed to service-level decision pages at runtime. Each detail route uses scope-first language and avoids unverified numeric pricing, durations, reviews or commercial guarantees.

## Retired routes for this phase

Standalone platform pages were intentionally removed and can be reintroduced later when each platform has enough unique commercial/SEO value:

- `salla.html`
- `zid.html`
- `shopify.html`
- `woocommerce.html`
- `wordpress.html`

Platform expertise remains visible contextually in ecommerce and service content. Retired links are redirected/re-written to the relevant parent service context by `frontend-final.js`.

## Shared navigation

`assets/js/page-shell.js`

Desktop header:

1. الرئيسية
2. الحلول والخدمات (combined mega menu)
3. منتجاتنا
4. أعمالنا
5. المعرفة
6. عن ابتكار
7. اطلب عرض سعر

There is no standalone Platforms item in the header/mobile menu.

The footer keeps platform names as expertise labels and points visitors to the ecommerce platform context rather than deleted platform pages.

## Final design layer

`assets/css/pages/frontend-final.css`

Adds:

- page-specific accent language without fragmenting the master brand
- premium inner-page hero treatment
- improved header/footer visual hierarchy
- progress indicator for long inner pages
- better focus states and touch targets
- editorial hardware framing around source visuals
- upgraded capability cards and section rhythm
- improved CTA surfaces
- responsive footer/contact/legal/404 refinements
- reduced-motion handling

`assets/css/pages/category-signatures.css`

Gives each primary service category a different signature scene instead of repeating one template visually:

- Websites → Website Architecture Lab
- Brand + Content → Brand System Studio
- Growth → Measurement Loop
- Systems → Workflow Architecture

These are abstract explanatory UI scenes, not presented as client screenshots or results.

## Ecommerce experience

The ecommerce category remains the deepest service-category experience and includes:

- state-based entry
- Commerce Health Lab
- performance comparison
- Store Anatomy
- six visual subservices
- platform context
- Tharaa product cross-sell
- product-page spotlight
- process/deliverables/FAQ/CTA

The platform section no longer claims that every platform has a dedicated page in this phase.

## Runtime hardening

### `assets/js/app.js`

- rAF-throttled header scroll work
- Canvas loop prevents duplicate RAF scheduling
- Canvas pauses when outside viewport or document is hidden
- form validation + explicit local-only preview behavior
- localStorage failure handling
- contact wizard resets to step 1 after successful local save
- reduced-motion support

### `assets/js/ibtikar-shell.js`

- navigation label remains a real link; arrow controls mega menu
- Escape closes mega/menu and restores focus
- keyboard focus leaving a mega group closes it
- mobile focus trap
- one mobile details group open at a time
- background scroll locked while mobile menu is open
- theme storage guarded against unavailable localStorage

### `assets/js/frontend-final.js`

- stale retired-platform route rewriting
- MutationObserver also catches links injected after initial load
- ecommerce card → service-detail routing
- category-specific signature scenes
- category local navigation + active section state
- lazy/async image hints below first-view content
- scroll-margin management for fixed navigation

## Content integrity

The frontend deliberately does not invent:

- company email/phone/WhatsApp/address
- client logos/testimonials/case-study results
- fixed service prices or delivery durations
- Tharaa official price/demo/purchase/version/update/changelog URLs
- analytics IDs
- legal identity/details

`legal.html` no longer publishes the unverified `hello@ibtikar-tech.com` address as a contact method.

## What was browser-tested previously

Historical Phase 1 QA in `design-qa.md` covered the four approved source pages on Chrome desktop/mobile and passed the then-current P0/P1/P2 checks. That evidence predates this finalization pass.

## What is verified in this finalization pass

- GitHub branch changes are isolated from `main`.
- Removed platform routes appear as removed in the branch comparison.
- New ecommerce detail routes are committed.
- Shared shell/runtime/design files are committed and linked from the shared shell.
- Known retired platform links are handled in the final runtime, including dynamically injected legacy content.
- Legal contact copy no longer exposes an unapproved email address.

## Required release certification before production merge

The following are **not** marked passed by this document:

1. Fresh browser render QA after this finalization pass at desktop/tablet/mobile widths.
2. Horizontal overflow scan on every public route.
3. Keyboard-only traversal on every route and interactive component.
4. Browser console error scan.
5. Broken-link/resource scan against the final branch output.
6. Lighthouse / Core Web Vitals run on a real HTTP origin.
7. Safari + Firefox regression pass.
8. Real form endpoint / CRM connection.
9. Official company/contact data.
10. Legal review.
11. Analytics/consent configuration if analytics are enabled.
12. Real portfolio/case-study content when approved.
13. Final Tharaa commercial/product metadata.

## Environment limitation during finalization

A fresh local clone/browser certification could not be run from the current execution container because DNS resolution for `github.com` failed. This is an environment limitation, not a QA pass. Do not merge to `main` on the basis of this document alone; run the release certification gates above when the branch can be served locally or in staging.
