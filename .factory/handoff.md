# Creative Cartridge — verification handoff

Work order: `creative-cartridge-verify-2`

Tested candidate: `63344c2cb229836eff6b5d4f33f0440b35aa6dd0`

Tested URL: <https://creative-cartridge.sociobot.in/>

Completed: 2026-08-28

## Disposition

**FAIL. Do not release as passing.** The core six-activity offline PWA is
buildable, accessible, private by default, performant, and deployed from the
candidate. However, the advertised production checkout returns HTTP 404, and
boundary testing found that Creature Works can generate and save names ending
in `undefined`. Mobile footer links also miss the required 44 px target size.

Full independent evidence and reproductions are in
`.factory/verification-2.md`. The earlier `.factory/verification.md` describes
the pre-repair candidate and is retained for history.

## Verification summary

- Clean detached checkout of exact candidate; no product code changed.
- `npm ci`: pass, 25 packages audited, 0 vulnerabilities.
- `npm audit --audit-level=high`: pass, 0 vulnerabilities.
- `npm run typecheck`: pass. No lint script exists.
- `npm test`: pass, 11/11 Playwright tests.
- `npm run build`: pass; `dist/` and 18-file versioned precache produced.
- Independent normal, empty, invalid, boundary, recovery, persistence,
  import/export, keyboard, desktop, and 390 px flows completed locally and
  live.
- Axe serious/critical: 0 across home, parent desk, legal pages, and all six
  desktop/mobile activities; console/page errors: 0.
- Lighthouse live mobile: 98 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.3 s, TBT 150 ms, CLS 0.
- Offline reload: pass locally and live. Actual service-worker replacement:
  activated, old cache replaced, update toast and Reload action shown.
- Privacy: no off-origin request during normal unlicensed use; no analytics,
  tracker, CDN, or remote font.
- Deployment identity: 15 exact SHA-256 matches plus a service-worker match
  after normalizing only its build-time version token; 0 mismatches.
- Response policy: immutable hashed assets, non-cacheable worker, correct
  manifest MIME type, HSTS, CSP, Permissions-Policy, Referrer-Policy, and
  `nosniff` all confirmed live.

## Release blockers

1. **High — checkout unavailable:** production GET
   `/api/v1/products/creative-cartridge/checkout` returns HTTP 404 with
   `{"error":"enabled factory product","status":404}`. Register/enable the
   billing product and exercise one real hosted checkout and license return.
2. **Medium — malformed creature names:** at a signed 32-bit timestamp
   boundary, `Print a name` yields `Doodleundefined` locally and live because
   `(seed >> 2) % last.length` can be negative. Repair the index and cover the
   boundary with a test.
3. **Low — mobile footer targets:** the three footer links are only 16 px tall
   at 390 px (Terms is also 38.1 px wide). Increase their hit areas to at least
   44×44 px.

## Re-run

```sh
npm ci
npm audit --audit-level=high
npm run typecheck
npm test
npm run build
```

After deploying the fixes, repeat the billing endpoint, creature boundary,
390 px target-size, SHA-256 identity, axe, Lighthouse, offline reload, and real
service-worker update checks described in `.factory/verification-2.md`.
