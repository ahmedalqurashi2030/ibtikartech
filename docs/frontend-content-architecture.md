# Frontend Content Architecture

Finalized: 2026-08-14
Scope: public frontend routes on `main`, excluding `portfolio.html`

## Editorial principle

Every section must help the visitor do one of four things: understand the offer,
decide whether it fits, see how delivery works, or take the next action. A new
section is not added when an existing shared pattern can communicate the same
idea more clearly.

## Page roles

| Page family | Primary job | Content pattern |
| --- | --- | --- |
| Homepage | Explain the company and route visitors | Hero → one signature story → service discovery → trust/approach → FAQ → CTA |
| Services hub | Help visitors choose a service family | Hero → interactive family discovery → fast service links → decision support → CTA |
| Category hubs | Explain one family without becoming a detail page | Hero → category signature → capabilities → approach → related routes → FAQ/CTA |
| Ecommerce hub | Route by situation and by concrete service | Hero → situation paths → six-service catalog → platform context → process → FAQ/CTA |
| Service detail | Support a qualified buying decision | Hero → five-part decision center → process → dependencies → related services → FAQ/CTA |
| Tharaa | Present a product, not an agency service | Product hero → product story → previews → capabilities → fit → CTA |
| Knowledge/articles | Answer a practical question and route to relevant help | Editorial intro → focused content → related reading/service CTA |
| About/contact/legal/404 | Complete a specific utility task | One clear purpose, minimal supporting sections, one next action |

## Reusable section contracts

### Service decision center

All six ecommerce service pages use the same five-part order:

1. `problems` — the situation being solved.
2. `fit` — who the service is and is not for.
3. `scope` — what is performed.
4. `deliverables` — what is handed over.
5. `exclusions` — boundaries and separate dependencies.

The former hidden `results` tab was deleted from source and runtime. It was not
visible to users, duplicated claims already explained elsewhere, and created a
maintenance path that could drift between pages.

### Shared supporting patterns

- Process timeline: used only when sequence, responsibility, or dependencies matter.
- Compact related navigation: routes to the next relevant page without creating another catalog.
- FAQ: resolves final objections; it must not repeat the main body word for word.
- Final CTA: one primary action, with truthful wording and no unverified contact channel.
- Category signature: a reusable layout with category-specific content, not copied generic prose.

## Deliberate keep/remove decisions

- Keep the ecommerce situation paths and the six-service catalog: one answers
  “what situation am I in?” and the other answers “what can I buy?”.
- Keep one immersive story on the homepage as the visual signature, but reduce
  its passive desktop scroll distance.
- Keep related-service navigation compact; do not repeat full service cards at
  the bottom of every page.
- Keep platform expertise contextual inside ecommerce; do not recreate thin
  platform pages.
- Do not edit or use `portfolio.html` as a source pattern in this finalization.

## Content and performance guardrails

- Maximum of 12 authored `<section>` elements per finalized route.
- Exactly one `<h1>` and no duplicate element IDs per route.
- No empty sections and no hidden decision content stored in HTML.
- The four approved cinematic source pages keep their visual identity, while
  their large CSS and JavaScript blocks live in cacheable external assets.
- Motion and long-form scenes must respect reduced-motion and mobile fallbacks.
- New backend templates should map to these page families and contracts rather
  than copying complete page markup.
- Continuous browser QA covers all 22 finalized routes at desktop, tablet, and
  mobile viewports; `portfolio.html` is intentionally outside that matrix.

These rules are enforced by `scripts/static-qa.cjs` so the content architecture
does not regress during the later backend migration.
