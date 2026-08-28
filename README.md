# Creative Cartridge

Creative Cartridge is a finite, offline creative play space for children ages 4–7 and the grown-ups setting up an older family computer. It is a small Sunday-paper-like PWA with six complete activities: sound painting, shape storytelling, a camera-free six-frame animation, rhythm pads, a creature press, and a paper shadow theatre.

There is no account, feed, advertising, analytics, or child profiling. Creative pieces stay in IndexedDB on the device. A parent can choose which activities appear, export/import a JSON backup, check offline readiness, and use a convenience PIN to keep settings separate from play.

Live: <https://creative-cartridge.sociobot.in>

## Run locally

Requirements: Node.js 22+ and npm.

```sh
npm install
npm run dev
```

Vite prints the local URL. For a production-equivalent local server:

```sh
npm run build
npm run preview
```

The exact deploy build command is `npm run build`. It creates `dist/` with `dist/index.html`, standalone `privacy/index.html` and `terms/index.html`, and a generated versioned service worker.

## Test and verify

```sh
npm test              # production build + Playwright flows, Axe, offline reload
npm run typecheck     # strict TypeScript check
npm run verify:billing # live checkout redirect + invalid-license API contract
```

The browser tests use Playwright 1.58.2 and cover all six launch paths, PIN setup and curation, local saving, creature-name integer boundaries, 390 px footer targets, keyboard rhythm input, skip-link focus, privacy/terms, serious/critical Axe scans on every activity (including its entrance), the static response policy, and a real offline context reload. The billing check is an explicit networked release gate and requires the live Sociobot service.

## Install and use offline

1. Open the app online once and wait for “Ready offline” in the top status ribbon.
2. Use the browser’s Install command (or the install button in the parent desk when supported).
3. Disconnect and reopen the installed app. Activities and existing saves remain available.
4. Use Parent desk → Export when you want a portable backup. Browser/site-data cleanup can erase local work.

The parent PIN is deliberately described as a convenience, not a security boundary. Use an operating-system child account if the device also has a general browser.

## Optional one-time unlock

Weekend Ink is a $6 USD one-time pack of extra prompts and stamps. Checkout and license verification use the Sociobot billing API; the app never embeds a payment provider. Returned licenses are stored under `sb_license:creative-cartridge`, verified no more than daily, and used optimistically from a cached valid verdict offline. The factory registers/switches the product configuration at release.

Core activities, local export, safety behavior, and accessibility are never paid features.

## Project map

- `src/main.ts` — application shell, six activities, parent controls, license flow
- `src/db.ts` — local IndexedDB work archive and validated import
- `scripts/generate-sw.mjs` — post-build service-worker precache generation
- `public/staticwebapp.config.json` — immutable hashed-asset caching, manifest MIME type, and security headers
- `.factory/design.md` — visual thesis, tokens, interaction rules, asset provenance
- `.factory/handoff.md` — verification and release handoff

## Privacy and license

The product privacy notice is at `/privacy/`, purchase/use terms are at `/terms/`, and the source is MIT licensed. The original generated cover source and prompt are kept in `assets/src/`.
