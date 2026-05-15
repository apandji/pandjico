# Active tasks

**This file is the single queue** for what to do next on the site. When you work with Cursor remotely, open or @-mention this doc first so work stays ordered and traceable.

**Doc map:** [README.md](./README.md) · [case-studies-11ty.md](./case-studies-11ty.md) · [STATION.md](../STATION.md) · [station-concept-and-critique.md](./station-concept-and-critique.md) · [station-page.md](./station-page.md) · [mobile-spec.md](./mobile-spec.md)

Long specs live elsewhere; **done** lines are struck in feature docs or logged in **Done (recent)**—not duplicated here.

---

## Using this with Cursor

- Keep **numbered items** under **Active** in priority order (1 = next unless you say otherwise).
- When something ships, **move it to “Done (recent)”** with a one-line summary and date.
- For larger work, **link to the feature doc** instead of pasting the whole spec.

---

## Case studies (11ty — next)

**Guide:** [case-studies-11ty.md](./case-studies-11ty.md).

| # | Step |
|---|------|
| 1 | **Write:** edit `content/projects/synek-launch.md`, `sensory-language.md`, `adaptive-interfaces.md` |
| 2 | **Preview:** `npm run serve` |
| 3 | **Ship:** `npm run build` before commit (syncs HTML into `projects/`) |
| 4 | New slug → add `.md`, `permalink`, **`scripts/sync-built-projects.js`** `SLUGS`, **`projects.json`**, **`sw.js` precache** if needed |
| 5 | *(Stretch)* Generate `projects/projects.json` from front matter |

**Park:** Tina/Decap/Sanity · GitHub Actions → `_site/` only.

---

## Bugs

- **Station day bar tooltip** — Re-check left/right clamp on narrow viewports at 0% / 100%.
- **Works rail at scroll=0** — First card should be active at `scrollY === 0`.
- **Mobile polish** — [mobile-spec.md](./mobile-spec.md).
- **Hero client logos** — Blend/opacity on some skies after flex reorder.

---

## Active (after tonight’s session)

1. **Case studies — content** — Write in `content/projects/*.md` (SYNEK, Color Scroller, Ascension stubs); **`npm run build`** before deploy. Metrics/outcomes still TBD on SYNEK.
2. **11ty Phase 2** — `projects.json` + home rail from one data source; GH Pages Action → `_site/`. [case-studies-11ty.md](./case-studies-11ty.md) · [github-pages.md](./github-pages.md).
3. **Optional CMS** — Tina or Decap after Markdown authoring feels good.
4. **Mobile experience (polish)** — Scroll-snap, card IO, lazy video `preload="none"`. [mobile-spec.md](./mobile-spec.md).
5. **Live smoke (HTTPS)** — Footer sky, **⁘** / `?lab=1` on GH Pages.
6. **CV** (`cv.html`) — Practice record voice.
7. **Contact** — Verify FormSubmit (`hello@pandji.co`).
8. **Station page (finish Phase A)** — Sky panel §7.1, instruments prose §7.3. [station-page.md](./station-page.md).
9. **Footer extras** — What lives in `.time-footer__extras`.
10. **Collections QA** — Masonry video lazy-load, list layout on devices. [instrument-collections.md](./instrument-collections.md).

---

## Done (recent)

| Date | Item |
|------|------|
| 2026-05-17 | **11ty case studies scaffold** — `content/projects/*.md`, layouts, passthrough + `npm run build` → sync `projects/*.html`. |
| 2026-05-15 | **Docs — case study path** — [case-studies-11ty.md](./case-studies-11ty.md) as session guide; README + queue reprioritized for 11ty. |
| 2026-05-15 | **Station interior v1** — Toolbar, day bar, three columns, sitemap, **⁘** → station. `STATIC_CACHE` → 62. |
| 2026-05-15 | **SYNEK** — `synek-launch.html` template; redirect from `tactility-grounding.html`. |
| 2026-05-15 | **About + Contact** — Station-framed about; FormSubmit contact. |
| 2026-05-15 | **Station copy + mobile v1** — Sky band, scroll flow, overscroll tray, single-tap cards. |
| 2026-05-16 | **Docs consolidation** — Station specs; [STATION.md](../STATION.md). |
| 2026-05-16 | **Collections mosaic + nav** — Spotlight, VT, toolbar tips. |
| 2026-05-15 | **All Works v2** — Toolbar, masonry, list, `?view=list`. |
| 2026-05-14 | **All Works MVP** — `projects/index.html` + JSON + `works-index.js`. |

---

## Later

- **Project Longwave / Transmissions** — [project-longwave.md](./project-longwave.md)
- **Station Phase B** — Tone.js, Presence from Supabase — [station-page.md](./station-page.md) §10
- **Trace · Webring** — Concept only
- **Collections Phase 2** — `audience` meta + `?audience=` — [instrument-collections.md](./instrument-collections.md) §2.1
- **Sanity / Storyblok** — Only if Markdown + Tina/Decap aren’t enough — [case-studies-11ty.md](./case-studies-11ty.md)

---

*Reorder **Active** anytime; keep this file honest so remote sessions stay aligned.*
