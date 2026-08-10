# QA Checklist - Ibtikar Tech Platform

Status values: Passed, Failed, Needs review, Needs client data, Not applicable.

| Area | Check | Status | Notes |
|---|---|---:|---|
| Brand | Homepage explains positioning in first viewport | Passed | Content retained from approved homepage. |
| Navigation | Unified header and footer across active pages | Passed | Shell applied and new pages use same structure. |
| Navigation | Solutions separated from services | Passed | Separate mega menus and mobile groups. |
| Conversion | Contact and quote page exists | Passed | Front-end qualifying form added. |
| Forms | Backend submission | Needs client data | Requires endpoint/CRM integration. |
| SEO | Titles and meta descriptions | Passed | Added for new pages; core pages retained. |
| SEO | Sitemap and robots | Passed | Added root files. |
| SEO | Structured data | Needs review | Organization schema added; validate before publish. |
| Accessibility | Skip links and semantic landmarks | Passed | Added/retained on pages. |
| Accessibility | Keyboard menu and Escape behavior | Needs review | Automated menu checks pass; manual keyboard pass recommended. |
| Responsive | Mobile/desktop layout | Needs review | Run automated screenshots after each visual change. |
| Performance | Removed external JS/CSS dependency | Passed | Active pages avoid external loaders. |
| Performance | Inline CSS extraction | Passed | Core page CSS moved to assets/css/pages. |
| Analytics | Event naming convention | Passed | site-config and analytics module prepared. |
| Analytics | Real IDs | Needs client data | No fake IDs added. |
| Security | Secrets/API keys absent | Passed | Config uses TODO placeholders. |
| Legal | Policies | Needs review | Draft legal page requires legal approval. |
| Content | Real portfolio/client data | Needs client data | Portfolio uses internal placeholders, not fake claims. |
| Deployment | Domain/contact data | Needs client data | Update config and visible contact details before production. |
