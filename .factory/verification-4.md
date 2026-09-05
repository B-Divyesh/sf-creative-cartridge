# Verification 4 — set up six offline creative activities

Work order: `creative-cartridge-verify-4`

Verified: 2026-09-05

Live URL: <https://creative-cartridge.sociobot.in/>

Implementation candidate: `64a56e023efd043e85ee5532a07d4f0b0c37598d`

Documentation reviewed: `4992a4d4f874fffbd384fe5205100a204d7b08cb`

## Verdict

**FAIL — 3 findings (2 medium, 1 low) and 4 incompletely tested claims.**

The main product works. The one-click sample is populated and isolated, all
six activities save work, offline reload works, all 15 declared commands pass,
and fresh desktop and phone axe scans have no serious or critical violations.
Acceptance still fails because four claim commands do not prove their complete
wording, non-home sharing metadata is incomplete, and seven phone targets are
smaller than 44 by 44 CSS pixels.

No product code was modified during verification.

## First screen before scrolling

Fresh 1440×1000 desktop and 390×844 phone contexts showed:

| Required item | Live text or action | Result |
| --- | --- | --- |
| Job | `Set up offline creative play` | PASS — one `h1`, five words. |
| Audience | `For parents setting up an older computer for a child ages 4–7.` | PASS — visible before scrolling. |
| First action | `Try it with sample data` | PASS — bottom edge at 451 px on the 844 px phone viewport. |
| Three facts | Offline after first visit; no account, feed, or tracking; Weekend Ink costs $6 once | PASS — all visible before scrolling. |

The page had no horizontal overflow. The job, audience, and first action were
plain and direct.

## Findings

### Medium 1 — Four claim commands do not prove the whole declared claim

Every command in `.factory/claims.json` exits successfully, but four tagged
tests leave part of their public wording unasserted:

1. `local-demo-isolation` proves that the activity selection is isolated. It
   creates no real archive piece, then checks for `.saved-list` on the normal
   home page, where that element is never rendered. It therefore cannot catch
   demo work leaking into the real IndexedDB archive.
2. `license-return` proves token storage, URL removal, one verification call,
   and an offline shell reload. It does not assert that cached valid status
   still exposes Weekend Ink while offline, nor the manual paste-and-restore
   path shown in Parent desk.
3. `weekend-ink-extras` asserts one extra paper stamp only. The claim also says
   Weekend Ink adds extra prompts.
4. `core-stays-free` exercises one rhythm and JSON export. Its wording covers
   all core activities and archive controls. Those behaviors appear in other
   tests, but the declared command does not prove the complete claim as the
   one-test-per-claim contract requires.

Independent live testing confirmed that the product's demo archive is in fact
isolated: one real piece and a one-activity real selection survived demo work,
reset, and exit; the demo database was cleared. This finding concerns the
required repeatable claim evidence, not an observed data leak.

Required result: make each tagged command assert every clause in its declared
claim, or narrow the public wording and inventory to what the command proves.

### Medium 2 — Non-home routes have incomplete sharing metadata

The home route has complete canonical, Open Graph, and Twitter metadata. The
other routes do not meet the attached site-structure contract:

- `/demo` and all 12 normal/demo activity URLs retain the home canonical URL,
  home Open Graph title and URL, and home Twitter title after their visible
  route title changes.
- `/privacy/`, `/terms/`, and the designed 404 include a canonical URL and
  partial Open Graph data, but omit `og:url`, `twitter:title`,
  `twitter:description`, and `twitter:image`.

Route titles themselves are correct, and the 404 response is deliberately
HTTP 404. The expected 404 is not a defect.

Required result: provide complete route-specific canonical, Open Graph, and
Twitter metadata for every public route.

### Low 1 — Seven phone targets are smaller than 44 by 44 pixels

At 390 px width, the following live targets miss the required size:

| Target | Measured size |
| --- | ---: |
| Creative Cartridge home link | 175.3×21.6 px |
| Home | 37.4×36 px |
| Try sample | 68.7×36 px |
| Privacy in the header | 45.9×36 px |
| Read the privacy details | 358×25.5 px |
| Reset demo | 103.4×40 px |
| Start for real | 107.3×40 px |

The earlier footer-link finding remains resolved: those footer links now have
44 px targets. The current header, inline privacy, and demo-control sizes are a
new regression. Axe does not report these as serious or critical, but the
attached accessibility and design contracts explicitly require 44×44.

Required result: give every interactive phone target a 44×44 CSS pixel hit
area while preserving spacing and focus visibility.

## Declared claim commands

The verification used a new clone of documentation commit `4992a4d`. `npm ci`
installed the locked Playwright 1.58.2 dependency. Every command below was run
separately and exactly as declared.

| Claim | Command result | Coverage audit |
| --- | --- | --- |
| `finite-activities` | PASS | Complete |
| `offline-reload` | PASS | Complete |
| `no-tracking` | PASS | Complete with live request capture and source review |
| `local-demo-isolation` | PASS | **Incomplete** — real archive not meaningfully asserted |
| `parent-curation` | PASS | Complete |
| `local-persistence` | PASS | Complete |
| `json-export` | PASS | Complete |
| `additive-import` | PASS | Complete |
| `clear-archive` | PASS | Complete |
| `parent-pin` | PASS | Complete; independent short and wrong PIN checks also pass |
| `small-download` | PASS | Complete |
| `weekend-ink-checkout` | PASS | Complete |
| `license-return` | PASS | **Incomplete** — offline paid state and paste restore not asserted |
| `weekend-ink-extras` | PASS | **Incomplete** — extra prompts not asserted |
| `core-stays-free` | PASS | **Incomplete** — full plural scope not asserted by this command |

Untested claim count: **4**.

No additional unlisted marketing claim was found outside these inventory
groups.

## Clean-checkout gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 24 packages installed; 25 audited; 0 vulnerabilities. |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm test` | PASS — 20/20 Playwright tests in 37.6 s. |
| `npm run build` | PASS — `dist/` produced with 20 precached files. |
| `npm run verify:billing` | PASS — checkout HTTP 303 to `checkout.dodopayments.com`; invalid verification HTTP 200. |
| Local `verify-url.sh` | PASS — 546 ms, title, `lang=en`, one `h1`, main, alt text, labels, no console/page errors. |
| Live `verify-url.sh` | PASS — 1,782 ms with the same semantic result. |

The production build contains 41.56 KB raw main JavaScript (13.70 KB gzip),
16.38 KB CSS (4.42 KB gzip), no downloaded fonts, and a 39,736-byte phone
cover image. These are within the attached static-product budgets.

Lighthouse 13.4.1 completed against the live phone profile with 100
performance, 100 accessibility, 100 best practices, and 100 SEO. FCP was
1.1 s, LCP 1.3 s, TBT 80 ms, CLS 0, and Speed Index 1.1 s. This resolves the
previous worker's Lighthouse tooling limitation.

## Live product checks

- The direct `/demo` sample contained the six named pieces from the demo
  contract. The `Demo — sample data, nothing is saved` controls stayed visible
  inside an activity.
- Adding sample work changed only `demo:creative-cartridge`. Reset restored
  six pieces. Start for real cleared demo work and preserved one real piece,
  the real PIN, and the real one-activity selection.
- All six activities opened at real URLs and showed populated sample work.
  Shape, flip-card, and rhythm empty states explained the next action. Rhythm
  stopped at 16 hits. The signed timestamp boundary produced a complete
  creature name.
- Short and wrong PINs were rejected. Malformed and structurally invalid JSON
  imports preserved the archive. A valid import added a seventh piece and kept
  its success message. Cancelled clear preserved work; confirmed clear removed
  it.
- Browser back and forward restored the demo and activity route. Unknown and
  invalid activity URLs returned HTTP 404 with the designed recovery page.
- Skip navigation moved focus to `main`; the parent dialog focused its input,
  trapped focus, closed with Escape, and returned focus. Visible focus used a
  3 px outline. Content remained available at 200% text size.
- Reduced motion changed smooth scrolling to `auto` and reduced sheet entrance
  motion to 0.01 ms.
- Twenty-two live axe scans covered home, demo, all six demo activities,
  privacy, terms, and 404 at desktop and phone sizes: zero serious or critical
  violations.
- A same-origin request log for sample creative use found no off-origin
  request. All discovered internal links returned 200. The source link
  returned 200.
- A service-worker-controlled demo reloaded offline with all six activities
  and the offline status. The update message produced the visible reload
  notice. Hashed JS/CSS use one-year immutable caching, `sw.js` is no-store,
  and the manifest has `application/manifest+json`.
- HSTS, CSP, Permissions-Policy, Referrer-Policy, and `nosniff` are present.
  The CSP permits only the documented Sociobot billing connection.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Serious activity contrast and invalid rhythm ARIA | RESOLVED — 22 current live scans have zero serious/critical violations. |
| Skip link did not move focus | RESOLVED — keyboard activation focuses `MAIN#main`. |
| Hashed caching, worker caching, CSP, Permissions-Policy, and manifest MIME | RESOLVED — current live headers match the required policy. |
| Checkout returned 404 | RESOLVED — checkout returns 303 to the hosted provider. |
| Creature name could contain `undefined` | RESOLVED — the signed boundary produces a complete name. |
| Mobile footer links were shorter than 44 px | RESOLVED for the footer; current undersized targets are listed separately. |
| No isolated sample demo | RESOLVED in live behavior. |
| No claim inventory or tagged checks | PARTIAL — inventory and commands exist, but four claim checks are incomplete. |
| First screen did not name the job or show sample action | RESOLVED. |
| No real routes, route titles, or designed 404 | RESOLVED. |
| Incomplete shared frame and sharing metadata | PARTIAL — the frame and titles pass; non-home metadata remains incomplete. |
| Import success disappeared after refresh | RESOLVED — the message remains after the Parent desk rerenders. |

## Deployment identity

A fresh build from the reviewed documentation commit, whose product files are
unchanged from implementation `64a56e0`, matched 17 deterministic live files
byte for byte. `sw.js` also matched after normalizing only its generated cache
version; normalized SHA-256 was
`1549ace73fd368ea98b749998b10916cf4285ee89c054ee517ce6f81b29a06c2`.

The live runtime is therefore the implementation candidate. The later
`f875803` and `4992a4d` commits changed documentation only.

## Required next verification

Complete the four claim checks, add route-specific metadata, and enlarge all
phone targets. Then rerun all 15 exact commands, the full suite, and the live
phone measurements before changing this verdict.
