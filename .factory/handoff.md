# Creative Cartridge — repair handoff

Work order: `creative-cartridge-repair-1`

Repaired candidate: `e7a9c9bb195678b53ff9d8d56a580a67eb76dce3`

Verifier report: `4c241702a60dcab853c09ed75af141f5b856c9f0`

Completed: 2026-08-28

## Disposition

**PASS.** Every high/medium/low finding in the independent report has
been reproduced, repaired at its root, and covered by a regression test. The
artifact remains a Vite + vanilla TypeScript offline PWA with the researched
six-activity scope, local IndexedDB archive, parent controls, one-time Sociobot
license integration, original broadsheet identity, and static `dist/` output.

## Reproduction and repairs

The original candidate was rebuilt in a detached worktree and scanned with
Playwright 1.58.2 plus `@axe-core/playwright` 4.10.2:

- Activating the home skip link left focus on `BODY`. `main` now has
  `tabindex="-1"` on the app and both legal pages, so fragment navigation moves
  focus without inserting the landmark into the normal Tab order.
- At the midpoint of the sheet entrance, Rhythm Press reproduced
  `aria-prohibited-attr` on all 16 beat `div`s and nine `color-contrast` nodes;
  Creature Works and Pocket Theatre each reproduced two contrast nodes. The
  invalid beat cells are now an ordered list with visible numbers and
  screen-reader-only descriptions. The sheet keeps its physical 220 ms rise
  but no longer fades the entire foreground through low-contrast opacity.
- The deployment returned `max-age=30, must-revalidate` for hashed assets and
  the worker, and `application/octet-stream` for the manifest. The shipped
  Azure Static Web Apps configuration now gives `/assets/*` a one-year
  immutable cache, forces `/sw.js` to revalidate with no stored response, and
  serves `.webmanifest` as `application/manifest+json`. It also supplies CSP,
  Permissions-Policy, Referrer-Policy, and `nosniff` headers. The hosting config
  is deliberately excluded from the service-worker precache.
- The required 390 px live sweep exposed one additional serious axe finding:
  Six-card Cinema's horizontally scrollable frame strip could not receive
  keyboard focus. It is now a named, focusable region, so keyboard users can
  scroll the six frames.

`tests/app.spec.ts` now pauses each activity entrance at its midpoint and runs
the serious/critical axe gate across all six sheets at both desktop and 390 px;
it asserts the Rhythm Press list semantics, focusable frame region, home/legal
skip-link focus, and the built response-policy contract. This makes each
verifier defect fail on the old candidate and pass on the repair.

## Verification evidence

- Exact clean install: `npm ci` — 25 packages audited, 0 vulnerabilities.
- Strict type/static check: `npm run typecheck` — passed. There is no separate
  lint tool in this small vanilla TypeScript project.
- Unit/integration/browser suite: `npm test` — **11/11 passed** after its own
  production build. It covers all six launch paths, PIN curation, IndexedDB
  saving, keyboard rhythm input, every activity axe scan, offline reload,
  privacy/terms, returned-license handling, and response policy.
- Production build: `npm run build` — `dist/index.html` at the required root;
  generated versioned worker with 18 precached app files. Initial assets are
  35.90 KB JS + 0.76 KB helper JS raw (12.53 KB combined gzip) and 12.00 KB CSS
  raw (3.56 KB gzip), within the 200 KB/50 KB budgets. Packaging/consumer tests
  are not applicable to a directly deployed static PWA.
- `npm audit --audit-level=high` — 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/` — HTTP 200 in 553 ms;
  title and `lang=en` present, one h1, main landmark, zero missing image alt,
  zero unlabeled buttons, and zero console/page errors.
- Lighthouse 13.4.1 mobile simulation — performance **100**, accessibility
  **100**, best practices **100**, SEO **100**; FCP 1.2 s, LCP 1.5 s, TBT 0 ms,
  CLS 0.
- Chromium visual/interaction review at 1440×1000 and 390×844 — one h1, six
  activities, minimum 44 px controls, no home or activity horizontal overflow,
  no clipping, and no console/page errors. Reduced motion changed page scrolling
  from `smooth` to `auto`.
- Privacy check — no external request during unlicensed desktop or mobile use;
  no CDN, remote font, analytics, tracker, or child-data endpoint is present.
- Offline/update — a real service-worker-controlled `context.setOffline(true)`
  reload rendered the application and `Offline — the cartridge still works`.
  A controlled `SW_UPDATED` message rendered `A fresh offline issue is ready.`
  with a keyboard-operable Reload action.

## Deployment and live identity

The final artifact was rebuilt with the work order's exact command,
`npm ci && npm test && npm run build`, and deployed with
`/opt/fleet/lib/deploy-static.sh creative-cartridge dist`. Azure Static Web
Apps deployment `03fb918e-54c0-48ac-9fb2-fcfd10074532` succeeded; the custom
domain remained `Ready` and <https://creative-cartridge.sociobot.in/> returned
HTTPS 200.

- SHA-256 comparison covered all 16 deployable files (HTML routes, four hashed
  JS/CSS assets, worker, manifest, offline fallback, both artworks, icons,
  robots, and sitemap): **16 matches, 0 mismatches**.
- Live `/assets/main-jgzvbkWm.js` returns
  `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returns
  `no-cache, no-store, must-revalidate`; and `/manifest.webmanifest` returns
  `application/manifest+json` with a one-hour revalidation policy. CSP,
  Permissions-Policy, Referrer-Policy, and `nosniff` are present.
- The live URL verifier returned HTTP 200 in 586 ms with one h1, `lang=en`, a
  main landmark, no missing alt text or unlabeled button, and no console/page
  errors.
- A fresh live 390×844 context scanned every activity at the entrance
  midpoint: zero serious/critical axe findings and zero horizontal overflow on
  all six. It made no off-origin request, logged no console/page error, and
  completed a real service-worker-controlled offline reload.

## Remaining release dependency

The factory still needs to confirm that the `creative-cartridge` paid product
is registered and exercise one real hosted checkout/return with its test
product. The client contract and mocked valid-return flow pass; no payment
provider is embedded. Browser install prompts remain browser-controlled, and
the parent PIN remains an explicitly described convenience rather than a
security boundary.
