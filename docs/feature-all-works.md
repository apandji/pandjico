# Feature: All Works (project index)

**Status:** **v1 MVP shipped** (May 2026) — split hero + horizontal **`.work-rail`**. **v2 direction (spec in progress):** top **filter bar**, **two views** — **masonry** (**default**; native [CSS Grid Level 3](https://www.w3.org/TR/css-grid-3/) where supported) and **list** (index style like [Laurel Schwulst — Everything](https://laurelschwulst.com/e/)). Lazy media + a11y carry forward; rail-only `work-cards.js` attention may not apply to list rows.  
**Owner:** Andrew  
**Related:** [user-stories-and-scope.md](./user-stories-and-scope.md), [next-actions.md](./next-actions.md) (active queue), `index.html`, `projects/index.html`, `projects/projects.json`, `js/works-index.js`, `js/work-cards.js`

---

## 1. Summary

**All Works v1 (shipped)** uses **`projects/index.html`**: same **adaptive scene + footer** as home, a **left hero** with “All works” + tag/sort controls, and a **horizontal work rail** of home-shaped **`.work-card`** links (`work-cards.js` attention + `work-rail-updated`).

**All Works v2 (planned rescope)** — see **§15**: replace the split-column chrome with a **compact filter bar** under the page title; main content is either a **masonry mosaic** (**default**) or a **dense list** (year + title + tags, [Laurel Schwulst — Everything](https://laurelschwulst.com/e/)-like). **Keep:** JSON manifest, OR tags, sort, URL sync, drafts, footer/scene parity. **Revisit:** lazy media strategy per view, mobile behavior (no horizontal rail in list mode), and how much home **`.work-card`** markup is reused vs a slimmer list row component.

**Scale:** ~**20+** entries → lazy media and layout performance remain requirements (§9).

---

## 2. Decisions (locked)

| Topic | Decision |
|-------|-----------|
| **Chronological sort** | By **completion** using **`year`** (integer, e.g. `2024`) + **`season`**: **Spring**, **Summer**, **Fall**, or **Winter** — no month/day. Together they define order within and across years (see §5.2). Optional display, e.g. “Fall 2024”. |
| **Tag filter** | **Multi-select.** Default = **no filter** → show **everything**. **Clear** control resets tag selection and the rail to full set. |
| **Multi-tag logic** | **OR** — show a project if it has **any** of the selected tags. *(If you later want “must match all,” add an explicit AND/OR toggle.)* |
| **URL state** | **Yes** — filters and sort reflected in the query string (bookmarkable / shareable). Parse on load; update on change (replaceState vs pushState TBD in implementation). |
| **`projects/index.html`** | **Replace** the current simple list with the full All Works experience at **the same URL** so existing links to `/projects/index.html` keep working. |
| **Unfinished projects** | **Included** in the rail, **grayed out** (see §6.3). Still link to stub pages unless you gate navigation separately. |
| **Hero title** | **“All Works”** (no extra subtitle for MVP). |
| **Chrome / color** | **Same footer and adaptive color behavior** as home: load **`adapt-hero.js`** (+ `register-sw.js` / `sw.js` per site norms) so scene, caption, and pin behave consistently. |
| **Scale** | Expect **20+** cards and growth → **lazy loading** for heavy media (§9). |

### 2.1 Future (not MVP): `audience` meta

You want **collections tuned for different job applications** (e.g. health vs brand leadership). **Phase 2:** add per-project meta **`audience`** (string or string array), then support URLs such as `?audience=…` that map to **preset filter sets** (tags + optional manual include list). MVP only needs the **URL + tags + sort** plumbing so `audience` can layer on without renaming routes again.

### 2.2 v2 (proposed — rescope May 2026)

| Topic | Decision |
|-------|-----------|
| **Layout shell** | **Top filter bar** (tags, clear, sort, view toggle) instead of fixed **left hero** + rail column. Page may still use `page-split` only if needed for global chrome; prefer a single scrolling column for the index. |
| **Views** | **Two modes:** **Masonry** (visual mosaic, **default**) and **List** (typographic index). User toggle + URL persistence (e.g. `?view=masonry` \| `?view=list`); when `view` is absent, treat as **masonry**. |
| **Masonry** | Prefer **[CSS Grid Layout Module Level 3](https://www.w3.org/TR/css-grid-3/)** “masonry” / auto-placement patterns where implemented. **Must** ship a **fallback** for browsers without Grid L3 masonry (e.g. multi-column `column-count`, `grid-auto-rows` + dense packing, or a small layout helper — pick in implementation and document). |
| **List view** | **Reference:** [Laurel Schwulst — Everything](https://laurelschwulst.com/e/) — year-forward or year-grouped rows, title, short kind/tags as inline text, external link affordance; fast to scan, minimal chrome. |
| **Cards vs rows** | **Masonry** may reuse rich **`.work-card`**-style tiles (media-forward). **List** likely uses **lighter markup** (semantic list / rows) from the same JSON — not required to duplicate home card DOM. |
| **`work-cards.js`** | **Masonry:** may keep scroll-attention if cards remain large; **List:** probably **no** rail attention / 3D tilt — simpler focus and hover states. |

---

## 3. Goals & non-goals

### Goals (MVP)

| Goal | Detail |
|------|--------|
| **Discoverability** | Full project set in one rail; filter narrows; Clear restores all. |
| **Parity** | Cards match home **markup/CSS**; scene + footer match site **behavior**. |
| **Control** | Multi-tag OR filter; sort **A–Z by title** vs **timeline** (`year` + `season`, newest-first; see §5.2). |
| **Shareability** | Query string mirrors UI state. |
| **Honest stubs** | Drafts visible but **visually de-emphasized**. |

### Non-goals (MVP)

- Removing or shrinking the **home** selected-work rail.  
- Full **CMS** (JSON or duplicated markup is fine until 11ty).  
- Full-text **search**.  
- **`audience`**-driven collections (Phase 2).  
- **Saved** filter presets without URL (optional later: `localStorage`).

---

## 4. Page structure

1. **Document shell** — ~~Align with **`index.html`**~~ **Done:** `adapt-hero.js`, footer markup, `data-appearance` driven by scene.  
2. **Hero**  
   - **H1:** “All works”.  
   - **Controls row:** tag multiselect (chip toggles), **Clear**, sort (**Title A–Z** / **Timeline**).  
3. **Main**  
   - `<main class="work-rail" id="main">` with **home-shaped** `.work-card` anchors (injected from JSON).  
4. **Footer** — Same componentry and scripts as home for pin, caption, lab egg, etc.

---

## 5. Filtering, sort, URL

### 5.1 Tags

- **Source of truth:** same tag strings as on cards / manifest (`experimental`, `health`, `brand`, …).  
- **UI:** each tag is toggleable; selected state visible; **Clear** deselects all and shows full rail.  
- **Logic:** with tags `T1…Tk` selected, a project appears if `project.tags ∩ {T1…Tk} ≠ ∅`.

### 5.2 Sort

| Mode | Rule |
|------|------|
| **Title** | Alphabetical on display title (case-insensitive, locale `en`). |
| **Timeline** (chronological) | **Primary:** `year` **descending** (most recent calendar year first). **Secondary** (same `year`): **Winter → Fall → Summer → Spring** (later in the calendar year first: winter covers late-year completion, spring early-year). **Tertiary:** title A–Z. |

**`season` values (machine):** `spring` \| `summer` \| `fall` \| `winter` (lowercase in JSON / `data-season`). **Display:** Title Case (“Fall”, “Summer”, …).

**Semantics:** Seasons are a **coarse completion bucket** within a year (portfolio-friendly, no exact date). When authoring, pick the season that matches when the work **shipped** or the case study was **finished** to your satisfaction.

**Drafts:** `draft: true` projects should still have **`year` + `season`** if they sort in the timeline; use best guess (e.g. current season when added) or a dedicated **`season: "spring"`** convention for “TBD” documented in the manifest comments.

*(If you later want oldest-year-first or spring-first within a year, add `sort=timeline-asc` or similar.)*

### 5.3 Suggested query params (MVP)

Examples (exact spelling can be adjusted in implementation):

- `?tags=brand,health` — OR filter.  
- `?sort=title` \| `?sort=timeline` — timeline = year + season ordering above.  
- `?view=masonry` \| `?view=list` — **v2** (§15). **Default:** **masonry** (absent `view` ⇒ masonry; implementation may omit `view=masonry` from the URL for a shorter query when list is not selected).  
- Absent `tags` → all projects.

**Hydration:** on load, read params → apply to UI and rail. On user change, update URL. **Implemented:** `history.replaceState` (filter fiddling does not spam history).

---

## 6. Project meta (data contract)

Each project entry (in JSON or in `data-*` on a template root) should expose at minimum:

| Field | Type | Use |
|-------|------|-----|
| `href` | string | Card `href`. |
| `title` | string | Overlay + alphabetical sort + `aria-label`. |
| `year` | integer | **Completion calendar year** (e.g. `2024`). |
| `season` | `"spring"` \| `"summer"` \| `"fall"` \| `"winter"` | **Completion season** within that year — no month/day. Drives **Timeline** sort with `year` (§5.2). Optional visible label, e.g. “Fall 2024”. |
| `tags` | string[] | Filter chips + OR logic. |
| `draft` | boolean | If true → **grayed-out** presentation (§6.3). |

Optional for **v2 list** rows (§15): **`kind`** or **`subtitle`** — short secondary line (e.g. “website”, “teaching”) without overloading `tags`.

Optional later (Phase 2 / richness): **`audience`**, **`summary`**, extra poster URLs, etc.

## 6.3 Draft / unfinished presentation

- Add a machine-readable flag: e.g. **`data-draft="true"`** on `<a class="work-card">` or `draft: true` in JSON when rendering.  
- **CSS:** modifier class e.g. **`.work-card--draft`** — `filter: grayscale(1)`, reduced opacity, optional `cursor` hint; **do not** remove focus outline.  
- **Assistive tech:** extend **`aria-label`** with “(in progress)” or “(draft)” so state isn’t color-only.  
- **Contrast:** draft styling must keep **text on card** readable (WCAG for overlay copy); if opacity breaks ratios, darken overlay instead of only fading the whole card.

---

## 7. Cards “exactly like home”

- Same structure as `index.html`: `<a class="work-card">` → `figure.work-card__figure` → media → `div.work-card__overlay` (title, desc, tags, hint).  
- **Draft** state is an **additive** modifier, not a different card species.  
- **Implementation note:** `work-cards.js` ~~attention rail currently uses **`document.querySelector(".work-rail")`**~~ — delegated handling + **`work-rail-updated`** after filter/sort so dynamically inserted cards work.

---

## 8. Information architecture

- **Canonical URL:** **`projects/index.html`** (replaces current list; preserves inbound links).  
- **Home “All works” link** (`work-rail-more` in `index.html`): already points here — **no URL change** required; update copy if title changes from “Projects” to “All works” only if desired.  
- **Back to home:** ~~keep obvious exit~~ **Done:** `project-page__back` → `../index.html` on All Works.

---

## 9. Lazy loading & performance (20+ cards)

- **Images:** `loading="lazy"` + `decoding="async"` on card images; **fetchpriority** only on first visible if needed.  
- **Video:** avoid **N** simultaneous `autoplay` loops. Prefer **`preload="none"`** or **`metadata`**, start playback only when card is **near viewport** (**`IntersectionObserver`**), pause when far. Poster frames stay for idle tiles.  
- **Script cost:** one manifest fetch + render; debounce filter updates; avoid layout thrash when re-sorting (DocumentFragment or single innerHTML replace).  
- **Service worker:** new JS/CSS/HTML for All Works → bump **`STATIC_CACHE`** in `sw.js` and extend **`PRECACHE_REL`** if the page should be offline-first.

---

## 10. Mobile

- **Rail:** keep **horizontal scroll**; same thumb-scroll as home; **`attentionCenterY`** in `work-cards.js` already shifts on narrow widths—verify All Works after dynamic DOM updates.  
- **Controls:** stack or wrap chips on narrow viewports; **min 44×44px** touch targets; **Clear** always reachable without horizontal scroll of the control row.  
- **Filter UI:** consider a **“Filters”** disclosure or bottom sheet if chip count grows; MVP can be a wrapping row if tag count stays small.  
- **Scene + footer:** same reduced chrome as home; no `viewport-fit` regressions.  
- **Draft cards:** gray state must remain distinguishable on small screens (not only hover).

---

## 11. Accessibility

- Controls: **`<fieldset>` + `<legend>`** for tag group, or listbox pattern with documented keyboard model.  
- **`aria-live="polite"`** on result count (“12 projects”) when filter/sort changes.  
- **Focus:** after Clear or filter apply, optionally move focus to rail or first card (decide to avoid focus loss).  
- **Reduced motion:** respect `prefers-reduced-motion` for any filter UI animation; rail already partially handled in `work-cards.js`.

---

## 12. Acceptance criteria (MVP)

1. ~~**`projects/index.html`** is the All Works page with **“All Works”** hero, controls, and **`.work-rail`**.~~ *(Title casing in UI: “All works”.)*  
2. ~~**`adapt-hero.js` + footer** load and behave like **home** (pin, caption, scene).~~  
3. ~~**Default** rail lists **all** projects; **Clear** resets tags and URL params.~~  
4. ~~**Multi-tag OR** filter and **Title / Timeline** sort stay in sync with the **URL** (`?sort=title` \| `?sort=timeline`).~~  
5. ~~Every project has **`year`** + **`season`** for timeline ordering (§5.2); drafts included per §5.2 / §6.3.~~  
6. ~~**`draft`** projects appear **grayed out** with non-color-only state in **`aria-label`**.~~ *(Plus visible “In progress” badge on card overlay.)*  
7. ~~**Cards** match home structure; **attention** + touch behavior works after filter/sort.~~ *(Rail refresh via `work-rail-updated`.)*  
8. **Lazy / staggered media** avoids melting low-end devices at **20+** cards (verify with throttling). — **Not done:** cards still use `preload="metadata"` on video; no `IntersectionObserver` yet.  
9. **Mobile:** usable controls + scroll rail without trapping scroll or breaking WCAG for control text. — **Needs verification pass** (tracked in [next-actions.md](./next-actions.md)).

---

## 13. Implementation order

1. ~~Restructure **`projects/index.html`** to match **home shell** (scripts, footer, skip link if any).~~  
2. ~~Add hero + control markup + empty **`.work-rail`**.~~  
3. ~~**`projects.json`** (or equivalent) with `href`, `title`, `year`, `season`, `tags`, `draft`.~~ → `projects/projects.json`  
4. ~~**Render script:** build cards, wire filter/sort, sync **URL**, **Clear**.~~ → `js/works-index.js`  
5. ~~**CSS** for `.work-card--draft` + control layout + mobile wrap.~~  
6. **`work-cards.js`:** ~~rail query / re-init after DOM refresh~~; **lazy video** observer (new small module or extend existing) — **still to do**.  
7. ~~**SW** precache + cache bump.~~  
8. QA: home vs All Works, mobile, a11y, 20-card stress — **in progress / partial** (for **v1** rail).  
9. **Phase 2 spec** when ready: **`audience`** meta + `?audience=` presets.  
10. **v2 rescope** (when prioritized): §15 — top bar, masonry + list, Grid L3 + fallback, URL `view=`.

---

## 14. Repo touchpoints

| File / area | Note |
|-------------|------|
| `projects/index.html` | **v1** shipped — split hero + rail. **v2:** likely simplified shell (top bar + one main region). |
| `index.html` | ~~Confirm `work-rail-more` href~~ → `projects/index.html`; label **“see all works”**. |
| `sw.js` | ~~`PRECACHE_REL` + `STATIC_CACHE`~~ — includes `works-index.js`, `projects.json`, placeholder stub. |
| `js/work-cards.js` | **v1:** `work-rail-updated`. **v2:** scope to masonry only or split module if list mode drops rail behavior. |
| `js/works-index.js` | **v1:** manifest, filter, sort, URL. **v2:** dual render paths + `view` param + optional `kind` / display string for list rows. |
| `css/styles.css` | **v1:** works hero + draft. **v2:** `.works-masonry`, `.works-list`, `@supports (grid-template-rows: masonry)` or equivalent feature query once stable. |
| `projects/placeholder-case-study.html` | Stub target for in-progress entries in JSON. |

---

## 15. v2 rescope — top bar, masonry (Grid L3), list view

**Intent:** Keep the **same URL** (`projects/index.html`), **same manifest** (`projects/projects.json`), and the **same filter/sort/URL semantics** (OR tags, timeline vs title, `replaceState`, unknown-tag sanitization). Replace the **split-column “hero + horizontal rail”** layout with a **single-column index**: **compact controls at the top**, then **masonry by default** or a **typographic list** when the user switches.

### 15.1 Filter bar (top)

- One horizontal band (wrap on small screens): **Index** link + **H1** “All works” (or inline with bar — TBD), **tag chips**, **Clear**, **sort** (Timeline / Title A–Z), **view toggle** (Masonry / List; **Masonry selected by default** on first visit).  
- Optional: collapse tags into **“Filters”** disclosure if the tag set grows.  
- **Touch / a11y:** keep fieldset/legend or radiogroup patterns; live region for result count across **both** views.

### 15.2 Masonry view

- **Primary layout:** use **[CSS Grid Layout Module Level 3](https://www.w3.org/TR/css-grid-3/)** where the engine supports masonry-style placement (per spec / `@supports` — exact property set may evolve with implementations; track **Editor’s Draft** vs **WD**).  
- **Tiles:** variable-aspect thumbnails (poster / still) + title; may reuse **`.work-card`** styling or a slimmer **`.works-tile`** that shares tokens with home cards.  
- **Fallback (required):** when Grid L3 masonry is unavailable, use a documented second path (e.g. **CSS columns**, **fixed-row grid + `grid-auto-flow: dense`**, or a **minimal JS column balancer** only if CSS cannot reach “good enough”). Document the chosen fallback in this section when implemented.  
- **Media:** lazy images; videos paused until in view (§9) — especially important with many tiles.

### 15.3 List view

- **Reference:** [Laurel Schwulst — Everything](https://laurelschwulst.com/e/) — calm, scan-first lines: **year** (and optionally **season** or a short **kind** string), **title**, **tags** as comma-separated or pill-light text, link to case study (↗ or subtle underline).  
- **Semantics:** prefer **`<ol>`** or **`<ul>`** with **`<li>`** rows (or table with caption) so screen readers get list length and navigation.  
- **Drafts:** suffix “(in progress)” in visible title or meta text, not color-only; optional muted row styling.  
- **Optional JSON:** add optional **`kind`** or **`subtitle`** string for list-only secondary text if tags alone feel noisy.

### 15.4 URL & state

- Extend query string, e.g. **`?view=masonry`** | **`?view=list`**. **Default view is masonry:** if `view` is missing or invalid, render masonry. **Optional URL hygiene:** omit `view=masonry` when that is the active mode so bookmarks stay short; always include `view=list` when list is active.  
- Preserve **`tags`**, **`sort`**, and existing sanitization rules.  
- On view switch, preserve filter/sort; re-render the other layout without full page reload.

### 15.5 Script & CSS split (suggested)

- **`works-index.js`:** fetch + state + `renderMasonry()` / `renderList()` + shared `applyFilters()`.  
- **`styles.css`:** new blocks `/* All works v2 */` for bar, masonry grid, list rows; avoid bloating home `.work-rail` rules unless shared mixins/classes are extracted.  
- **`work-cards.js`:** only attach rail attention / pointer tilt when **`[data-works-layout="masonry"]`** (or similar) so list mode stays simple and performant.

### 15.6 Acceptance (v2 — draft)

1. Top **filter bar** fits **820px** and below without horizontal trap; **masonry** is the default view on first load and when `view` is absent from the URL.  
2. **Masonry** uses Grid L3 where supported and **readable fallback** elsewhere.  
3. **List** matches the **spirit** of the reference (density, hierarchy), not a pixel clone.  
4. **URL** reflects `view`, `tags`, `sort`; invalid tags stripped.  
5. **Draft** + **live** projects both visible per rules in §6.3 / list equivalents.  
6. **Footer + adapt-hero** unchanged from site norms.

---

*Phase 2 (`audience` collections): extend §6 and §5.3 when you define audience slugs and preset mappings. **v2 layout:** §15.*
