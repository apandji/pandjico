# pandjico

Personal portfolio site (static HTML/CSS/JS): adaptive scene, work rail, project stubs.

- **Live (GitHub Pages):** https://apandji.github.io/pandjico/
- **Repo:** https://github.com/apandji/pandjico
- **Next actions:** [docs/next-actions.md](docs/next-actions.md)
- **Pages setup:** [docs/github-pages.md](docs/github-pages.md)

Local preview: `python3 -m http.server 3333 --bind 127.0.0.1` then open http://127.0.0.1:3333/

**Assets:** SYNEK card pipeline reads stills from `images/projects/synek-source/` (see `scripts/build-synek-story-*.sh`). **Caching:** `sw.js` + `js/register-sw.js` — bump `STATIC_CACHE` in `sw.js` when precached assets change; see [docs/github-pages.md](docs/github-pages.md).
