# Documentation — the station

Personal web infrastructure for **pandjico** (Andrew Pandji). These docs are the source of truth for what to build and why—not a dump of every note.

**Live site:** https://apandji.github.io/pandjico/ · **Repo entry:** [../STATION.md](../STATION.md)

---

## Sources of truth (read these first)

| Document | Use when you need… |
|----------|-------------------|
| **[station-concept-and-critique.md](./station-concept-and-critique.md)** | Identity, instruments, critique, **product themes, user stories, page map** (Part Three) |
| **[mobile-spec.md](./mobile-spec.md)** | Mobile layout, scroll flow, touch, Sky section, project cards — **implement now** |
| **[project-longwave.md](./project-longwave.md)** | Transmissions publishing (Next.js, Supabase, syndication) — **next build** |
| **[next-actions.md](./next-actions.md)** | The only ordered task queue (what to do next) |
| **[station-page.md](./station-page.md)** | **`station.html` PRD** — sections, locked copy, build phases |

Everything else supports one of the above or describes something already shipped.

---

## Supporting docs

| Document | Role |
|----------|------|
| [instrument-collections.md](./instrument-collections.md) | Shipped **Collections** instrument (`projects/index.html` — filters, masonry, list, VT) |
| [github-pages.md](./github-pages.md) | Deploy, local preview, service worker / `STATIC_CACHE` |
| [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md) | Optional later: 11ty + CMS for case studies |

**Redirects:** [user-stories-and-scope.md](./user-stories-and-scope.md) → station doc Part Three · old `feature-all-works.md` → `instrument-collections.md`

---

## How docs relate

```
station-concept-and-critique.md     ← north star (why / what / scope)
        │
        ├── mobile-spec.md          ← immediate UX implementation
        ├── station-page.md         ← station.html PRD (build spec)
        ├── project-longwave.md     ← next system (Transmissions)
        ├── instrument-collections.md   ← shipped Collections subsystem
        │
        └── next-actions.md         ← single queue (when)
```

**Rule of thumb:** *Priority / done* → **next-actions.md**. *Station identity / instruments / stories* → **station-concept-and-critique.md**. *Mobile layout* → **mobile-spec.md**. *Publishing* → **project-longwave.md**. *All Works implementation detail* → **instrument-collections.md**.

---

## Current stack (static site)

HTML/CSS/JS at repo root; adaptive scene + footer in `js/adapt-hero.js`. Longwave spec assumes a **Next.js** app later (likely same domain)—not merged into this repo yet.
