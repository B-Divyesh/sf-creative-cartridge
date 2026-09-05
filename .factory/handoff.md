# Creative Cartridge — review handoff

Work order: `creative-cartridge-review-1`

Reviewed: 2026-09-05

Live URL: <https://creative-cartridge.sociobot.in/>

Implementation candidate: `7d9fb6873256e26d18d8e5d6aded73ba5f208768`

Documentation commit at review start: `0d3fafb2cb6838557414140999f9b1bd6bd5319b`

## Result

**FAIL — 5 findings and 15 untested public claims.**

The full evidence and required repairs are in `.factory/review-1.md`.

No product code was changed. This review added the review report and replaced
this handoff with the current disposition.

## What passed

- Clean install, high-severity audit, typecheck, 13 Playwright tests, build,
  and billing verification.
- All six live activities produced and saved work. Local reload persistence,
  PIN recovery, import recovery, clear-all, timestamp boundaries, keyboard
  focus, reduced motion, and 44 px targets passed.
- Live desktop and phone runs had no console or page errors.
- Axe found zero serious/critical issues on home, every activity, privacy, and
  terms at the tested viewports.
- Live service-worker-controlled offline reload passed.
- Current caching, manifest MIME type, and security headers passed.
- The checkout starts and reaches the hosted checkout.
- Fifteen deterministic live files match the clean candidate build. The worker
  matches after normalizing its generated cache version.
- Lighthouse wrote a complete 100/100/100/100 report; its command then hit a
  browser-tab cleanup crash after the report was complete.

## What failed

- No one-click populated demo, sample label, reset, exit, or isolated demo
  storage exists. `.factory/demo.md` is missing.
- `.factory/claims.json` and claim-tagged tests are missing, leaving 15 public
  claim groups untested under the required contract.
- The first screen uses the brand as `h1` and a metaphor as its next heading.
  The primary action is partly below the initial 390×844 viewport.
- Unknown routes return the normal app with HTTP 200. There is no designed 404,
  and activity screens do not have real URLs, titles, or history behavior.
- The required landing sections, shared legal-page frame, canonical/Open Graph/
  Twitter metadata, Apple touch icon, and social image are missing.

## Run the current checks

```sh
npm ci
npm audit --audit-level=high
npm run typecheck
npm test
npm run build
npm run verify:billing
```

After repair, also run every command declared in the new
`.factory/claims.json` from a clean checkout and verify the demo in a new phone
and desktop browser.

## Evidence files

- `.factory/review-1.md`
- `/work/.evidence/qa-report.md`
- `/work/.evidence/qa-result.json`
- `/work/.evidence/live-desktop-first-screen.png`
- `/work/.evidence/live-phone-first-screen.png`
- `/work/.evidence/verify-url/verify.json`
- `/work/.evidence/lighthouse.json`
