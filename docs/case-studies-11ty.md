# Case studies — 11ty + CMS

**Goal:** Write and ship project case studies from **Markdown** (and optional browser CMS later), without hand-duplicating HTML, card metadata, and URLs.

**Open this doc first** when you sit down to work. Long-term CMS/deploy notes are below; **author** case studies in `content/projects/*.md`.

**Related:** [github-pages.md](./github-pages.md) (deploy) · [instrument-collections.md](./instrument-collections.md) (`projects.json`)

---

## Authoring workflow

| Step | Command / action |
|------|------------------|
| Install once | `npm install` |
| Edit | `content/projects/<slug>.md` — front matter + Markdown body |
| Preview | `npm run serve` → [http://localhost:8080](http://localhost:8080) (default Eleventy port) |
| Refresh static HTML in repo | `npm run build` — builds `_site/`, then **`scripts/sync-built-projects.js`** copies case pages into `projects/` for GitHub Pages (root deploy) |

**Layouts (`_includes/layouts/`):** `project-case.njk` (SYNEK-style sections; each `##` → `<section class="case-block">`) · `project-simple.njk` (title + body, “All works” back link).

**Synced slugs:** edit the `SLUGS` array in `scripts/sync-built-projects.js` when you add a Markdown case (`synek-launch`, `sensory-language`, `adaptive-interfaces` today).

**Do not hand-edit** synced `projects/<slug>.html` for those slugs — change the `.md` and run `npm run build`.

**Still manual:** `projects/projects.json` until we generate it from front matter.

### Decisions (MVP)

| Topic | Choice |
|-------|--------|
| **URLs** | `projects/<slug>.html` |
| **Scope** | Case studies from MD; home/station passthrough |
| **Format** | Markdown (not MDX) |
| **Images** | `images/projects/…` |
| **CMS** | After Markdown feels good |
| **Build** | `_site/` + sync into `projects/` for now |

**Scaffold:** `package.json`, `eleventy.config.cjs`, `_includes/layouts/`, `content/projects/*.md`, sync script — **done.** Next: generate `projects.json` from collection (optional GitHub Action for `_site/` deploy).

---

## Current repo (case-study surface)

| Asset | Location | Notes |
|-------|----------|--------|
| **Markdown sources** | `content/projects/*.md` | **Edit here** |
| **Synced case HTML** | `projects/<slug>.html` (synek, sensory-language, adaptive) | From `npm run build` |
| **Placeholder rail** | `projects/placeholder-case-study.html` | Shared stub URLs |
| **Legacy redirect** | `projects/tactility-grounding.html` | → synek URL |
| **All Works** | `projects/index.html` + `projects.json` | Metadata still manual |
| **Home rail** | `index.html` | Until JSON is generated from MD |
| **Node + 11ty** | `package.json` | `npm run build` · `npm run serve` |

---

## Content model

### Front matter (one file per project)

Align with `projects.json` so the home rail and All Works can share one source later.

```yaml
---
title: "SYNEK launch campaign"
slug: synek-launch
permalink: projects/synek-launch.html
summary: "Make a countertop beer system feel inevitable on a shelf and on a stage."
meta: "brand · 2022"
tags:
  - brand
year: 2022
season: fall
collection: identity
draft: false
order: 30
card:
  desc: "Make a countertop beer system feel inevitable…"
  media:
    type: image
    webp: /images/projects/synek-story.webp
    jpg: /images/projects/synek-story-poster.jpg
    width: 1920
    height: 1200
heroFigure:
  webp: /images/projects/synek-story.webp
  jpg: /images/projects/synek-story-poster.jpg
  alt: "SYNEK campaign storyboard frames"
  caption: "Campaign story frames (animated WebP on the home card)."
---
```

Body: Markdown under the front matter. For **case layout**, each `## Heading` is wrapped in `<section class="case-block">` automatically. Use raw HTML for `<figure class="case-figure">` / `<picture>` when you need WebP + JPG.

### Case study section pattern (from SYNEK)

| Section | HTML pattern |
|---------|----------------|
| Back link | `project-page__back` → `../index.html` |
| Meta line | `project-page__meta` (tags · year) |
| Title | `<h1>` |
| Lede | `project-page__lede` |
| Blocks | `<section class="case-block">` + `<h2>` |
| Figure | `case-figure` + `<picture>` |
| Footer back | `project-page__back--end` |

---

## Eleventy layout paths

Repo root:

```
content/projects/*.md
_includes/layouts/project-case.njk
_includes/layouts/project-simple.njk
eleventy.config.cjs
_site/                    ← build output only (gitignored)
```

`eleventy.config.cjs` essentials:

- `dir.input`: `content`; `dir.output`: `_site`; `includes`: `../_includes`
- `addPassthroughCopy` for CSS/JS/fonts/images/sw and HTML not yet templated
- Collection `projects` from `content/projects/**/*.md`

---

## Migration phases (full arc)

| Phase | What | Risk |
|-------|------|------|
| **0–1** | Scaffold + SYNEK in Markdown | Low — parallel to existing HTML until you switch |
| **2** | Generate `projects.json` from collection (or single `projects.11tydata.js`) | Medium — test All Works + home |
| **3** | Move Color Scroller + Ascension off stubs | Content work |
| **4** | Optional: `index.html` → template; work cards from data | Higher — touches hero/JS |
| **5** | CMS: **Tina** (edit beside preview) or **Decap** (`/admin`, GitHub OAuth) | After schema stable |
| **6** | **Sanity** only if you need block modules + asset studio | Heavier ops |

---

## CMS options (pick after Markdown works)

| Tool | Best for | Tradeoff |
|------|----------|----------|
| **Markdown only** | Solo, repo-native | No browser UI |
| **[TinaCMS](https://tina.io/)** | Visual-ish editing, Git-backed | Preview URL / config |
| **[Decap CMS](https://decapcms.org/)** | Simple `/admin` forms | Less WYSIWYG |
| **[Sanity](https://www.sanity.io/)** | Structured blocks, images | Schema + cloud |
| **Storyblok** | Team WYSIWYG | Cost / scope |

**Recommendation:** 11ty + Markdown → **Tina** or **Decap** when you want a browser → Sanity only if Markdown feels too flat.

---

## Deploy (when build is real)

**Today:** Run `npm run build` before you commit/push if you changed `content/projects/*.md` — that refreshes the synced `projects/*.html` GitHub Pages serves from the repo root.

**Later:** A GitHub Action can run `npm ci && npm run build` and deploy **`_site/`** as the Pages artifact (then you can drop the sync script). See [github-pages.md](./github-pages.md).

Bump `STATIC_CACHE` in `sw.js` when precache paths change.

---

## Open questions (answer when you hit them)

1. **Generate `projects.json` at build** vs hand-edit until Phase 2? → Default: generate from collection once SYNEK builds.
2. **Draft projects** — omit from JSON when `draft: true` (matches current `works-index.js` behavior).
3. **Placeholder stub** — keep one `placeholder-case-study.html` for multiple WIP titles or one md per WIP?

---

*Session doc — 2026-05-15. Supersedes the standalone authoring stub; see [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md) (redirect).*
