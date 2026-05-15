# Your next actions

Short checklist derived from [user-stories-and-scope.md](./user-stories-and-scope.md) and current site state. Reorder however you like.

## Tonight / first session back

1. **GitHub Pages** — Site: **https://apandji.github.io/pandjico/** · Repo: **https://github.com/apandji/pandjico** · Settings → Pages should show **main** + **/ (root)**. *(Deploy path verified in-repo; re-check after any Pages or repo rename.)*
2. **Custom domain (optional)** — If you use a domain later: repo **Settings → Pages → Custom domain**, then DNS CNAME to `apandji.github.io` (and remove `/pandjico` path or use apex rules as GitHub documents).

## Content (needs your words)

3. **Contact** (`contact.html`) — Replace placeholder with email, `mailto:`, or a form provider you trust.
4. **CV** (`cv.html`) — Add PDF link, embed, or structured résumé blocks.
5. **About** (`about.html`) — Bio, portrait optional; flesh out the “Adaptive interfaces” section or merge into main narrative.
6. **One full case study** — Pick **SYNEK** or **Color Scroller**; replace stub body in the matching `projects/*.html` file as the template for the others.
7. **SYNEK URL (decision)** — Keep `tactility-grounding.html` or rename to e.g. `projects/synek-launch.html` / `projects/synek/` and update the home card + `projects/index.html` + add a redirect from the old URL if anything linked externally.

## Product / layout

8. **Footer extras** — **⁘** toggles **lab** (click) and **scene time** debug (Shift+click); **Alt+click** clears both. URLs: `?lab=0`, `?sceneDebug=0` (`js/lab-egg.js`, `adapt-hero.js`).
9. ~~**Work rail — small viewports**~~ — **Done:** under **820px** width the scroll “attention” line sits at **36%** of viewport height so the **first** work card reads as primary (`attentionCenterY` in `js/work-cards.js`).
10. **Smoke-test geo** — On the **HTTPS** live site, use **⁘** or `?lab=1`, then the footer **here** pin and geo fields; confirm permission + weather. Geolocation requires a **secure context** (GitHub Pages is HTTPS).

## Authoring (when you are ready)

11. **11ty + CMS** — Follow [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md): init Eleventy, then add Tina / Decap / Sanity if you want a visual editor.
12. **Single source for work cards** — Once 11ty exists, drive home rail + project pages from one collection so titles never drift again.

## Maintenance

13. **Update this list** — Check off items here or in `user-stories-and-scope.md` §7 when done.
