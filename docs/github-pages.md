# GitHub Pages for this repo

Static **HTML/CSS/JS** at the repo root; no build step for the current setup.

**Published URL:** https://apandji.github.io/pandjico/

## Configure Pages

1. Repo → **Settings** → **Pages**.  
2. **Source:** Deploy from a branch.  
3. **Branch:** `main` · **Folder:** `/ (root)`  
4. Save; wait 1–3 minutes; hard-refresh. **Actions** may show a “pages build and deployment” run.

**Project URL shape:** `https://<user>.github.io/<repo>/` — if you **rename the repo**, the public URL changes unless you add a **custom domain**.

## Local preview

```bash
cd /path/to/pandjico
python3 -m http.server 3333 --bind 127.0.0.1
```

Open `http://127.0.0.1:3333/` — optional `?lab=1` / `?sceneDebug=1` for debug UI. SW registration works on `localhost` / `127.0.0.1`; use **HTTPS** on GitHub Pages for geo + clipboard.

## Notes

- **HTTPS** — Geolocation and `navigator.clipboard` behave better than on `file://`.  
- **Paths** — Relative assets (`css/`, `js/`; `../css/` from `projects/`) suit hosting under `/pandjico/`.  
- **`adapt-hero.js`** — Loaded on the home page so `--bg-*` / `--fg-*` / accents apply before first paint; updates favicon + `theme-color`. Lab, scene debug, weather, and prose contrast live here — see [user-stories-and-scope.md](./user-stories-and-scope.md).  
- **Lab / debug** — Footer **⁘**: lab (click), scene debug (Shift+click), clear (Alt+click). URLs: `?lab=1|0`, `?sceneDebug=1|0`. `js/lab-egg.js` + `js/adapt-hero.js`.

## Service worker

`sw.js` + `js/register-sw.js` on every HTML page. GitHub Pages cannot set custom `Cache-Control`; the worker:

- **Precaches** core HTML, CSS, JS, fonts, stubs (`PRECACHE_REL` in `sw.js`).  
- **Network-first** navigations so deploys usually show fresh HTML.  
- **Cache-first** other same-origin GETs (runtime cache); **does not** intercept large **video** (`.mp4`, `.mov`, …).

**When you change precached files:** bump **`STATIC_CACHE`** (and optionally **`RUNTIME_CACHE`**) in `sw.js`. Add new global assets to `PRECACHE_REL` and bump the cache name.
