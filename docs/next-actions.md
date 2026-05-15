# Your next actions

Short checklist derived from [user-stories-and-scope.md](./user-stories-and-scope.md) and current site state. Reorder however you like.

## Tonight / first session back

1. **Confirm GitHub Pages** — Site: **https://apandji.github.io/pandjico/** · Repo: **https://github.com/apandji/pandjico** · Settings → Pages should show **main** + **/ (root)**. Wait a minute after first deploy, then hard-refresh.
2. **Custom domain (optional)** — If you use a domain later: repo **Settings → Pages → Custom domain**, then DNS CNAME to `apandji.github.io` (and remove `/pandjico` path or use apex rules as GitHub documents).

## Content (needs your words)

3. **Contact** (`contact.html`) — Replace placeholder with email, `mailto:`, or a form provider you trust.
4. **CV** (`cv.html`) — Add PDF link, embed, or structured résumé blocks.
5. **About** (`about.html`) — Bio, portrait optional; flesh out the “Adaptive interfaces” section or merge into main narrative.
6. **One full case study** — Pick **SYNEK** or **Color Scroller**; replace stub body in the matching `projects/*.html` file as the template for the others.
7. **SYNEK URL (decision)** — Keep `tactility-grounding.html` or rename to e.g. `projects/synek-launch.html` / `projects/synek/` and update the home card + `projects/index.html` + add a redirect from the old URL if anything linked externally.

## Product / layout

8. **Footer extras** — Put something in `.time-footer__extras` (colophon, “built with…”, extra link) or remove the region if you decide you do not need it.
9. **Smoke-test geo** — On the deployed HTTPS URL, confirm “here” pin + weather behave; lab `?lab=1` if you still use overrides.

## Authoring (when you are ready)

10. **11ty + CMS** — Follow [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md): init Eleventy, then add Tina / Decap / Sanity if you want a visual editor.
11. **Single source for work cards** — Once 11ty exists, drive home rail + project pages from one collection so titles never drift again.

## Maintenance

12. **Update this list** — Check off items here or in `user-stories-and-scope.md` §7 when done.
