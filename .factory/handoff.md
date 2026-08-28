# Creative Cartridge — repair handoff

Work order: `creative-cartridge-repair-2`

Verifier report: `37ee08cfe18d039bc294c9ade187d35b0b465af8`

Repaired candidate: `63344c2cb229836eff6b5d4f33f0440b35aa6dd0`

Repair commit: `7d9fb6873256e26d18d8e5d6aded73ba5f208768`

Completed: 2026-08-28

## Disposition

**PASS.** All three findings in `.factory/verification-2.md` were reproduced,
repaired at their root, and given exact regression coverage. The researched
brief, six-activity scope, local IndexedDB archive, parent controls, broadsheet
visual system, offline PWA behavior, and static `dist/` deployment class are
unchanged.

## Repairs

1. **Production checkout:** the public client URL was already correct. The
   missing live `creative-cartridge` product was registered as **Creative
   Cartridge Weekend Ink**, a **$6 USD one-time** Dodo-backed Sociobot product,
   with return URL `https://creative-cartridge.sociobot.in/`. The enabled
   server registry now maps the product to the existing public checkout and
   verifier. `scripts/verify-billing.mjs` is a networked release regression
   that requires a hosted-checkout redirect and the exact invalid-license
   verifier contract. One preliminary provider catalog record was immediately
   archived after validation rejected its response shape; it was never added
   to the Sociobot registry, advertised, checked out, or paid. The final active
   product is the only enabled mapping.
2. **Creature Works names:** surname selection no longer uses a signed 32-bit
   bitwise shift. It uses integer division on the safe timestamp seed, so the
   array index remains non-negative. The browser regression checks values on
   both sides of `2^31` and `2^32` and validates the complete first-name and
   surname vocabularies.
3. **Mobile footer targets:** the legal/source links are now a labelled footer
   navigation group with explicit 44 px minimum width and height plus 8 px
   spacing. The 390 px regression measures all three rendered boxes and page
   overflow.

## Clean verification

The work order's exact command, `npm ci && npm test && npm run build`, passed:

- `npm ci`: 24 packages installed, 25 audited, 0 vulnerabilities.
- `npm test`: **13/13 passed** with Playwright 1.58.2. This includes all six
  launch paths, PIN curation, IndexedDB saving, keyboard rhythm input,
  skip-link focus, desktop and 390 px activity Axe scans, legal pages,
  response policy, real offline reload, returned-license handling, signed
  timestamp boundaries, and measured mobile footer targets.
- `npm run typecheck`: strict `tsc --noEmit` passed. No lint script or separate
  linter exists in this small vanilla TypeScript project.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm run build`: `dist/index.html` exists at the required root and the
  versioned worker precaches 18 shell entries. Initial JavaScript is 36,723 B
  raw / 12,547 B gzip; CSS is 12,146 B raw / 3,613 B gzip. The 390 px cover is
  39,736 B and the 1280 px cover is 119,828 B. There are no font downloads.
  Packaging/consumer testing is not applicable to a directly deployed PWA.
- `npm run verify:billing`: checkout returned HTTP 303 to
  `checkout.dodopayments.com`; synthetic invalid-license verification returned
  HTTP 200 with `valid: false` and `reason: "invalid"`.

## Browser, accessibility, privacy, and PWA evidence

- Independent Chromium sweeps at 1440×1000 and 390×844 opened every activity.
  Both had one `h1`, six cards, no page/sheet overflow, no console or page
  errors, and only same-origin requests during normal unlicensed use.
- At both sizes, footer target boxes measured Privacy 45.91×44 px, Terms 44×44
  px, and Source 44.36×44 px. The live `Date.now() = 2147483648` Creature Works
  check printed `Doodlewhistle`, never `undefined`.
- Axe 4.10.2 found **0 serious/critical** violations on home and every activity
  at 390 px; the automated suite also scans all six activities at desktop and
  mobile. Keyboard skip, rhythm input, dialog Escape/focus return, and focus
  styling pass. Reduced motion reports `scroll-behavior: auto` and a 0.01 ms
  sheet entrance.
- `/opt/fleet/lib/verify-url.sh` passed locally in 551 ms and live in 600 ms:
  HTTP 200, title, `lang=en`, one `h1`, `main`, no missing alt text, no
  unlabeled buttons, and no console/page errors.
- A service-worker-controlled offline reload passed locally and live with
  `Offline — the cartridge still works`. A real local worker replacement
  changed the generated cache version, activated, and displayed `A fresh
  offline issue is ready.` with its Reload button. Manifest name, standalone
  display, versioned start URL, newsprint colors, 192/512 icons, and maskable
  icon remain intact.
- Normal free use made no off-origin requests. There are no analytics,
  trackers, CDN scripts, or remote fonts. Creative work remains in IndexedDB;
  preferences, PIN hash, and an optional license remain in localStorage. Only
  an entered license is sent to the disclosed Sociobot verifier.
- Lighthouse 13.4.1 mobile against production scored **100 performance, 100
  accessibility, 100 best practices, and 100 SEO**: FCP 0.9 s, LCP 1.2 s, TBT
  0 ms, CLS 0, and Speed Index 0.9 s, with no warnings. The local run scored
  99/100/100/100 with LCP 1.6 s and TBT 70 ms.

## Deployment and live identity

The final artifact was deployed with
`/opt/fleet/lib/deploy-static.sh creative-cartridge /work/repo/dist` as Azure
Static Web Apps deployment `799c84c8-8c41-4f2b-a5df-54e3d3cdf1fc`.

- <https://creative-cartridge.sociobot.in/> returns HTTPS 200 and loads
  `assets/main-BSLPi1ha.js` plus `assets/styles-B49XNfHr.css`.
- SHA-256/byte comparison covered all 16 deployable files: HTML routes, four
  JS/CSS assets, worker, manifest, offline fallback, both artworks, icons,
  robots, and sitemap. Result: **16 matches, 0 mismatches**.
- Hashed JS/CSS return `public, max-age=31536000, immutable`; `/sw.js` returns
  `no-cache, no-store, must-revalidate`; the manifest returns
  `application/manifest+json` with one-hour revalidation. HSTS, CSP,
  Permissions-Policy, Referrer-Policy, and `nosniff` are present.
- The live hosted checkout reached `checkout.dodopayments.com`, rendered
  **Creative Cartridge Weekend Ink — $6.00 (sales tax incl.)**, and logged no
  page errors. A real monetary charge was not submitted. The successful
  return-license path is covered deterministically in Playwright; an actual
  paid return requires an authorized purchaser and must not be fabricated.

## Run again

```sh
npm ci
npm audit --audit-level=high
npm run typecheck
npm test
npm run build
npm run verify:billing
```

No release-blocking product gap remains. Browser install UI is browser-owned,
and the parent PIN remains an explicitly documented convenience rather than a
security boundary.
