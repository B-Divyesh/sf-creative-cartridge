# Independent verification 3 — PASS

Verified: 2026-08-28

Candidate commit: `f44fe80daacb92c8271e26bc88d7f1bce0e4edd8`

Live URL: <https://creative-cartridge.sociobot.in/>

## Verdict

**PASS.** Fresh verification from a clean checkout found the PWA functional,
offline-capable, local-first, accessible, within its static bundle budgets,
and correctly deployed. The live release is the candidate build: all
deterministic deployable files match exactly, and the only `sw.js` difference
is its intentional build-time cache-version string.

## Clean local gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 24 packages installed; 25 audited; 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS — `tsc --noEmit` |
| `npm test` | PASS — 13/13 Playwright tests (includes its production build) |
| `npm run build` | PASS — static `dist/` produced; versioned precache worker with 18 entries |
| `npm run verify:billing` | PASS — checkout HTTP 303 to `checkout.dodopayments.com`; invalid-license verifier HTTP 200 |

There is no lint script or separate linter in `package.json`. Packaging/consumer
testing is not applicable to this directly deployed PWA.

The built entry JavaScript is 35,968 bytes raw / 12,089 bytes gzip; the other
two initial helper chunks total 1,213 bytes raw / 1,109 bytes gzip. CSS is
12,146 bytes raw / 3,613 bytes gzip. This is well below the 200 KB initial-JS
and 50 KB CSS budgets. The mobile and desktop cover images are 39,736 and
119,828 bytes respectively; no fonts are fetched.

## Independent browser and product evidence

Fresh Chromium/Playwright sweeps ran at 1440×1000 and 390×844 against both the
local production preview and the live URL:

- The home has exactly one h1, six activity cards, no horizontal overflow, and
  the skip link moves keyboard focus to `main`.
- All six activities opened and closed. Representative normal work saved
  locally; Shape Stories gave its empty/save recovery feedback; Rhythm Press
  gave its empty-tape feedback and accepted exactly the 16-hit boundary;
  Parent Desk PIN setup, wrong-PIN recovery, valid recovery, invalid JSON
  import recovery, and additive valid import all completed.
- Axe 4.10.2 scans of home plus every activity at both desktop and 390px found
  **0 serious or critical violations**. The full repository suite additionally
  covers legal pages, dialog focus/escape, touch target sizes, timestamp
  boundaries, and license-return handling.
- The independent sweeps captured **0 console errors and 0 page errors**.
  Normal unlicensed use made only same-origin requests: HTML, local JS/CSS,
  and the responsive same-origin cover image. There were no trackers, CDN
  scripts, remote fonts, or analytics requests. The source and runtime check
  show creative work in IndexedDB and settings/PIN hash/license in
  localStorage; only an entered license is eligible for the disclosed
  Sociobot verifier.
- With reduced motion emulated on live, `scroll-behavior` computed to `auto`
  and the opened sheet had no running animation.

`/opt/fleet/lib/verify-url.sh` also passed locally (554 ms) and live (874 ms):
HTTP 200, title present, `lang=en`, one h1, `main`, no missing image alt text,
no unlabeled buttons, and no console/page errors.

## PWA and response-policy evidence

- The installed shell offline reload test passed in the repository suite. A
  separate fresh live Chromium check found an active
  `https://creative-cartridge.sociobot.in/sw.js` controller, set the context
  offline, reloaded, and rendered `Creative Cartridge` plus `Offline — the
  cartridge still works`.
- A separate production-dist service-worker update test served an updated
  cache version, called `registration.update()`, and observed the in-app
  `A fresh offline issue is ready.` reload toast. The generated worker uses a
  versioned precache, `skipWaiting`, `clients.claim`, and old-cache cleanup.
- Live `/assets/main-BSLPi1ha.js` and CSS return
  `public, max-age=31536000, immutable`; `/sw.js` returns
  `no-cache, no-store, must-revalidate`; and the manifest has
  `application/manifest+json` plus one-hour revalidation. HSTS, CSP,
  Permissions-Policy, Referrer-Policy, and `nosniff` are present.
- The manifest has standalone display, a versioned start URL, local 192/512
  icons plus a maskable icon, and thesis-matching colors.

## Deployment identity and performance

SHA-256 comparison covered the 21 deployable files produced by this clean
build (HTML, JS/CSS, art, icons, manifest, offline fallback, worker, robots,
and sitemap): **20 exact matches, 0 substantive mismatches**. Local worker
`cc-mtcjde9y` and live worker `cc-mtciwrnx` differ only in `VERSION`; after
normalizing that generated value, their SHA-256 is identical
(`f7a3519023effeb25da5bdf6e1d20349b8ded8395fbd737e1ee63e3852cc7e8d`).

Lighthouse 13.4.0 mobile simulated against live produced 100 performance,
100 accessibility, 100 best practices, and 100 SEO: FCP 1.0 s, LCP 1.2 s,
TBT 60 ms, CLS 0. Lighthouse emitted a post-report browser-tab cleanup crash,
but wrote the complete report and all category/metric results above; the
independent Chromium sweeps had no such errors.

## Defects

No release-blocking defects found. No high, medium, or low severity product
defects were observed in this verification.
