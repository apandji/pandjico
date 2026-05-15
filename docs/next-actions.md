# Next actions

Short checklist from [user-stories-and-scope.md](./user-stories-and-scope.md) and current site state. Reorder as you like.

## Ship & verify

1. **GitHub Pages** — **https://apandji.github.io/pandjico/** · Repo **Settings → Pages:** branch **main**, folder **`/` (root)**. After deploys, hard-refresh; see [github-pages.md](./github-pages.md) for HTTPS, paths, and **service worker** (`STATIC_CACHE` bumps).
2. **HTTPS smoke** — On the live site: footer **Here** pin (permission + line updates); **⁘** or `?lab=1` then random city (place, time, weather should align). Geo needs a **secure context**.

## Content (your words)

3. **Contact** (`contact.html`) — `mailto`, form, or copy you trust.  
4. **CV** (`cv.html`) — PDF link, embed, or structured résumé.  
5. **About** (`about.html`) — Bio; optional portrait; tighten “Adaptive interfaces” or fold into the main story.  
6. **One case study** — SYNEK or Color Scroller: replace stub body in the matching `projects/*.html` as the template for others.  
7. **SYNEK URL** — Keep `tactility-grounding.html` or rename (e.g. `projects/synek-launch.html`); update home card + `projects/index.html` + redirect if anything external linked the old slug.

## Product follow-ups

8. **Footer extras** — Decide what goes in `.time-footer__extras`. **⁘** = lab (click), scene debug (Shift+click), clear both (Alt+click); `?lab=0` · `?sceneDebug=0` — `js/lab-egg.js`, `js/adapt-hero.js`.

## Later

9. **11ty + optional CMS** — [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md); single collection for work cards + project pages when you are ready.  
10. **Doc hygiene** — Check off items here or in [user-stories-and-scope.md](./user-stories-and-scope.md) §6 when done.
