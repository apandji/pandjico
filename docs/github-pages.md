# GitHub Pages for this repo

The site is **static** (HTML/CSS/JS at the repository root). No build step is required for the current setup.

**Published URL:** https://apandji.github.io/pandjico/

## After the first push

Pages is configured to deploy from **`main`** at **`/` (root)**. If you ever need to reconfigure:

1. On GitHub open the repo → **Settings** → **Pages** (sidebar).
2. Under **Build and deployment**:
   - **Source:** Deploy from a branch  
   - **Branch:** `main` (or `master` if you used that)  
   - **Folder:** `/ (root)`
3. Save. The site will be published at:

   **`https://apandji.github.io/pandjico/`**

   (Project Pages URL = `https://<user>.github.io/<repo>/`)

4. Wait one to three minutes, then hard-refresh. **Actions** tab may show a “pages build and deployment” run.

## Notes

- **HTTPS** — Provided by GitHub; geolocation and `navigator.clipboard` behave better than on raw `file://`.
- **Paths** — This repo uses **relative** asset paths (`css/styles.css`, `../css/styles.css` in `projects/`, `js/*.js` from the root pages), which is correct for a project site under `/pandjico/`.
- **Scene script** — On the home page, `js/adapt-hero.js` is loaded in `<head>` **without** `defer` (after the stylesheet) so hourly palette / accent CSS variables apply before the first paint; it also keeps the `<meta name="theme-color">` (id `dynamic-theme-color`) aligned with the scene background like the favicon. Other scripts stay `defer`.
- **Lab / debug** — Footer **⁘** toggles `localStorage.lab` (click) and `sceneDebug` (Shift+click); **Alt+click** clears both. URLs `?lab=1|0`, `?sceneDebug=1|0`. See `js/lab-egg.js` + `adapt-hero.js`.
- **If you rename the repo** — The public URL changes to match the new repo name unless you add a custom domain.

## Local preview (same as before)

```bash
cd /path/to/pandjico
python3 -m http.server 3333 --bind 127.0.0.1
```

Open `http://127.0.0.1:3333/` — optional `?lab=1` for lab UI. Service worker registration works on `http://localhost` / `127.0.0.1` (use HTTPS on GitHub Pages).

## Service worker (repeat visits, offline shell)

The site ships **`sw.js`** at the repo root plus **`js/register-sw.js`** (included from every HTML page). GitHub Pages does not let you set custom `Cache-Control` headers; the worker instead:

- **Precaches** core HTML, CSS, JS, fonts, and project stubs (see `PRECACHE_REL` in `sw.js`).
- Uses **network-first** for navigations so you normally see fresh HTML after deploys.
- Uses **cache-first** for other same-origin GETs (then fills a runtime cache), but **never** intercepts large **video** (`.mp4`, `.mov`, …) so those always hit the network.

**After you change precached files** (CSS, JS, fonts, or any precached HTML path), bump **`STATIC_CACHE`** (and optionally **`RUNTIME_CACHE`**) in `sw.js` so old caches are deleted on activate.

If you add new global assets, append their **scope-relative paths** to `PRECACHE_REL` and bump the cache name.
