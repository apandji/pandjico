# Active tasks

**This file is the single queue** for what to do next on the site. When you work with Cursor remotely, open or @-mention this doc first so work stays ordered and traceable. Long specs live elsewhere; **done spec lines** are crossed off in those files (for example [feature-all-works.md](./feature-all-works.md)), not duplicated here.

---

## Tomorrow (2026-05-16)

Start here after sync — short punch list:

1. **Pull + Pages** — `git pull`; confirm https://apandji.github.io/pandjico/ loads; hard-refresh once (service worker).  
2. **HTTPS smoke** — Footer **Here** pin; **⁘** / `?lab=1` random city (needs secure context).  
3. **Case study + VT** — Pick one `projects/*.html` stub: flesh body as the template; add `<meta name="view-transition" content="same-origin">` + a hero `view-transition-name` that pairs with mosaic cards (`work-<slug>`).  
4. **All Works remaining polish** — Lazy video / `IntersectionObserver` for many masonry tiles; list layout QA on a real phone; spot-check Grid L3 masonry vs fallback.  
5. **Content queue** — Contact page, CV, About (see **Active** below for wording).

---

## Using this with Cursor

- Keep **numbered items** under **Active** in priority order (1 = next unless you say otherwise).
- When something ships, **move it to “Done (recent)”** with a one-line summary and date, or strike it in the feature doc if it was spec-only.
- For larger work, add a **link to the feature doc** here instead of pasting the whole spec.

---

## Active

1. **Live smoke (HTTPS)** — On https://apandji.github.io/pandjico/ : footer **Here** pin; **⁘** or `?lab=1` then random city (place, time, weather). Needs a secure context. See [github-pages.md](./github-pages.md) for deploy + `STATIC_CACHE` bumps.
2. **Contact** (`contact.html`) — `mailto`, form, or copy you trust.
3. **CV** (`cv.html`) — PDF link, embed, or structured résumé.
4. **About** (`about.html`) — Bio; optional portrait; tighten story.
5. **One full case study** — SYNEK or Color Scroller: replace stub body in the matching `projects/*.html` as the template for the rest.
6. **SYNEK URL** — Keep `tactility-grounding.html` or rename; update home card + `projects/projects.json` + redirect if anything external used the old slug.
7. **Footer extras** — Decide what lives in `.time-footer__extras` (beyond **⁘** lab / scene-debug behavior documented in [user-stories-and-scope.md](./user-stories-and-scope.md)).
8. **All Works — media & layout QA** — Lazy video / `IntersectionObserver` for many masonry tiles; list layout QA on real devices; confirm native masonry in browsers that ship [Grid L3](https://www.w3.org/TR/css-grid-3/) (fallback is multicol today). Spotlight / desc / view transitions **shipped** (see Done). [feature-all-works.md](./feature-all-works.md) §9 / §15.

---

## Done (recent)

| Date | Item |
|------|------|
| 2026-05-14 | **All Works MVP** — `projects/index.html` + `projects/projects.json` + `js/works-index.js` + `work-cards.js` rail refresh + `css/styles.css` + `sw.js` precache bump. Spec checklist crossed off in [feature-all-works.md](./feature-all-works.md). |
| 2026-05-15 | **All Works v2** — Top toolbar, **masonry default** (multicol fallback + `@supports (grid-template-rows: masonry)`), **list** rows, `?view=list`, `data-works-layout` + `work-cards.js` host query; removed split hero / `hero-panel-scroll` on this page. [feature-all-works.md](./feature-all-works.md) §15. |
| 2026-05-16 | **All Works mosaic + nav chrome** — Masonry **spotlight** (hover / focus / touch: scale, z-index, peers recede); **`desc`** on tiles; **View Transitions** (`document.startViewTransition` + per-card `view-transition-name` + same-origin meta); **home** link SVG morph + rotating typewriter tips + tooltip hit fixes; `STATIC_CACHE` bumps. |

---

## Later (not the current queue)

- **11ty + optional CMS** — [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md); single collection for cards + project pages when you are ready.
- **All Works Phase 2** — `audience` meta + `?audience=` presets ([feature-all-works.md](./feature-all-works.md) §2.1); layout v2 is §15 (not the same as `audience`).
- **GitHub Pages setup** — If not already: repo **Settings → Pages** → branch **main**, folder **`/`**; live URL https://apandji.github.io/pandjico/ — details in [github-pages.md](./github-pages.md).

---

*Reorder **Active** anytime; keep this file honest so remote sessions stay aligned.*
