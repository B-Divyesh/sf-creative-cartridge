# Creative Cartridge

Creative Cartridge helps a parent set up six offline creative activities for a
child ages 4–7 on an older family computer. Each activity ends with a small
saved piece: sound painting, shape stories, six-card cinema, rhythm, creature
printing, and paper theatre.

Start at <https://creative-cartridge.sociobot.in/> or try the populated sample
at <https://creative-cartridge.sociobot.in/demo>. The demo is isolated: its
`demo:` localStorage keys and `demo:creative-cartridge` IndexedDB database do
not read or write the real archive.

## Run locally

Requirements: Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

For a production build and local preview:

```sh
npm run build
npm run preview
```

`npm run build` produces `dist/` with the PWA shell, legal pages, social card,
designed 404 page, and versioned service worker.

## Test and verify

```sh
npm audit --audit-level=high
npm run typecheck
npm test
npm run build
npm run verify:billing
```

Every visitor-facing claim is listed in `.factory/claims.json`. Run the listed
commands from a clean checkout; each one starts from `/demo` and checks an
observable result. The billing command contacts the live Sociobot checkout and
verification endpoints. The browser suite also scans the landing page and all
six activity routes for serious or critical accessibility issues.

## Install and use offline

1. Open the app online once and wait for **Ready offline**.
2. Use the browser's Install command when it is available.
3. Reopen it offline and choose an activity.
4. Export a JSON backup from Parent desk when you want a copy.

Saved pieces persist in the local browser. Browser-site-data cleanup can erase
them. Parent desk can import valid JSON pieces, permanently clear the archive,
choose the visible activities, and hide the cover art for a small-download
display. The four-digit parent PIN is a convenience setting; it stores a
one-way hash and is not device security.

## Weekend Ink

Weekend Ink costs $6 USD once. It adds extra prompts and paper stamps. The
hosted Sociobot/Dodo checkout returns a license token; the app stores it,
removes it from the URL, checks it at most once a day, and uses its cached
valid status offline. Core activities, archive controls, safety behavior, and
accessibility remain free.

## Privacy and project files

Normal demo use makes no off-origin requests. Creative Cartridge does not use
third-party runtime scripts. The privacy notice is at `/privacy/`, purchase
terms are at `/terms/`, and the project is MIT licensed.

- `src/main.ts` — app shell, routes, activities, Parent desk, and license flow
- `src/db.ts` — normal and isolated demo IndexedDB archive
- `scripts/generate-sw.mjs` — versioned precache service worker
- `.factory/demo.md` — sample data and isolation contract
- `.factory/claims.json` — public claim inventory and commands
- `.factory/design.md` — visual system and generated-art provenance
