# User stories & site scope

**Purpose:** Capture what we have been driving toward in recent work (footer, adaptive scene, lab tooling, timing, layout) and map it to **user stories** and **pages**. This is scoped from **conversation threads** plus a quick **repo pass** (HTML/CSS/JS as of this write-up).

**Audience:** You (or anyone picking the site back up after a break).

---

## 1. Product themes from the conversations

| Theme | What you asked for | Current direction |
|--------|---------------------|-------------------|
| **Footer as a system** | Pin + greeting/date/time/temperature/place read as **one grouped unit** (`[pin] "good evening…"`), room for **more footer content** later | Group exists in markup; bar uses a **3-column grid** so the group stays **centered**; `.time-footer__extras` holds space for future UI |
| **“Here” vs St. Louis** | **Real geolocation** for the sky anchor, reliable in production | Pin toggles anchor; coords cached in `localStorage`; `getCurrentPosition` uses high accuracy + fresh read; **HTTPS / secure context** and failures surface in **console** |
| **Lab / debugger** | With lab on, **fake coordinates** (manual apply, **random city**, **clear**) to test sky + weather without traveling | `?lab=1` / `localStorage.lab=1`; keys `footerGeoDebugLat` / `footerGeoDebugLon`; hint explains **sun/weather vs clock TZ** mismatch when spoofing |
| **Caption truthfulness** | Date/time should **advance** like temperature does | Separate **1s** caption refresh so clock is not hostage to throttled **5s** scene ticks or only weather-driven `tick()` |
| **Visual polish** | Footer block **centered** in the viewport | Centered row + lab/geo lines aligned |

---

## 2. User stories (backlog-style)

### A. Adaptive scene & footer (visitor)

- **US-A1 — St. Louis by default**  
  *As a* visitor, *I want* the site’s color rhythm tied to **St. Louis** by default, *so that* it reflects where the work was built without asking for my location.

- **US-A2 — My sky**  
  *As a* visitor who opts in, *I want* to tap the **pin** and use **my coordinates** for the hourly palette, *so that* the scene matches my day where I am.

- **US-A3 — Readable footer line**  
  *As a* visitor, *I want* a single scannable line: **greeting, weekday date, time, temperature, place**, *so that* I understand time + weather context at a glance.

- **US-A4 — Live clock**  
  *As a* visitor (including with the tab in the background), *I want* the **time** (and date when it rolls) to stay credible, *so that* I trust the line is live—not only updating when weather refetches.

- **US-A5 — Honest errors**  
  *As a* visitor or developer, *I want* geolocation failures to be **diagnosable** (permission, timeout, non-HTTPS), *so that* I know why “here” did not stick.

### B. Layout & future footer (visitor / you)

- **US-B1 — Centered hero footer**  
  *As a* visitor, *I want* the pin + caption **centered** in the bar, *so that* it feels balanced with the rest of the layout.

- **US-B2 — Footer expansion**  
  *As* you, *I want* a dedicated **extras** region (e.g. secondary links, legal, social), *so that* I can add “other shit” without hacks.

### C. Lab / QA (you or collaborators)

- **US-C1 — Lab gate**  
  *As* you, *I want* lab features behind **`?lab=1`** or `localStorage.lab=1`, *so that* normal visitors do not see debug chrome.

- **US-C2 — Coordinate spoofing**  
  *As* you, *I want* to **apply**, **randomize**, or **clear** debug lat/lon, *so that* I can stress-test **sun altitude**, **golden hour** accents, and **Open-Meteo** output.

- **US-C3 — Mental model for spoof**  
  *As* you, *I want* clear copy that **clock + greeting TZ** still follow **STL vs device “here”**, while **spoofed coords** only affect sun + weather, *so that* I do not chase false bugs when Tokyo coords meet Chicago local time.

### D. Content & case studies (visitor)

*(Inferred from placeholders and work cards—not all spelled out in the same chat thread, but they define “pages to build.”)*

- **US-D1 — Trustworthy project URLs**  
  *As a* visitor, *I want* each work card to open a **real case study** (or honest stub), *so that* I am not dropped on a mismatched slug/title.

- **US-D2 — About / contact / CV**  
  *As a* visitor or recruiter, *I want* **About**, **Contact**, and **CV** filled out, *so that* I can evaluate fit and reach out.

### E. Authoring & CMS (you)

- **US-E1 — Faster case studies**  
  *As* you, *I want* to **draft project pages** without copying HTML boilerplate, *so that* starting a write-up is low friction.

- **US-E2 — Optional visual CMS**  
  *As* you, *I want* a **visual or structured editor** (headless CMS) that feeds a static build, *so that* editing feels closer to “seeing the page” than raw tags.

*See **[authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md)** for 11ty + CMS options, a project content model, and migration phases.*

---

## 3. Page inventory

### 3.1 Pages that exist today (shell or partial)

| Route | Role today | Likely “build” work |
|--------|------------|---------------------|
| `index.html` | Home: hero, work rail, adaptive footer, scene | Ongoing polish; footer extras content when ready |
| `about.html` | About + draft “Adaptive interfaces” section | Replace placeholder copy; optional portrait/structure |
| `contact.html` | Contact | Real contact flow or copy |
| `cv.html` | CV | PDF embed or structured résumé |
| `projects/index.html` | Project list labels match home cards | Add entries when new projects ship |
| `projects/sensory-language.html` | Case study: Color Scroller | Full narrative, media, credits |
| `projects/adaptive-interfaces.html` | Case study: Ascension Video Chat | Full narrative, media, credits |
| `projects/tactility-grounding.html` | **Stub** titled **SYNEK launch campaign** (matches home card); URL unchanged until you choose a slug | Full case study; optional rename + redirect |

### 3.2 Pages not strictly required by chat, but implied by assets

- **SYNEK** has rich imagery and build scripts under `images/projects/` and `scripts/`; the **stub page** title now matches the home card (URL still `tactility-grounding.html` until you rename).

### 3.3 Non-page technical scope (already in motion)

| Item | Notes |
|------|--------|
| `js/adapt-hero.js` | Scene palette, anchor modes, weather, footer caption, lab geo override, footer clock interval |
| `css/styles.css` | Footer layout (grid, group, lab, geo-debug) |
| `js/frost-tooltip.js` | Pin hint positioning (footer backdrop caveat documented in CSS) |

---

## 4. Suggested phases (when you resume)

0. **Authoring pipeline (optional but aligned with your direction)** — Add **Eleventy** + a content model for projects; then **Tina, Decap, or Sanity** if you want a visual editor. Details: [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md).  
1. **Content truth** — Fix **SYNEK vs `tactility-grounding.html`** naming/slug; ship one case study end-to-end as a template for the others (can be step 1 of the 11ty migration).  
2. **Footer extras** — Decide what goes in `.time-footer__extras` (e.g. colophon, Are.na/GitHub already in hero—avoid duplication).  
3. **About / contact / CV** — Minimum viable copy + any form or `mailto` pattern you prefer.  
4. **Lab hardening (optional)** — Preset list expansion. **Copy coords** for bug reports: done (lab footer **copy coords**).

---

## 5. Out of scope / open questions

- **Timezone from spoofed longitude** — Full “fake location ⇒ fake local solar clock” was explicitly deferred; current lab behavior is intentional. Revisit only if you want caption time to follow debug coords too.  
- **Server-side geolocation** — Not discussed; everything remains client-side Open-Meteo + browser geo.  
- **CMS / SSG** — Target model is **static output** (11ty build); editors may use Markdown or a headless CMS that compiles to the same static files. See [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md).

---

## 6. Traceability

| Conversation thread | Primary artifacts |
|---------------------|-------------------|
| Grouped footer + geo + lab | `index.html` (structure), `js/adapt-hero.js` (anchor, geo, lab keys), `css/styles.css` (footer) |
| Clock frozen vs temp | `js/adapt-hero.js` (`updateFooterCaption`, `FOOTER_CLOCK_MS`) |
| Centered footer | `css/styles.css` (`.time-footer__row` grid, alignment) |

---

## 7. Agent-friendly backlog (no author copy required)

Work that can advance **without** your intervention: consistency fixes, stubs, a11y shells, small dev UX.

| Story | Done (this pass) | Still needs you |
|-------|-------------------|-----------------|
| **US-D1** | Project `<h1>` / `<title>` + stubs aligned with **home cards**; `projects/index.html` labels match; SYNEK stub notes filename | Real case study prose, slug/redirect decision |
| **US-B2** | Extras region has `role="region"` + `aria-label` for future content | What to put in `.time-footer__extras` |
| **Phase 4 lab** | **copy coords** button (effective `readAnchorLatLon`, 5 dp) | — |
| **Polish** | Ascension blurb typo (“lifrom” → “from”, spacing); `cv.html` uses `project-page` + back link + title; `contact` / project list use `data-appearance="dark"` with index | Contact copy, CV file or embed |
| **Work rail (small viewports)** | `attentionCenterY` @ max-width 820px in `js/work-cards.js` | Fine-tune 0.36 factor if devices still mis-read |
| **Footer lab easter egg** | `⁘` toggles lab + scene debug; `?lab=0` / `?sceneDebug=0`; Alt+click clears | — |
| **US-A–C, B1** | Already implemented in earlier sessions | — |
| **US-D2, US-E** | — | Your words or 11ty/CMS setup |

---

*Document generated for handoff after a break; update this file as priorities shift.*
