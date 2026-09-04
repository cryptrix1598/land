# Green Man's Contracting & Landscaping — Website

A 5-page, dark-mode marketing site with cinematic scroll animations.

## What's here

- `src/` — editable source: `site.css`, `site.js`, `shell.html` (shared nav/footer),
  and `pages/*.html` (per-page content: index, services, work, about, contact)
- `dist/` — the finished, deployable site (plain HTML/CSS/JS, no build step needed to host it)
- `build.js` — stitches `src/shell.html` + `src/pages/*.html` into `dist/*.html`
- `serve.js` — a tiny local preview server

## Editing content

1. Edit the relevant file in `src/pages/` (or `src/shell.html` for nav/footer, shared across all pages).
2. Rebuild:
   ```
   node build.js
   ```
3. Preview locally:
   ```
   node serve.js
   ```
   then open http://localhost:4173

## Deploying

`dist/` is a complete static site — drag that folder onto Netlify/Vercel/Cloudflare Pages,
or upload it to any web host via FTP. No server or database required.

## Placeholders to fill in before launch

Marked in brass/gold with a dashed underline throughout the site:

- `[YOUR EMAIL]` — business email (footer + contact page)
- `[SERVICE AREA TOWNS]` — the towns you actually serve
- `[HIC #]` — CT Home Improvement Contractor registration number (footer)
- `[INSURANCE / HIC DETAILS]`, `[ACCEPTED PAYMENT METHODS]` — contact page FAQ
- `[YRS]`, `[COUNTY]`, `[FOUNDING STORY DETAILS]` — home/about page stats and story
- Real job photos to replace the diagonal-stripe placeholders on the Work page and homepage

The contact form currently validates and shows a success message client-side only —
wire it to an email service (Formspree, Netlify Forms, etc.) or your own backend to
actually receive submissions.
