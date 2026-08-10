# Phase 1 Design QA

Date: 2026-08-09

## Scope and source of truth

Only the four approved files under `الصفحات الاساسية` were used as visual sources:

- `Ibtikar_Tech_Homepage_Cinematic_Native_Fixed.html` -> `index.html`
- `ai_studio_code - 2026-07-30T040101.270.html` -> `services.html`
- `Ibtikar_Tech_Product_Page_Optimization-2.html` -> `product-page-optimization.html`
- `Ibtikar_Tech_Tharaa_Theme_Page_Final_CTA_Replaced.html` -> `tharaa.html`

No file under `reference` was used. SHA-256 checks confirm that all four approved source files are unchanged.

## Capture setup

- Browser: local Chrome via DevTools Protocol.
- Desktop viewport: 1440 x 1000 CSS pixels, device scale factor 1.
- Mobile viewport: 390 x 844 CSS pixels, device scale factor 2.
- State: motion allowed, page settled, the full document scrolled to activate source interactions/reveals, then returned to the top.
- Full-page source captures: `artifacts/phase1-full-source/`.
- Full-page implementation captures: `artifacts/phase1-full-implementation/`.
- Combined source/final comparison sheets: `artifacts/phase1-full-comparisons/`.
- Focused first-viewport comparisons: `artifacts/phase1-comparisons/`.

The mobile Tharaa source capture is 1168 pixels wide because the approved source itself overflows horizontally. The final capture is 780 pixels wide (390 CSS pixels at 2x), confirming that the overflow repair contains the page without changing its composition.

## Full-view comparison

Each comparison sheet places the approved source on the left and the final implementation on the right, sampling the top, 25%, 50%, 75%, and bottom of the full document:

- `home-desktop.jpg`, `home-mobile.jpg`
- `services-desktop.jpg`, `services-mobile.jpg`
- `product-page-optimization-desktop.jpg`, `product-page-optimization-mobile.jpg`
- `tharaa-desktop.jpg`, `tharaa-mobile.jpg`

The hero, section order, cards, imagery/mockups, sliders, layouts, text-image balance, and page-specific visual rhythm remain source-faithful. Intentional differences are limited to the unified Header/Footer/navigation system and the approved technical fixes below.

## Findings and iteration history

1. Resolved — shared shell could appear late on pages with blocking CDN scripts. The shell now loads immediately after its header slot, and the footer uses a MutationObserver fallback.
2. Resolved — Tharaa mobile comparison rows used a 620px minimum width, causing real document overflow. The same three-column composition is retained with contained widths and mobile-safe wrapping.
3. Resolved — the homepage Canvas rounded-rectangle helper could receive negative dimensions and throw an `IndexSizeError`. Negative dimensions are normalized and radius is clamped to zero or greater; no DOM or CSS composition changed.
4. Intentional — the approved legacy Header/Footer remain in the final DOM only as `hidden inert aria-hidden` compatibility shells, while the unified accessible shell is rendered once.
5. Environment note — the restricted local QA network intermittently blocked external CDN/font requests and the local server has no favicon. Core page content, navigation, CSS fallbacks, and page interactions remained available; no runtime JavaScript exception remained after the Canvas fix.

No unresolved P0, P1, or P2 design, interaction, responsive, or accessibility finding remains in this phase.

## Verification

- Source/target section counts and order are identical: home 7/7, services 6/6, product service 13/13, Tharaa 13/13.
- All four final routes return HTTP 200.
- All local `href`/`src` references in scope resolve; no `reference` folder path is present in the four finals.
- Desktop and mobile document widths are contained; all final mobile pages report `scrollWidth = 390`.
- Unified Header, Footer, Mega Menu, Mobile Navigation, FAQ controls, home preview, service decision tabs, and Tharaa studio controls were exercised in Chrome at both viewports.
- Mobile menu and mega menus use `aria-expanded`/`aria-hidden`; Escape handling and focus restoration are implemented in `ibtikar-shell.js`.
- Skip-link targets exist on all four pages; all static images have `alt`; reduced-motion rules are present.
- `node --check` passed for `page-shell.js`, `ibtikar-shell.js`, and `approved-source.js`.

Final result: passed
