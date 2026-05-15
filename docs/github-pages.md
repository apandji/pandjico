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
- **Paths** — This repo uses **relative** asset paths (`styles.css`, `../styles.css` in `projects/`), which is correct for a project site under `/pandjico/`.
- **If you rename the repo** — The public URL changes to match the new repo name unless you add a custom domain.

## Local preview (same as before)

```bash
cd /path/to/pandjico
python3 -m http.server 3333 --bind 127.0.0.1
```

Open `http://127.0.0.1:3333/` — optional `?lab=1` for lab UI.
