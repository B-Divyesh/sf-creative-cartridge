# Independent verification 2 — FAIL

Verified: 2026-08-28

Candidate commit: `63344c2cb229836eff6b5d4f33f0440b35aa6dd0`

Live URL: <https://creative-cartridge.sociobot.in/>

Work order: `creative-cartridge-verify-2`

## Verdict

**FAIL.** The candidate's core six-activity PWA, local persistence, offline
reload, accessibility baseline, response policy, and deployed build identity
all pass. Release acceptance still fails because the advertised one-time
purchase is unavailable: the production checkout endpoint returns HTTP 404.
Independent boundary testing also found a reproducible broken Creature Works
name, and the mobile footer links miss the contract's 44 px target size.

No product code was modified during verification.

## Clean-checkout repository gates

Testing ran from a clean detached checkout of the exact candidate at
`/tmp/creative-cartridge-verify-pXuwUG`; `git status --short` was empty before
and after the checks.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 24 packages installed, 25 audited, 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS — strict `tsc --noEmit` |
| lint | N/A — no lint script or linter is present |
| `npm test` | PASS — 11/11 Playwright tests after their production build |
| exact production build, `npm run build` | PASS — `dist/` produced with an 18-file versioned precache |

The final build emitted 35.90 KB main JS plus 0.76 KB initial helper JS
(12.53 KB combined gzip) and 12.00 KB CSS (3.56 KB gzip). The responsive cover
assets are 39,736 bytes at 800 px and 119,828 bytes at 1280 px. There are no
font downloads. These are within the 200 KB JS, 50 KB CSS, 120 KB font, and
300 KB mobile-image budgets. Packaging into a consumer project is not
applicable to this directly deployed static PWA.

## Independent product exercise

The production build was exercised independently in Chromium 1.58.2 at
1440×1000 and 390×844, locally and again on the live deployment.

- Fresh state showed exactly six finite activities, one `h1`, a `main`
  landmark, a working skip link, meaningful image alt text, and no page
  overflow.
- Parent controls rejected a short PIN, explained a wrong PIN, accepted the
  correct PIN, supported a zero-activity empty issue, and recovered to all six
  activities.
- Ink Orchestra accepted a keyboard arrow/Space mark, persisted the sound
  choice, and saved locally.
- Shape Stories rejected move/save on an empty page, then saved a four-piece
  story.
- Six-card Cinema rejected blank play/save, enforced exactly six frames,
  played once and stopped, then saved.
- Rhythm Press rejected blank play/save, accepted number-key input, capped the
  tape at 16 hits with feedback on hit 17, and saved.
- Creature Works rejected save before naming, then changed all three rollers
  and saved in the normal case. Its timestamp boundary defect is recorded
  below.
- Pocket Theatre changed both shadows and the sky, gave immediate feedback,
  and saved.
- All six pieces survived reload. Malformed JSON and structurally invalid
  imports were rejected without data loss; a valid backup added a seventh
  piece; export produced a dated JSON download.
- The parent dialog, activity sheets, skip links, keyboard rhythm input, and
  keyboard canvas input were operable without a pointer. Focus outlines are
  3 px blue; sheet Escape returns to the launcher.

The independent run observed zero console errors and zero uncaught page
errors. Axe 4.10.2 found **0 serious/critical violations** on home, populated
parent desk, privacy, terms, all six populated desktop activities, and all six
390 px activities. Reduced-motion mode changed smooth scrolling to `auto` and
reduced each sheet entrance to 0.01 ms. Visual review found no clipping or
unintended horizontal page overflow.

`/opt/fleet/lib/verify-url.sh` independently returned:

- local preview: HTTP 200, 600 ms, title and `lang=en`, one `h1`, `main`, no
  missing alt, no unlabeled buttons, no console/page errors;
- live URL: HTTP 200, 635 ms, the same semantic result and no browser errors.

Lighthouse 13.4.1 against the live mobile URL scored **98 performance, 100
accessibility, 100 best practices, and 100 SEO**: FCP 1.0 s, LCP 1.3 s, TBT
150 ms, CLS 0, and Speed Index 1.2 s, with no run warnings.

## PWA, privacy, and response policy

- A real service-worker-controlled offline reload worked locally and live and
  showed `Offline — the cartridge still works` with all activities available.
- A real worker replacement (new generated cache version followed by
  `registration.update()`) reached `activated`, replaced the old cache, and
  showed `A fresh offline issue is ready.` with a Reload button on an
  already-installed launch.
- The manifest is served as `application/manifest+json`, uses standalone
  display and a versioned start URL, matches the newsprint theme, and provides
  real 192×192 and 512×512 PNG icons plus a maskable declaration.
- Normal unlicensed desktop/mobile use made **zero off-origin requests**.
  Static review found no CDN, remote font, tracker, analytics, or child-data
  endpoint. Creative work remained in IndexedDB and preferences/PIN hash in
  localStorage. Only a parent-supplied license is sent to the disclosed
  Sociobot verification API.
- Live hashed JS/CSS use `public, max-age=31536000, immutable`; `/sw.js` uses
  `no-cache, no-store, must-revalidate`; the manifest uses a one-hour
  revalidation policy. HTTPS/HSTS, CSP, Permissions-Policy, Referrer-Policy,
  and `X-Content-Type-Options: nosniff` are present.

## Live build identity

The live deployment matches the candidate build. SHA-256 comparison produced
exact byte matches for 15 deployable files: all HTML routes, four hashed
JS/CSS assets, both responsive artworks, both icons, manifest, offline page,
robots, and sitemap. The service worker also matches after replacing only its
expected build-time cache token (`cc-mtcfz3mq` in the clean build versus
`cc-mtcfdkek` live). Result: **16 matches, 0 content mismatches**.

## Defects

### High

1. **The advertised $6 one-time purchase cannot be started.** The parent desk
   renders `Buy Weekend Ink` linking to
   `https://api.sociobot.in/api/v1/products/creative-cartridge/checkout`.
   Fresh `GET` and `HEAD` requests both returned HTTP 404; the GET body was
   `{"error":"enabled factory product","status":404}`. Invalid-license
   verification itself is online and correctly returned
   `{"expires_at":null,"reason":"invalid","valid":false}`, so this is
   specifically a missing/disabled production checkout product. A real buyer
   cannot purchase the advertised unlock.

### Medium

1. **Creature Works can print a broken species name.** Its surname index uses
   `(seed >> 2) % last.length`. JavaScript's signed 32-bit shift can make that
   remainder negative, so array lookup returns `undefined`. Forcing the
   timestamp boundary `Date.now() = 2147483648` and choosing `Print a name`
   produced `Doodleundefined` in both the clean local build and live URL. The
   malformed name can then be saved. Use a non-negative integer index and add
   a regression test over signed-shift boundary values.

### Low

1. **Mobile footer text links miss the stated 44×44 target size.** At 390 px,
   Privacy measured 45.9×16 px, Terms 38.1×16 px, and Source 44.4×16 px.
   Buttons and form controls met 44×44, and axe did not classify these inline
   links as serious, but the attached product design/accessibility contract
   explicitly requires 44×44 click targets.

## Required next verification

Enable/register the production `creative-cartridge` product and complete one
hosted checkout/return; repair the non-negative creature-name indexing and add
a boundary regression; enlarge the mobile footer link hit areas. Then repeat
the checkout, boundary, mobile-target, clean build/test, live identity, and
offline/update checks before changing this verdict to PASS.
