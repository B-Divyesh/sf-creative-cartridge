# Creative Cartridge — repair handoff

Work order: `creative-cartridge-repair-3`

Completed: 2026-09-05

Live URL: <https://creative-cartridge.sociobot.in/>

Implementation SHA: `64a56e023efd043e85ee5532a07d4f0b0c37598d`

Documentation SHA at handoff start: `f8758036fd65b98fbc1ba37662768649487f297b`

Base reviewed SHA: `3446e03ab31277868785560869af288354869086`

## What changed

- Added `/demo`, a one-click populated sample with six realistic pieces.
  Demo uses only `demo:` localStorage keys and a separate
  `demo:creative-cartridge` IndexedDB database. Its fixed banner offers
  **Reset demo** and **Start for real**.
- Added `.factory/demo.md`, `.factory/claims.json`, and fifteen isolated,
  outcome-based claim checks. Each declared command was run from the final
  candidate.
- Reworked the first screen. It now names the job, audience, first action,
  and offline/privacy/price facts before scrolling on a 390×844 phone.
- Added direct demo and activity URLs, route titles, back/forward behavior,
  a designed 404, shared legal-page frame, canonical/Open Graph/Twitter
  metadata, Apple touch icon, sitemap entries, and a product-specific social
  card derived from the original cover art.
- Fixed two regressions found during final verification: service-worker cache
  matching now ignores response `Vary` differences for offline assets, and
  successful import confirmation now remains visible after the parent desk
  refreshes.
- Retained the earlier resolved fixes: activity accessibility, keyboard skip
  focus, immutable asset caching, typed manifest, CSP and Permissions-Policy,
  checkout availability, creature-name timestamp boundaries, and 44 px footer
  targets.

## Strict-review disposition

| Review finding | Disposition |
|---|---|
| No isolated sample demo | Resolved — `/demo` is seeded, labeled, resettable, exits cleanly, and has separate browser storage. |
| No claim inventory or tagged checks | Resolved — 15 claims map one-to-one to `@claim:<id>` Playwright tests. |
| First screen did not name the job or expose sample action | Resolved — the phone run shows the action at 451 px of an 844 px viewport. |
| No real routes, route titles, or 404 | Resolved — known activity paths rewrite to the shell; unknown paths return HTTP 404 and the designed page. |
| Incomplete standard frame and sharing metadata | Resolved — header/footer, legal frame, required landing sections, canonical/social metadata, and 1200×630 card are present. |

## Verification

Clean setup used Node 22, `npm ci`, and Playwright 1.58.2.

| Check | Result |
|---|---|
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 20/20 Playwright checks in 38.8 s |
| `npm run build` | PASS — `dist/` produced |
| `npm run verify:billing` | PASS — checkout 303 to hosted checkout; invalid verifier 200 |
| Every command in `.factory/claims.json` | PASS — all 15 commands, each against `/demo` |
| Local `verify-url.sh` | PASS — title, `lang`, one h1, main, alt text, labels, no browser errors |
| Live `verify-url.sh` | PASS — same semantic checks, 828 ms |
| Live axe (home, demo, six activity routes, privacy, terms at 390 px) | PASS — zero serious/critical violations |

The final build has 41.56 KB raw main JavaScript (13.70 KB gzip) and 16.38 KB
CSS (4.42 KB gzip), within the static budgets. The 1200×630 social card is
69.8 KB.

Fresh live browser contexts verified:

- Desktop 1440×1000 and phone 390×844: job is **Set up offline creative
  play**; **Try it with sample data** is visible before scrolling; there is no
  horizontal overflow or console/page error.
- One click opens the six saved sample pieces with the persistent demo banner.
  Reset restores the sample, and Start for real returns to the normal archive.
- A service-worker-controlled `/demo` reload works offline and shows the
  offline status.
- `/demo`, each activity route, privacy, and terms return 200; a random path
  returns HTTP 404 with the styled recovery page.
- Live hashed JavaScript has one-year immutable caching; `sw.js` is no-store;
  the manifest is `application/manifest+json`.

## Deployment

The existing static product app `sf-creative-cartridge` was reused; no
database, backend, or replica settings were changed. The final static upload
succeeded and HTTPS was checked at the product URL.

The first deployment attempt correctly failed before upload because Azure
normalizes `/demo` and `/demo/` to the same route. Commit
`7ef8e70` removed the redundant rule; the subsequent production upload
succeeded. Commit `64a56e0` preserves the import success notice and was also
successfully deployed.

## Known gap

Lighthouse could not finish in this worker: after supplying the installed
Chromium path and trying a remote-debugging browser, Lighthouse reported a
browser-tab crash before a report was written. This is a runner limitation;
the independent fresh Chromium, `verify-url.sh`, and axe checks above completed
without page or console errors. No product behavior gap is known.

## Files for the next worker

- `.factory/claims.json` — visitor claims and exact commands
- `.factory/demo.md` — sample contents and storage isolation
- `.factory/copy-audit.md` — landing copy counts and terminology
- `.factory/catalog-description.txt` — copied to
  `/work/.evidence/catalog-description.txt`
