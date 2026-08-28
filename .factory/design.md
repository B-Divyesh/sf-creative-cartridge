# Creative Cartridge — visual thesis

## Direction: the small Sunday press

Creative Cartridge is a **monochrome typographic broadsheet**, not a games portal. Its home screen resembles a finite children’s newspaper delivered once and kept: one masthead, six numbered departments, strong rules, woodcut-like marks, and no feed mechanics. The metaphor makes the promise visible—there is a whole issue to explore, but no bottomless next page. Large type and physical, inked controls make an old laptop feel like a self-contained creative instrument.

The treatment is intentionally single-mode. A pale newsprint ground is explicitly painted throughout; this is the product’s material, not an unthemed light mode. Child-facing work surfaces get generous space and parent utilities recede into the colophon.

## Palette

| Token | Value | Job |
|---|---:|---|
| `paper` | `#F3EEDC` | warm, low-glare newsprint background |
| `paper-raised` | `#FFFBEF` | work surfaces and modal sheets |
| `ink` | `#171714` | type, borders, primary controls |
| `ink-muted` | `#59574F` | secondary copy (7.0:1 on paper) |
| `press-red` | `#A72F2A` | primary action and registration mark |
| `press-blue` | `#1E5D73` | alternate ink / focus and sound |
| `success` | `#28623C` | ready and saved states |
| `warning` | `#805413` | attention without alarm |
| `danger` | `#8B2824` | destructive action |

All body text meets 4.5:1. State is always accompanied by a word, symbol, or pattern. The restrained two-ink accents evoke cheap community print, not candy-coloured edutainment.

## Typography

- **Display:** Georgia, `Times New Roman`, serif. Tall newspaper headlines, set tightly with deliberate line breaks. These trusted system faces avoid a font download and suit machines with limited bandwidth.
- **Utility/body:** Arial, Helvetica, sans-serif. Plain captions, buttons, activity instructions, and parent controls.
- Scale: 14px caption, 16–18px body, 24px section, 40–72px display. Body line height 1.55; reading measure never exceeds 68 characters. Numerals use tabular figures in counters and status rows.

## Spacing and layout

The base unit is 4px. Repeated intervals are 8, 12, 16, 24, 32, 48, and 64px. A 1px rule separates editorial regions; a 3px rule indicates an actionable plate. Desktop uses a twelve-column broadsheet with asymmetric departments; 390px collapses to a single reading column and drops ornamental captions, never tasks. Targets are at least 44×44px and spaced by 8px.

Cards appear only for the six genuinely independent activities. Inside an activity, grouping comes from proximity and typographic rules rather than nested panels. Corners stay nearly square (0–4px) to preserve the printed-sheet character.

## Interaction grammar

- A pressed button shifts 2px like a letterpress platen and returns on release.
- Opening an activity lifts a full paper sheet from its originating department; closing returns to the issue index.
- Creative marks use the same ink palette and slightly imperfect authored SVG stamps.
- Every action answers immediately in visible copy: “Saved to this device,” “Sound paused,” or a count.
- Child controls use nouns plus verbs (“Add a moon”, “Play cards”). Parent utilities use explicit administrative language.
- Empty work surfaces contain one concrete first step. Errors say what remains safe and what to try.

Keyboard: Tab reaches every command; Enter/Space activate; rhythm pads also use 1–8; selected drawing tools use arrows where appropriate. Dialog focus is trapped and returned to its opener. Focus uses a 3px blue outline with 3px offset.

## Motion policy

Interface transitions last 180–240ms and animate only opacity and transform. Activity sheets rise from the index; saved notices stamp into place. The flipbook and rhythm loops are user-started, clearly pausable, and never flash above 3Hz. With `prefers-reduced-motion: reduce`, transitions become instant, the saved stamp uses opacity only, and flipbook playback advances without interpolated movement.

## Asset plan and provenance

- Hero: one original AI-generated editorial still-life of a cardboard activity cartridge spilling abstract paper shapes, rhythm dots, and story frames onto newsprint. It is atmosphere only, never a false product screenshot. It will ship as responsive WebP (≤300 KB) plus an optimized fallback, with explicit dimensions.
- Interface icons and activity stamps: hand-authored inline SVG/CSS geometric forms, MIT with the application.
- PWA icons: hand-authored SVG-derived print registration mark exported locally to PNG.

### Hero prompt sheet

**Subject:** a handmade cardboard creative cartridge, six abstract paper toys emerging: music dots, geometric story pieces, flipbook frames, rhythm blocks, creature parts, shadow-stage cutouts. **World/materials:** children’s Sunday newspaper, torn deckled paper, ink roller texture, letterpress misregistration, flat tabletop assemblage. **Light/lens:** soft overcast window light, overhead editorial still life, minimal shallow relief, no dramatic shadows. **Palette words:** warm cream newsprint, carbon black, restrained brick red, restrained teal blue. **Composition:** wide landscape, generous quiet paper at the left for an overlaid headline, objects concentrated at right and bottom. **Negative list:** no people, hands, faces, screens, readable words, letters, logos, brands, copyrighted characters, gradients, neon, glossy plastic, photorealistic devices, watermark.

**Generated asset provenance:** `assets/src/press-cartridge.png`, Azure AI Foundry `factory-image` deployment, generated 2026-08-28 from the prompt above, original to Creative Cartridge. Reviewed for anatomy, seams, text artifacts, unintended symbols/brands, and palette consistency; accepted without edits. Source prompt is preserved in `assets/src/press-cartridge.prompt.json`. The footer discloses that the cover artwork is AI-generated.
