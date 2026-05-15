# User stories & site scope

**Purpose:** What the portfolio is driving toward—adaptive scene, footer, lab tooling, accessibility—and how it maps to pages. **Audience:** you or anyone reopening the repo after a break. **Active task queue (single list):** [next-actions.md](./next-actions.md).

---

## 1. Product themes

| Theme | Direction |
|-------|-----------|
| **Footer** | Pin + one line: greeting, weekday date, time, temp, place; `.time-footer__extras` reserved for more; centered bar layout. |
| **Sky anchor** | Default **St. Louis**; **Here** via pin + cached coords; `getCurrentPosition` (HTTPS); failures logged to **console**. |
| **Lab** | `?lab=1` / `localStorage.lab=1`; apply / random / clear spoof coords. **Sun, weather, footer place, and scene/footer clock** follow the pin (Nominatim + timeapi.io; separate cache from real “here” place). |
| **Caption cadence** | Footer clock **1s**; weather ~**80s**; scene tick ~**5s**. |
| **Scene + a11y** | Hourly palette from sun + time; **outdoor °F** nudges palette by season; **`enforceProseWcagAgainstBg`** keeps hero prose/meta contrast vs `--bg-*` at **WCAG 2.1 AA** body text (~4.5:1 + headroom for CSS opacity). |
| **Debug** | `?sceneDebug=1`: time scrubber, accent-ink bump, **simulated °F** vs live weather. Footer **⁘**: lab (click), scene debug (Shift+click), clear (Alt+click); `?lab=0` · `?sceneDebug=0`. |

---

## 2. User stories

### A. Adaptive scene & footer (visitor)

- **US-A1** — St. Louis default for the hourly rhythm.
- **US-A2** — Opt-in **Here** so the palette matches my location.
- **US-A3** — One scannable footer line (greeting, date, time, temp, place).
- **US-A4** — Clock stays credible (not only on weather refresh).
- **US-A5** — Geo failures diagnosable (permission, timeout, non-HTTPS).

### B. Layout & footer expansion

- **US-B1** — Pin + caption centered in the bar.
- **US-B2** — `.time-footer__extras` for future links / colophon (avoid duplicating hero links).

### C. Lab / QA (you)

- **US-C1** — Lab gated behind `?lab=1` / `localStorage.lab=1`.
- **US-C2** — Spoof coordinates to stress-test sun, golden hour, weather, caption place & TZ.
- **US-C3** — Lab UI copy matches behavior (hint updates with override / clear).

### D. Content (visitor)

- **US-D1** — Project pages match work cards; honest stubs until shipped.
- **US-D2** — About, Contact, CV filled when ready.

### E. Authoring (optional)

- **US-E1–E2** — Faster case studies via static pipeline + optional CMS → [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md).

---

## 3. Pages & stack

| Path | Role |
|------|------|
| `index.html` | Home: hero, work rail, adaptive footer |
| `about.html` · `contact.html` · `cv.html` | Shells — replace placeholders |
| `projects/*.html` | Case studies; **`tactility-grounding.html`** = SYNEK card until you rename + redirect |
| `projects/index.html` | **All Works v2** — top toolbar, masonry + list, `?view=list` — [feature-all-works.md](./feature-all-works.md) §15 · [next-actions.md](./next-actions.md) |

**Primary code:** `js/adapt-hero.js` (palette, anchors, Open-Meteo, lab geo/TZ/place, prose WCAG, footer timers), `css/styles.css`, `js/work-cards.js` (rail; `attentionCenterY` under **820px**), `js/lab-egg.js`, `js/register-sw.js` + **`sw.js`** (bump **`STATIC_CACHE`** when precached assets change), `js/frost-tooltip.js`.

---

## 4. When you resume (suggested order)

**Single queue:** open **[next-actions.md](./next-actions.md)** first — ordered **Active** tasks for you and for Cursor-style remote sessions.

High-level themes (details and numbering live in that file):

1. Ship **one** full case study (SYNEK or Color Scroller) as the template for the rest.  
2. Minimum **Contact / CV / About** content.  
3. Optional **11ty** + single source for cards → [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md).  
4. Decide what lives in **`.time-footer__extras`**.

---

## 5. Out of scope (for now)

Server-side geolocation; runtime CMS on the public site. **Custom domain:** repo **Settings → Pages** + DNS — [github-pages.md](./github-pages.md).

---

## 6. Status snapshot

| Area | State |
|------|--------|
| Footer, pin, lab egg, geo + caption flow, work-rail small viewports, SYNEK stub alignment, temp-driven palette, scene-debug °F sim, hero prose WCAG vs `--bg-*` | In repo |
| **All Works** (`projects/index.html`, JSON, filters, sort, URL, views, SW precache) | **v2 shipped** (toolbar + masonry default + list); polish: lazy tiles, device QA — [next-actions.md](./next-actions.md) |
| Case study prose, contact/CV/about copy, SYNEK slug decision, footer extras content, 11ty/CMS | Needs you |

---

*Update [next-actions.md](./next-actions.md) when priorities shift; keep this file’s themes in sync.*
