# pandjico — the station

Personal web infrastructure (static HTML/CSS/JS today): adaptive **Sky**, work **Collections**, footer readings, project stubs. **Transmissions** (Longwave) specified for a later Next.js build.

- **Live (GitHub Pages):** https://apandji.github.io/pandjico/
- **Repo:** https://github.com/apandji/pandjico
- **the station (start here):** [STATION.md](STATION.md)
- **Docs index:** [docs/README.md](docs/README.md)
- **North star:** [docs/station-concept-and-critique.md](docs/station-concept-and-critique.md)
- **Mobile spec (implement):** [docs/mobile-spec.md](docs/mobile-spec.md)
- **Transmissions / Longwave (next build):** [docs/project-longwave.md](docs/project-longwave.md)
- **Active tasks:** [docs/next-actions.md](docs/next-actions.md)
- **Pages / SW / cache:** [docs/github-pages.md](docs/github-pages.md)

Local preview: `python3 -m http.server 3333 --bind 127.0.0.1` then open http://127.0.0.1:3333/

**Assets:** SYNEK card pipeline reads stills from `images/projects/synek-source/` (see `scripts/build-synek-story-*.sh`). **Caching:** `sw.js` + `js/register-sw.js` — bump `STATIC_CACHE` in `sw.js` when precached assets change; see [docs/github-pages.md](docs/github-pages.md).
