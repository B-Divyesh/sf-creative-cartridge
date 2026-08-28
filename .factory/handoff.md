# Creative Cartridge — repair handoff

Work order: `creative-cartridge-repair-1`

Repaired candidate: `e7a9c9bb195678b53ff9d8d56a580a67eb76dce3`

Verifier report: `4c241702a60dcab853c09ed75af141f5b856c9f0`

Completed: 2026-08-28

## Disposition

**PASS locally.** Every high/medium/low finding in the independent report has
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

`tests/app.spec.ts` now pauses each activity entrance at its midpoint and runs
the serious/critical axe gate across all six sheets; it asserts the Rhythm
Press list semantics, home/legal skip-link focus, and the built response-policy
contract. This makes each verifier defect fail on the old candidate and pass on
the repair.

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
  35.88 KB JS + 0.76 KB helper JS raw (12.52 KB combined gzip) and 12.00 KB CSS
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

Deployment and post-deploy byte/header checks are recorded here after the
production upload.

## Remaining release dependency

The factory still needs to confirm that the `creative-cartridge` paid product
is registered and exercise one real hosted checkout/return with its test
product. The client contract and mocked valid-return flow pass; no payment
provider is embedded. Browser install prompts remain browser-controlled, and
the parent PIN remains an explicitly described convenience rather than a
security boundary.
