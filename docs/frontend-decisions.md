# Front-End Decisions - Ibtikar Tech

## Technical Decision

Use a static HTML/CSS/JavaScript architecture for the first modular version.

No framework is introduced in this phase.

## Reasoning

- The current project is static HTML/CSS/JS.
- The fastest safe path is to extract the design language into reusable CSS and JS without rewriting everything into a new framework.
- Static files keep the project easy to preview and easy to connect later to Laravel, Django, Node, WordPress, Salla/Twilight documentation pages, or another backend.
- The design relies heavily on custom CSS, mockups, and page-specific storytelling; a framework would not solve the immediate duplication problem by itself.

## Structure

```text
assets/
  css/
    tokens.css
    base.css
    components.css
    pages.css
  js/
    app.js
docs/
  frontend-audit.md
  frontend-decisions.md
src/
  components/
  layouts/
  pages/
  styles/
  scripts/
```

`assets/` is used by the runnable static pages.

`src/` is reserved for the future component source layer if the project later moves to Vite templates or another build pipeline.

## Design System Source

The homepage is the primary identity source.

The services page provides the service hub structure.

The ecommerce page provides the Salla/ecommerce and platform showcase structure.

The Tharaa page provides the product-page structure.

## Motion Decision

Use lightweight native JavaScript first.

GSAP, ScrollTrigger, and Lenis are not added to the new system in the first pass. The current reference files still use them, but the new system starts with:

- IntersectionObserver reveals.
- CSS transitions.
- Simple canvas particles with reduced device pixel ratio.
- `prefers-reduced-motion` support.
- Visibility pause for canvas animation.

GSAP can be reintroduced later through a single animation controller if a page genuinely needs cinematic scroll scenes.

## Backend Readiness

Forms are frontend-only in this phase:

- Client validation.
- Loading state.
- Success state.
- Error state.
- Mock submission.
- Clear TODO marker for backend integration.

No API, authentication, database, payment, CRM, email sending, or WhatsApp API is created.

## Routing Decision

Use stable static HTML filenames now:

- `index.html`
- Future: `services.html`
- Future: `services-ecommerce.html`
- Future: `tharaa.html`

The original reference files remain untouched and can be compared during migration.

## Acceptance Direction For Phase 1

Phase 1 is complete when:

- The audit exists.
- The technical decision exists.
- Design tokens exist.
- Shared shell styles exist.
- A unified header, mega menu, mobile menu, footer, CTA, form, FAQ, and homepage are implemented in the new system.
- The page runs as static HTML.
