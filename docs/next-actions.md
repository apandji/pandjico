# Active tasks

**This file is the single queue** for what to do next on the site. When you work with Cursor remotely, open or @-mention this doc first so work stays ordered and traceable.

**Doc map:** [README.md](./README.md) · [STATION.md](../STATION.md) · **North star:** [station-concept-and-critique.md](./station-concept-and-critique.md) · **Mobile:** [mobile-spec.md](./mobile-spec.md) · **Longwave:** [project-longwave.md](./project-longwave.md)

Long specs live elsewhere; **done spec lines** are crossed off in those files (for example [instrument-collections.md](./instrument-collections.md)), not duplicated here.

---

## Using this with Cursor

- Keep **numbered items** under **Active** in priority order (1 = next unless you say otherwise).
- When something ships, **move it to “Done (recent)”** with a one-line summary and date, or strike it in the feature doc if it was spec-only.
- For larger work, add a **link to the feature doc** here instead of pasting the whole spec.

---

## Bugs

- **Works rail at scroll=0** — At every viewport size, initial load / `scrollY === 0` should snap or align so the **first work card** in the rail is the active item (not a later card from scroll-attention math or split-layout offset).
- **Mobile polish (rough pass)** — Needs a dedicated polish pass on small viewports. Known rough edges from QA: wrong section order at top (logos/CTAs before hero), clipped client logos, large dead gaps, hero pushed to bottom, desktop split layout bleeding through. Track against [mobile-spec.md](./mobile-spec.md).
- **Hero client logos** — Mobile `filter` override removed. Light idle: `soft-light` restored (opacity ~0.62 vs pre-mobile 0.57). Logos moved out of `<section class="hero">` for flex order — revisit if blend reads wrong on some skies.

---

## Active

1. **Mobile experience (polish)** — First pass shipped (sky band, scroll order, tall cards, contact band, overscroll tray, single-tap). Still to tune: scroll-snap, card entrance IO, lazy video `preload="none"`. [mobile-spec.md](./mobile-spec.md).
2. **Live smoke (HTTPS)** — On https://apandji.github.io/pandjico/ : footer sky toggle; **⁘** or `?lab=1` then random city (place, time, weather). See [github-pages.md](./github-pages.md) for deploy + `STATIC_CACHE` bumps.
3. **CV** (`cv.html`) — Practice record voice, not résumé theater; PDF or structured page.
4. **Case studies** — SYNEK template in place; flesh out metrics/media. Color Scroller + Ascension still stubs.
5. **Contact** — Confirm FormSubmit email (`hello@pandji.co` in `contact.html`) and test submit on device.
6. **About** — Optional portrait; tighten voice after you read it aloud. **`station.html`** stub live (hero palette + footer + lorem) — swap in your copy.
7. **Footer extras** — Decide what lives in `.time-footer__extras` (beyond **⁘** lab / scene-debug — station doc Part Three § Product themes).
8. **Collections — media & layout QA** — Lazy video / `IntersectionObserver` for many masonry tiles; list layout QA on real devices; Grid L3 vs fallback. [instrument-collections.md](./instrument-collections.md) §9 / §15.

---

## Done (recent)

| Date | Item |
|------|------|
| 2026-05-14 | **All Works MVP** — `projects/index.html` + JSON + `works-index.js` + rail refresh. [instrument-collections.md](./instrument-collections.md). |
| 2026-05-15 | **All Works v2** — Toolbar, masonry default, list, `?view=list`. [instrument-collections.md](./instrument-collections.md) §15. |
| 2026-05-16 | **Collections mosaic + nav** — Spotlight, `desc`, view transitions, home toolbar tips; `STATIC_CACHE` bumps. |
| 2026-05-16 | **Docs consolidation** — Station specs added; themes/stories folded into station doc Part Three; `instrument-collections.md`; [STATION.md](../STATION.md); queue trimmed. |
| 2026-05-15 | **Station copy + mobile v1** — Hero position line; sky band; “where practice was applied”; mobile scroll flow + overscroll tray; single-tap cards. |
| 2026-05-15 | **About + Contact** — Station-framed about page; FormSubmit contact form (`hello@pandji.co` — verify). |
| 2026-05-15 | **SYNEK** — `synek-launch.html` case study template; redirect from `tactility-grounding.html`; home + `projects.json` updated. `STATIC_CACHE` → 43. |

---

## Later (not the current queue)

- **Project Longwave / Transmissions** — [project-longwave.md](./project-longwave.md). After mobile + station copy land.
- **`/station` page — copy & instruments** — Shell at `station.html`; flesh out argument + instrument list (station doc Part Two § Summary).
- **Trace · Presence · Webring** — Concept only (station doc Part One).
- **11ty + optional CMS** — [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md).
- **Collections Phase 2** — `audience` meta + `?audience=` presets ([instrument-collections.md](./instrument-collections.md) §2.1).
- **GitHub Pages** — [github-pages.md](./github-pages.md) if not already configured.

---

*Reorder **Active** anytime; keep this file honest so remote sessions stay aligned.*
