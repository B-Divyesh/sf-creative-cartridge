# Independent verification — FAIL

Verified: 2026-08-28

Candidate commit: `e7a9c9bb195678b53ff9d8d56a580a67eb76dce3`

Live URL: <https://creative-cartridge.sociobot.in/>

## Verdict

**FAIL.** The product has the intended six local activities and its essential
offline path works, but it does not meet the non-negotiable accessibility
acceptance gate: independent axe scans found serious violations in child-facing
activity sheets. The deployed cache policy also misses the stated immutable
hashed-asset policy.

## Fresh local evidence

This was run from the clean candidate checkout (`git status --short` empty
before verification).

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 25 packages audited, 0 vulnerabilities |
| `npx tsc --noEmit` | PASS |
| exact production build, `npm run build` | PASS — `dist/` produced; generated versioned precache worker |
| `npm test` | PASS — 8/8 Playwright tests |
| production bundle | PASS — entry JS 35,813 bytes raw / 12,040 bytes gzip; shared helper JS 755 / 440 bytes gzip; CSS 11,835 / 3,510 bytes gzip. Initial JS is comfortably below 200 KB. |
| Lighthouse 13.4.1, mobile simulated, production preview | 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1.1 s, LCP 1.4 s, TBT 0 ms, CLS 0. (The report was written before Chrome emitted a post-run `TARGET_CRASHED` cleanup error.) |

Independent Chromium/Playwright checks on the production preview covered:

- all six activities; keyboard sound painting; a blank shape story then save;
  flip-card play-before-complete feedback then six-card save; empty rhythm
  feedback, the 16-hit limit, and save; creature-without-name feedback then
  save; and a saved Pocket Theatre;
- parent-PIN setup and wrong-PIN recovery; curated empty issue and recovery;
  IndexedDB persistence across refresh; invalid JSON/object import recovery and
  valid additive import;
- 1440px desktop visual review and 390x844 mobile review. There was no mobile
  horizontal overflow, one h1, six cards, or console/page error. Reduced motion
  changed `scroll-behavior` to `auto`.
- real service-worker-controlled offline reload. Both preview and live reloads
  showed the h1 plus `Offline — the cartridge still works` while the browser
  context was offline. The active worker has a versioned precache, cleanup,
  `skipWaiting`, `clients.claim`, and update message handler; dispatching its
  update event showed `A fresh offline issue is ready. Reload`.
- outbound request capture during an unlicensed normal run: none. Static scan
  finds no CDN, tracker, or analytics; the only runtime network endpoint is the
  documented Sociobot license-verification API, used only when a license exists.
  Local creative data remained in IndexedDB/localStorage.

## Accessibility results

Independent axe (`@axe-core/playwright` 4.10.2) found no serious/critical
issues on home, parent desk, privacy, terms, Sound Paint, or Six-card Cinema.
It did find the following serious findings:

| Surface | Serious finding | Evidence |
| --- | --- | --- |
| Rhythm Press | `aria-prohibited-attr` | All 16 visual `.beat` `div`s carry `aria-label` without a role that permits it. |
| Rhythm Press | `color-contrast` | Kicker/instruction text, key labels, and primary action were measured as low as 3.31:1–3.88:1 against their rendered backgrounds. |
| Creature Works | `color-contrast` | Kicker/instruction and red primary button measured 3.31:1–3.88:1. |
| Pocket Theatre | `color-contrast` | Kicker and instruction measured 3.87:1–4.02:1. |

The home-page-only axe test in the repository therefore does not cover the
failing activity routes. Independent keyboard testing also showed that the
visible skip link does not move focus to `main` after activation: `main` is not
focusable, so focus remains on the skip link.

## Deployment identity and response policy

The live deployment is the candidate application build:

- SHA-256 bytes match local `dist/` for `/`, all four hashed JS/CSS assets,
  manifest, offline page, privacy/terms pages, both responsive artwork files,
  and both icons.
- `/sw.js` differs only in its deliberately build-time `VERSION` string
  (`cc-mtccp1b9` live, `cc-mtcdwiax` in this fresh rebuild). After normalizing
  that nondeterministic cache version, the worker bytes match exactly.
- Live Chromium loaded six activity cards, registered
  `https://creative-cartridge.sociobot.in/sw.js`, recorded no console/page
  errors or outbound normal-run requests, and passed an actual offline reload.

Live responses use HTTPS/HSTS, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and
`X-XSS-Protection`. They do not currently send CSP, Permissions-Policy, or
cross-origin isolation policies. More importantly for this PWA, every sampled
HTML, hashed JS, CSS, and service-worker response uses
`Cache-Control: public, must-revalidate, max-age=30`; immutable hashed assets
are not long-lived cached as required by the performance/PWA contract. The
manifest is served as `application/octet-stream`, not a manifest JSON MIME
type.

## Defects

### High

1. **Serious accessibility violations in activity sheets.** The detailed axe
   evidence above violates the zero serious/critical acceptance gate and the
   4.5:1 text-contrast requirement. Rhythm Press also supplies an invalid ARIA
   pattern for its beat cells.

### Medium

1. **Skip link does not transfer keyboard focus to main content.** Its target
   lacks a focusable `tabindex`; after Enter, `document.activeElement` remains
   the skip link.
2. **Deployment caching does not use long-lived immutable caching for hashed
   assets.** Live `max-age=30, must-revalidate` on hashed JS/CSS and the worker
   conflicts with the stated cache policy, even though the service worker gives
   a functioning offline fallback.

### Low

1. **Manifest MIME type is generic.** The live server returns
   `application/octet-stream` for `manifest.webmanifest`; use a web-manifest
   JSON content type for predictable installability across browsers.

## Recommended release disposition

Do not release this candidate as passing. Correct the serious axe findings,
re-run axe on every activity sheet (not just home and the parent gate), make the
skip target focusable, and configure immutable cache headers for hashed assets.
Then repeat this verification against the rebuilt deployment.
