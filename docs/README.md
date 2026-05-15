# Documentation — the station

Personal web infrastructure for **pandjico** (Andrew Pandji). These docs are the source of truth for what to build and why—not a dump of every note.

**Live site:** https://apandji.github.io/pandjico/ · **Repo entry:** [../STATION.md](../STATION.md)

---

## Start here

| If you are… | Open |
|-------------|------|
| **Writing case studies (11ty + Markdown)** | **[case-studies-11ty.md](./case-studies-11ty.md)** — `content/projects/*.md`, `npm run build` / `npm run serve` |
| **Choosing what to build next** | **[next-actions.md](./next-actions.md)** — single task queue |
| **Understanding the station idea** | **[station-concept-and-critique.md](./station-concept-and-critique.md)** — north star |
| **Shipping mobile fixes** | **[mobile-spec.md](./mobile-spec.md)** |
| **Building / deploying the static site** | **[github-pages.md](./github-pages.md)** |

---

## Sources of truth

| Document | Use when you need… |
|----------|-------------------|
| **[case-studies-11ty.md](./case-studies-11ty.md)** | **11ty scaffold, Markdown projects, CMS choice, deploy** |
| **[station-concept-and-critique.md](./station-concept-and-critique.md)** | Identity, instruments, critique, product themes, page map |
| **[next-actions.md](./next-actions.md)** | Ordered task queue |
| **[station-page.md](./station-page.md)** | `station.html` PRD — sections, phases |
| **[mobile-spec.md](./mobile-spec.md)** | Mobile layout, touch, scroll flow |
| **[project-longwave.md](./project-longwave.md)** | Transmissions (Next.js, Supabase) — **after** case-study authoring lands |

---

## Shipped subsystems (reference)

| Document | Role |
|----------|------|
| [instrument-collections.md](./instrument-collections.md) | **Collections** / All Works (`projects/index.html`, `projects.json`, masonry, list) |
| [github-pages.md](./github-pages.md) | Deploy, local preview, `STATIC_CACHE` |

**Redirects (intentional stubs):** [user-stories-and-scope.md](./user-stories-and-scope.md) · [feature-all-works.md](./feature-all-works.md) · [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md)

---

## How docs relate

```
case-studies-11ty.md          ← authoring path (tonight)
        │
station-concept-and-critique.md   ← north star
        │
        ├── mobile-spec.md
        ├── station-page.md
        ├── instrument-collections.md
        ├── project-longwave.md
        │
        └── next-actions.md       ← when
```

**Rule of thumb:** *What to do next* → **next-actions.md**. *Writing projects* → **case-studies-11ty.md**. *Station identity* → **station-concept-and-critique.md**. *All Works mechanics* → **instrument-collections.md**.

---

## Current stack

**Today:** HTML/CSS/JS at repo root; adaptive scene in `js/adapt-hero.js`; case studies as hand-authored `projects/*.html` + `projects/projects.json` for the grid.

**Next:** Eleventy build → `_site/`; Markdown under `content/projects/`; optional Tina/Decap/Sanity after the first Markdown case study ships. Longwave remains a separate Next.js spec—not in this repo yet.
