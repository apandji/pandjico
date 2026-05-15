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

## Active

1. **Mobile experience** — Implement [mobile-spec.md](./mobile-spec.md) (hero → Sky context → tall project cards → social proof → contact; single-tap cards; overscroll tray). Aligns with [station-concept-and-critique.md](./station-concept-and-critique.md) Part Two § Landing Page.
2. **Station copy** — Hero position line + Sky as orientation (not footer footnote on home); reframe client logos as “where practice was applied.”
3. **Live smoke (HTTPS)** — On https://apandji.github.io/pandjico/ : footer sky toggle; **⁘** or `?lab=1` then random city (place, time, weather). See [github-pages.md](./github-pages.md) for deploy + `STATIC_CACHE` bumps.
4. **About** (`about.html`) — What a station is and why you tend one (station doc Part One); optional portrait.
5. **Contact** (`contact.html`) — Prefer `/contact` form over raw `mailto` on mobile (mobile-spec § Contact).
6. **CV** (`cv.html`) — Practice record voice, not résumé theater; PDF or structured page.
7. **One full case study** — SYNEK or Color Scroller: replace stub body in the matching `projects/*.html` as the template for the rest.
8. **SYNEK URL** — Keep `tactility-grounding.html` or rename; update home card + `projects/projects.json` + redirect if anything external used the old slug.
9. **Footer extras** — Decide what lives in `.time-footer__extras` (beyond **⁘** lab / scene-debug — station doc Part Three § Product themes).
10. **Collections — media & layout QA** — Lazy video / `IntersectionObserver` for many masonry tiles; list layout QA on real devices; Grid L3 vs fallback. [instrument-collections.md](./instrument-collections.md) §9 / §15.

---

## Done (recent)

| Date | Item |
|------|------|
| 2026-05-14 | **All Works MVP** — `projects/index.html` + JSON + `works-index.js` + rail refresh. [instrument-collections.md](./instrument-collections.md). |
| 2026-05-15 | **All Works v2** — Toolbar, masonry default, list, `?view=list`. [instrument-collections.md](./instrument-collections.md) §15. |
| 2026-05-16 | **Collections mosaic + nav** — Spotlight, `desc`, view transitions, home toolbar tips; `STATIC_CACHE` bumps. |
| 2026-05-16 | **Docs consolidation** — Station specs added; themes/stories folded into station doc Part Three; `instrument-collections.md`; [STATION.md](../STATION.md); queue trimmed. |

---

## Later (not the current queue)

- **Project Longwave / Transmissions** — [project-longwave.md](./project-longwave.md). After mobile + station copy land.
- **`/station` page** — Home for instruments + argument (station doc Part Two § Summary).
- **Trace · Presence · Webring** — Concept only (station doc Part One).
- **11ty + optional CMS** — [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md).
- **Collections Phase 2** — `audience` meta + `?audience=` presets ([instrument-collections.md](./instrument-collections.md) §2.1).
- **GitHub Pages** — [github-pages.md](./github-pages.md) if not already configured.

---

*Reorder **Active** anytime; keep this file honest so remote sessions stay aligned.*
