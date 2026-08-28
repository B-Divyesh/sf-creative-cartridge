# Creative Cartridge — build handoff

## Independent verification disposition — **FAIL**

Verified 2026-08-28 against commit
`e7a9c9bb195678b53ff9d8d56a580a67eb76dce3` and
<https://creative-cartridge.sociobot.in/>.

The clean install, strict type check, exact production build, and repository
test suite passed, and live/offline deployment identity was independently
confirmed. This is nevertheless a **FAIL**: axe found serious color-contrast
violations in Rhythm Press, Creature Works, and Pocket Theatre, plus invalid
ARIA labels on Rhythm Press beat `div`s. The live deployment also uses only
`Cache-Control: public, must-revalidate, max-age=30` for hashed assets rather
than immutable long-lived caching. See
[`.factory/verification.md`](./verification.md) for full commands, interaction
coverage, exact measurements, header evidence, and severity-ranked defects.

Work order: `creative-cartridge-build-1`
Completed: 2026-08-28

## What shipped

- A Vite + vanilla TypeScript PWA with a product-specific monochrome broadsheet visual system.
- Six complete, finite child activities: Ink Orchestra (pointer/keyboard sound painting), Shape Stories, Six-card Cinema, Rhythm Press (pads plus 1–8 keys), Creature Works, and Pocket Theatre.
- Local IndexedDB saves with per-activity shelves, clear confirmation, parent JSON export, and validated additive import.
- Parent PIN setup/unlock (salted SHA-256 convenience gate), activity selection, empty issue state, sound choice, small-download display, install affordance, and an offline health check.
- Versioned generated service worker with full shell precache, cache-first local assets, network handling for billing, offline navigation fallback, `skipWaiting`, client claim, and an in-app update notice.
- PWA manifest, 192/512/maskable icons, matching splash colours, `/privacy/`, `/terms/`, robots and sitemap.
- Weekend Ink $6 one-time unlock contract: Sociobot hosted checkout, return-token storage and URL cleanup, daily cached verification, optimistic offline access from a valid cache, revoked/invalid handling, and paste-to-restore. Core activities, export, safety, and accessibility are free.
- Original generated broadsheet cover artwork, responsive WebP exports, source and prompt provenance in `assets/src/`, and public disclosure. The mobile file is 39 KB and the desktop file is 118 KB.

## How to run

```sh
npm install
npm run dev
```

Production build/deploy command:

```sh
npm run build
```

Output is exactly `dist/`, with `dist/index.html` at its root plus `dist/privacy/index.html` and `dist/terms/index.html`.

## Verification performed

- `npm test`: **8 passed**. This runs a clean production build and Playwright 1.58.2 flows for all six launch paths, PIN setup/curation, IndexedDB saving, keyboard rhythm input, serious/critical Axe checks, real `context.setOffline(true)` reload, legal pages, and returned-license unlock.
- `npx tsc --noEmit`: passed with strict TypeScript settings.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ .factory/evidence`: passed; title present, `lang=en`, exactly one h1, main landmark, zero missing alt text, zero unlabeled buttons, zero console/page errors. Local load measured 553 ms.
- Lighthouse 12.8.2 mobile against the production preview:

  | Category / metric | Result |
  |---|---:|
  | Performance | 100 |
  | Accessibility | 100 |
  | Best Practices | 100 |
  | SEO | 100 |
  | LCP | 1.7 s |
  | FCP | 1.1 s |
  | Total blocking time | 0 ms |
  | CLS | 0 |

- Built initial assets: main JS 35.81 KB raw / 12.04 KB gzip; shared helper JS 0.76 KB raw; CSS 11.84 KB raw / 3.51 KB gzip. No runtime CDN, remote font, tracker, analytics, or third-party child-data request.
- 390×844 and 1440×1000 screenshots were visually reviewed: no horizontal overflow, clipped controls, or generic-template regressions.

## Known gaps / release steps

- The factory still needs to register the `creative-cartridge` paid product and confirm a real hosted checkout/return against its test product before release. The client contract and mocked return/verify flow are tested; no provider or product ID is embedded.
- Install prompts are browser-controlled. When `beforeinstallprompt` is unavailable, the parent desk gives the browser-menu instruction.
- The PIN intentionally is not an OS/browser security boundary; this is stated in the interface, README, and terms.

This builder handoff is superseded by the independent **FAIL** disposition
above; the listed accessibility and caching defects remain release blockers.
