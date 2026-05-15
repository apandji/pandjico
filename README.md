# pandjico — the station

Personal web infrastructure: adaptive **Sky**, work **Collections**, **station** page, footer readings, Eleventy-backed **project case studies** (`content/projects/`). Longwave specified separately.

- **Live (GitHub Pages):** https://apandji.github.io/pandjico/
- **Repo:** https://github.com/apandji/pandjico
- **Start here:** [STATION.md](STATION.md)
- **Docs index:** [docs/README.md](docs/README.md)
- **Case studies + 11ty:** [docs/case-studies-11ty.md](docs/case-studies-11ty.md)
- **North star:** [docs/station-concept-and-critique.md](docs/station-concept-and-critique.md)
- **Mobile spec:** [docs/mobile-spec.md](docs/mobile-spec.md)
- **Longwave (later):** [docs/project-longwave.md](docs/project-longwave.md)
- **Active tasks:** [docs/next-actions.md](docs/next-actions.md)
- **Deploy / SW:** [docs/github-pages.md](docs/github-pages.md)

**Local preview:** `python3 -m http.server 3333 --bind 127.0.0.1` → http://127.0.0.1:3333/ — Case pages from Markdown: `npm install` then `npm run serve` ([docs/case-studies-11ty.md](docs/case-studies-11ty.md)).

**Caching:** bump `STATIC_CACHE` in `sw.js` when precached files change ([docs/github-pages.md](docs/github-pages.md)).

**Assets:** SYNEK stills pipeline: `images/projects/synek-source/` (see `scripts/build-synek-story-*.sh` if present).
