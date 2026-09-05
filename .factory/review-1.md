# Review 1 — set up six offline creative activities for a child

Work order: `creative-cartridge-review-1`

Reviewed: 2026-09-05

Live URL: <https://creative-cartridge.sociobot.in/>

Implementation candidate: `7d9fb6873256e26d18d8e5d6aded73ba5f208768`

Documentation commit at review start: `0d3fafb2cb6838557414140999f9b1bd6bd5319b`

## Verdict

**FAIL — 5 findings, including 2 high and 3 medium. There are 15 untested public claims.**

The six activities, local saves, offline reload, purchase entry point, keyboard
paths, reduced motion, and earlier repairs work. Acceptance still fails because
there is no sample-data demo or isolated demo storage. The required claim file
and tagged claim tests are also absent. The first screen, routes, metadata, and
page structure do not meet the attached contracts.

## What the first screen says before scrolling

| Item | What is visible | Review |
| --- | --- | --- |
| Job | The `h1` is only “Creative Cartridge.” The next heading is “Open the paper. Make something.” | The job is not named in the page title. Supporting copy eventually explains that there are six offline creative activities. |
| Audience | “Made for ages 4–7 and their grown-ups.” | Clear. |
| First action | “Start with today’s first activity.” | It opens Ink orchestra. It is not a sample-data action and does not say what will appear next. At 390×844 its box starts at 825 px and ends at 871 px, so it is not fully visible before scrolling. |

The practical job is: set up six finite, offline creative activities for a
4–7-year-old on an older family computer.

## Findings

### High 1 — The required sample-data demo does not exist

There is no “Try it with sample data” action on the first screen. Neither
`/?demo=1` nor `/demo` enters a demo:

- both render the normal home page with the normal title;
- there is no persistent “Demo — sample data, nothing is saved” label;
- there is no “Reset demo” or “Start for real” action;
- there is no populated sample output;
- `.factory/demo.md` is missing;
- no `demo:` storage namespace exists.

Isolation was checked in a fresh browser. After setting the normal
`cc_selected_activities` value to one activity, `/?demo=1` still read that
same value and displayed one activity. A sample session therefore cannot be
shown to avoid real data. No existing user data was used for this check.

Required result: provide one-click, realistic sample data in a separate
storage namespace, keep the demo label visible, and provide reset and exit
actions.

### High 2 — Fifteen public claims have no claim inventory or tagged tests

`.factory/claims.json` is missing. There are no `@claim:<id>` tags in the test
suite. Therefore there were no declared claim commands to run, and every
public claim below is untested under the claims contract. Existing broad tests
and this review’s observations do not replace the required one-test-per-claim
mapping.

| # | Public claim group | Current evidence outside the claim contract |
| ---: | --- | --- |
| 1 | Six complete, finite activities open and have endings | All six opened and saved in this review. |
| 2 | The app works offline after it is ready | Live controlled offline reload passed. |
| 3 | There is no account, feed, advertising, analytics, tracking, or child profiling | No off-origin request occurred during fresh normal use; source review found no tracker. |
| 4 | Creative work stays on the device; only a license can be sent out | IndexedDB/localStorage and network behavior were inspected. |
| 5 | A parent can choose which activities appear | The clean suite covers curation. |
| 6 | Saved pieces persist in the local browser | A saved shape story survived reload. |
| 7 | Export produces a JSON backup | No tagged claim test exists. |
| 8 | Import adds valid pieces without deleting existing work | Valid and invalid import paths worked in this review. |
| 9 | The parent can permanently clear all saved pieces | Clear-all recovery worked in this review. |
| 10 | The four-digit PIN separates settings and stores only a one-way hash | PIN validation worked; the storage behavior has no tagged claim test. |
| 11 | Small-download display hides the cover art | No tagged claim test exists. |
| 12 | Weekend Ink costs $6 once and checkout can be started | The checkout returned 303 and reached the hosted checkout. |
| 13 | Returned licenses are stored, stripped from the URL, checked at most daily, and used offline from cache | A mocked repository test covers part of this; no tagged claim test covers the full public statement. |
| 14 | Weekend Ink adds prompts and paper stamps | A mocked unlock test checks one extra control only. |
| 15 | Core activities, export, safety, and accessibility stay free | No tagged claim test exists. |

Required result: add `.factory/claims.json`, give each claim exactly one
observable demo-based test, run each listed command from a clean checkout, and
remove or narrow any claim that cannot be proved.

### Medium 1 — The first screen does not use the required plain job title

The `h1` is the product name. “Open the paper. Make something.” is a
product-specific metaphor, not the parent’s job. The first screen also lacks
the required adjacent sample action and three separate facts for privacy,
offline use, and price. `.factory/copy-audit.md` is missing.

On a 390×844 phone, the primary action is partly below the first viewport.
This directly fails the requirement to state the job, audience, and first
action before scrolling.

Required result: use a job title such as “Set up offline creative play,” name
the audience in one short sentence, place the sample action fully in the first
phone viewport, and show the three facts as separate lines.

### Medium 2 — Routes, titles, and the 404 path are incomplete

`/404` and a random unknown path both return HTTP 200 and render the normal
home page. There is no designed 404 page or route. `/demo` also returns the
home page with the home title instead of `Demo — Creative Cartridge`.

Activities use replacement hash state such as `#shape-story`. Opening an
activity does not add history, does not give it a route title, and does not
support the required back/forward route behavior. Hash-only routing is allowed
for page anchors, not product screens.

Required result: add real demo and activity URLs with route-specific titles,
use history entries that restore state and focus, and return a deliberate
designed 404 with a way home.

### Medium 3 — Required page structure and sharing metadata are missing

The landing header has no home-linked wordmark or navigation. The page has no
“How it works” section, plain privacy/non-goals section, or visible paid-tier
section in the required order; purchase details are hidden behind the parent
PIN. The footer has no “Built by Param Factory” line or build id. Privacy and
terms have no standard header, navigation, or footer.

The home and legal HTML have no canonical links, Open Graph metadata, Twitter
card metadata, or Apple touch icon. There is no 1200×630 social image.

Required result: complete the standard page order and shared page frame, then
add route metadata and the product-specific social image.

## Clean-checkout command results

The review used a new clone at the documentation commit. Node.js 22 and the
locked Playwright 1.58.2 dependency were available.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 24 packages installed, 25 audited. |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities. |
| `npm run typecheck` | PASS. |
| `npm test` | PASS — production build and 13/13 Playwright tests. |
| `npm run build` | PASS — `dist/` produced. |
| `npm run verify:billing` | PASS — checkout returned 303 to the hosted checkout; invalid-license verification returned 200. |
| `/opt/fleet/lib/verify-url.sh <live> <evidence>` | PASS — HTTP 200, title, `lang=en`, one `h1`, `main`, alt text, button names, and no console/page errors. |

There is no lint command. There are no declared claim commands because the
required claim file is absent; that absence is Finding High 2, not a pass.

The build emits 35,968 bytes of main JavaScript (12.11 KB gzip), 755 bytes of
shared JavaScript, and 12,146 bytes of CSS (3.59 KB gzip). The phone cover is
39,736 bytes. These are within the attached static-product budgets.

Lighthouse 13.4.1 wrote a complete live mobile report with scores of
100/100/100/100 for performance/accessibility/best practices/SEO, FCP 0.91 s,
LCP 1.21 s, TBT 0 ms, and CLS 0. The command then exited nonzero after a browser
tab cleanup crash. The completed report and separate browser runs show no
product runtime failure.

## Live behavior checked

- Fresh 1440×1000 desktop and 390×844 phone contexts loaded without console or
  page errors and without horizontal overflow.
- Each activity produced and saved realistic work. The parent archive reported
  six saved pieces.
- A shape story rejected an empty save, then saved after a shape was added.
- A saved piece survived reload.
- Short and wrong PIN paths, malformed JSON import, valid additive import, and
  clear-all recovery were exercised. The short PIN used the browser’s native
  form validation; the other errors gave visible recovery text.
- Creature name generation passed timestamps 2,147,483,647; 2,147,483,648;
  2,147,483,649; 4,294,967,295; and 4,294,967,296 without `undefined`.
- Keyboard skip navigation moved focus to `main`. Rhythm keyboard input and
  sheet focus behavior passed in the clean suite.
- All visible home and activity controls measured at least 44×44 CSS px on the
  phone.
- Reduced motion changed smooth scroll to `auto`, reduced the sheet animation
  to 0.01 ms, and left no running sheet animation.
- Axe 4.10.2 found zero serious or critical issues on home, all six activities
  at both viewports, privacy, and terms.
- Normal unlicensed browsing made no off-origin requests. The privacy contact
  is a `mailto:` link. Home, privacy, terms, source, and checkout links resolve.
- A service-worker-controlled live reload passed while offline and retained all
  six activity cards. The current generated worker includes versioned caches,
  old-cache cleanup, `skipWaiting`, `clients.claim`, and an update message.
- Live hashed assets use one-year immutable caching. The worker is no-store,
  and the manifest has the correct web-manifest MIME type. CSP,
  Permissions-Policy, HSTS, Referrer-Policy, and `nosniff` are present.

## Earlier findings and current disposition

| Earlier finding | Current disposition |
| --- | --- |
| Serious activity contrast and invalid rhythm ARIA | RESOLVED — current desktop and phone axe scans have zero serious/critical results; rhythm uses a named list with list items. |
| Skip link did not move focus | RESOLVED — keyboard activation focuses `MAIN#main`. |
| Hashed caching, worker caching, CSP, Permissions-Policy, and manifest MIME type | RESOLVED — current live headers match the required policies. |
| Checkout returned 404 | RESOLVED — the live endpoint returns 303 to the hosted checkout. |
| Creature names could contain `undefined` at signed integer boundaries | RESOLVED — all five earlier boundary values produce complete names on live. |
| Mobile footer links were shorter than 44 px | RESOLVED — the clean regression test passes and the current phone sweep found no short visible home or activity target. |

## Deployment identity

The implementation commit is `7d9fb6873256e26d18d8e5d6aded73ba5f208768`.
Commit `f44fe80daacb92c8271e26bc88d7f1bce0e4edd8` only updated the handoff after
that repair. Later commit `0d3fafb2cb6838557414140999f9b1bd6bd5319b`
changes only review documents.

Fifteen deterministic files from a clean build match the live deployment
byte-for-byte. `sw.js` also matches after normalizing only its generated cache
version. The normalized worker SHA-256 is
`fb171fbe682db7a39acdd041908b39157c74d42cceda9fba65a2e38ab37fbbbb`.

## Review result

Do not declare this release accepted. Fix all five findings, add and run all
15 claim tests through the isolated demo, deploy the resulting implementation,
and repeat the strict review.
