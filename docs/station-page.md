# Station page — Product requirements (PRD)

**Feature:** `/station` — the living interior of pandji.co  
**Implementation file (static site):** `station.html` at repo root (GitHub Pages: `…/pandjico/station.html`)  
**Status:** Shell shipped (hero palette + footer + placeholder copy). **This doc is the build spec.**  
**Queue:** [next-actions.md](./next-actions.md)

**Related docs**

| Doc | Role |
|-----|------|
| [station-concept-and-critique.md](./station-concept-and-critique.md) | **North star** — identity, instruments, voice, critique, site-wide themes (Part One–Three) |
| [project-longwave.md](./project-longwave.md) | **Transmissions** instrument — stream, RSS, Supabase; Presence wiring |
| [mobile-spec.md](./mobile-spec.md) | Touch targets, safe areas, vertical reading — applies to this page |
| [github-pages.md](./github-pages.md) | Deploy, `STATIC_CACHE`, HTTPS for geo |

*Source material merged from the station concept doc (May 2026) and the `/station` page spec draft.*

---

## 1. Summary

The **landing page** (`index.html`) is the professional face: work, credential, collections. The **station page** is the system behind it — always on, taking readings, transmitting. Visitors who follow the hero link (“I tend this [station](station.html)…”) or **⁘** arrive inside that argument.

The first piece of prose on this page — **“Why a station?”** — is also **transmission #0**: when Longwave ships, it slots into `/transmissions` without a rewrite.

---

## 2. Goals

| Goal | Measure |
|------|---------|
| Make the **station identity** legible | Visitor understands “not a portfolio” in one slow read |
| **Surface Sky** as orientation, not a footer footnote | Arrive *inside* the color engine (panel + day bar) |
| **Seed Transmissions** | First transmission styled as future log entries |
| **Directory the site** | Sitemap section lists work, station routes, elsewhere |
| **Preserve restraint** | No hero image, no dashboard chrome; ambient instruments |

---

## 3. Non-goals (this phase)

| Out of scope | See |
|--------------|-----|
| Full **Transmissions** UI / authoring | [project-longwave.md](./project-longwave.md) |
| **Trace** visualization (`/sky`) | Concept — [station-concept-and-critique.md](./station-concept-and-critique.md) Part One |
| **Webring** | Forthcoming |
| **Tone.js** generative music | Phase 2 below — MVP may ship without audio |
| Next.js migration | Static `station.html` until Longwave domain strategy is fixed |

---

## 4. Positioning vs other pages

| Page | Role |
|------|------|
| **`index.html`** | Landing — hero, work rail, footer; link word “station” → `station.html` |
| **`station.html`** | Station interior — why, instruments, brief tender, sitemap, presence |
| **`about.html`** | Deeper bio / portrait optional — **not** duplicated on station |
| **`contact.html` · `cv.html`** | Linked from sitemap; CV = practice record voice |
| **`projects/index.html`** | Collections (All Works) |

**Author block on station (§4 in layout)** is **brief and contextual** — who tends the instruments. Full “about” lives on `about.html`.

---

## 5. Experience principles

From concept + page spec — **do not regress these:**

1. **Arriving somewhere** — not a profile or dashboard; instruments quietly running.
2. **Ambient until engaged** — nothing demands attention; rewards slow reading.
3. **Same Sky** — one color engine (`js/adapt-hero.js`); no second palette implementation.
4. **Same type** — Ronzino / site scale; **monospace only** in sitemap block.
5. **No conventional nav bar** — back via “Index”, site name, or sitemap.
6. **Mobile-first readability** — text-heavy in a good way; [mobile-spec.md](./mobile-spec.md) for touch/safe-area.

---

## 6. Page structure

### Desktop (in progress) — three columns

Minimal edge inset (`~0.85rem` + safe area). Flex row ≥900px:

| Column | Heading | Content |
|--------|---------|---------|
| 1 | **Why a station?** | First transmission (locked copy) + **Transmissions** list (placeholder) |
| 2 | **The site** | Instruments (Sky, Collections, …) |
| 3 | **The author** | Brief tender + links (work, about, CV, contact; writings later) |

Sky panel, sitemap, presence, music — still in PRD; add above or below columns in a later pass.

### Original vertical scroll (Phase A remainder)

```
┌─────────────────────────────────────┐
│  [1] SKY + TIME         (~30–40svh) │  Instrument panel; day bar; ambient toggle (phase 2)
├─────────────────────────────────────┤
│  … columns or stacked sections …    │
├─────────────────────────────────────┤
│  [6] SITEMAP                        │  Monospace directory (optional row)
├─────────────────────────────────────┤
│  [7] PRESENCE + FOOTER              │  Tended signal; shared time-footer
└─────────────────────────────────────┘
```

**Entry points**

- Hero lede: `<a href="station.html">station</a>` (relative path for GitHub Pages).
- **⁘** in footer → `station.html` when wired ([station-concept-and-critique.md](./station-concept-and-critique.md) Part Two § Navigation).
- Sitemap, external links as needed.

---

## 7. Section requirements

### 7.1 Sky + time — instrument panel

**Purpose:** Visitor is *inside* the sky system immediately.

| Requirement | Detail |
|-------------|--------|
| Height | ~30–40 `svh`, full width |
| Background | Current scene `--bg-*` from `adapt-hero.js` (same as site) |
| Location line | e.g. `Current location: St. Louis, Missouri` — left, muted `~0.8rem` |
| Time + weather | Right-aligned: clock, period label (Morning), temp · conditions — tabular figures |
| **24-hour bar** | Full-width 2px gradient (midnight → dawn → noon → dusk → midnight); marker at `(hour×60+minute)/1440` |
| Data source | Reuse footer caption / scene state — do not duplicate weather fetch |
| CSS vars | Expose or derive `--sky-midnight`, `--sky-dawn`, `--sky-noon`, `--sky-dusk` from palette logic (or approximate from hourly samples in `adapt-hero.js`) |
| Ambient toggle | Corner control: `♦ ambient` / `◆ ambient` (pulse when active) — **Phase 2** with Tone.js |

**Acceptance:** Panel updates when visitor toggles “use my sky”; marker moves on scene tick / caption clock.

---

### 7.2 Why a station? — first transmission

**Purpose:** Philosophical anchor; template for future transmissions.

**Locked copy** (may not paraphrase without explicit product decision):

> What started as a site that hosted collections of my work became something else — personal broadcasting infrastructure.
>
> I imagine pandji.co as a station. One that observes, records, and broadcasts. Always located somewhere specific. Always tended.
>
> I wanted to bring some of that early web energy back. The feeling that a site has edges, that it belongs to a network — legible not just to the author but to anyone who visits. The colors you're seeing are derived from my sky. You can change them to reflect yours. Eventually the transmissions and traces from everyone who passes through will be visible too.
>
> A station holds instruments. The instruments take readings. The readings are made public. That's the counterpoint to how the web works now.
>
> I tend this one.

| Requirement | Detail |
|-------------|--------|
| Datestamp | `first transmission · May 2026` — muted, above body; **no H2 title** |
| Measure | `max-width: 60ch`, left-aligned, generous vertical padding |
| Style class | `.transmission` (or equivalent) shared with future Longwave entries |
| Semantics | `<article>` with datetime attribute when wired to CMS |

**Acceptance:** Block matches transmission typography spec in [project-longwave.md](./project-longwave.md) when that doc defines entry layout.

---

### 7.3 About the site — instruments

**Purpose:** Name components in station voice — not a marketing feature list.

**Copy (baseline — align with [station-concept-and-critique.md](./station-concept-and-critique.md) Part One § Instruments):**

| Instrument | Description (short) | Link MVP |
|------------|---------------------|----------|
| **Sky** | Color from time + temperature; default St. Louis; visitor can use their sky | Footer toggle / panel copy |
| **Collections** | Curated views of work; All Works + future audience URLs | `projects/index.html` |
| **Transmissions** | Log of thinking, making, noticing; RSS | Stub → Longwave |
| **Trace** | Anonymous presence record — not analytics | `coming` or unlinked |
| **Presence** | Signal when station recently tended | §7.7 |

**Layout:** Plain prose list — name emphasized (small caps or weight, not bold bullets). No icons.

**Collections** should appear here even though concept table sometimes omits it — it is **shipped** ([instrument-collections.md](./instrument-collections.md)).

---

### 7.4 About the author — who tends it

**Purpose:** Brief tender; link back to work.

**Copy (baseline):**

> Andrew Pandji is a creative technologist, artist, and experience design leader based in St. Louis. His practice is about grounding — designing so people can feel where they are inside systems that usually remain invisible.
>
> He has spent eight years building products that accelerated care and healing, from pre-seed to one of the largest health systems in America. He is currently researching at the intersection of embodied interfaces and environmental sensing.
>
> The work lives at [pandji.co →](index.html)

| Requirement | Detail |
|-------------|--------|
| Type | ~`0.95rem` — secondary register vs transmission |
| Depth | Shorter than `about.html` |

---

### 7.5 Music — generative ambient (Phase 2)

**Purpose:** Sky-conditioned opt-in audio; never autoplay.

| Requirement | Detail |
|-------------|--------|
| Library | Tone.js |
| Mapping | Sky hue → base freq; temp → reverb; time of day → pulse; conditions → brightness/filter |
| Gesture | Toggle in §7.1 satisfies browser autoplay policy |
| Sky change | Crossfade params 3–4s when visitor moves pin |
| UI | No labels “music” / “audio” — symbol + pulse only |

**Defer** until MVP sections 1–4, 6–7 ship.

---

### 7.6 Sitemap — signal directory

**Purpose:** Complete index; station-native; monospace register.

**Structure (update hrefs as routes ship):**

```
the work
  made →              projects/index.html
  [future collections / audience presets]

the station
  transmissions →     (coming — project-longwave.md)
  sky →               (optional color archive page — later)
  trace →             (coming)

elsewhere
  about →             about.html
  contact →           contact.html
  cv →                cv.html
  are.na · github →   external
  rss →               /transmissions/feed.xml (when live)
```

| Requirement | Detail |
|-------------|--------|
| Typography | Monospace / tabular — only section allowed |
| Labels | Section headers ~`0.75rem`, muted, small caps |
| Coming items | Listed, unlinked, quiet “coming” or self-evident |
| RSS | Visible when feed exists — signals audience |

---

### 7.7 Presence — footer signal

**Purpose:** Ambient “recently tended” without chat UX.

**States (from last transmission timestamp):**

| Hours since | State | Display |
|-------------|-------|---------|
| &lt; 2 | `active` | `◉ tended recently` |
| &lt; 24 | `recent` | `○ around` |
| &lt; 168 | `around` | `○ around` (copy TBD) |
| ≥ 168 | `quiet` | *(nothing)* |

**MVP:** Hardcode `lastTransmissionAt` = first transmission date (May 2026).  
**Later:** Read from Supabase `transmissions` — [project-longwave.md](./project-longwave.md).

| Requirement | Detail |
|-------------|--------|
| Placement | Above or beside shared `.time-footer` |
| Style | ~`0.75rem`, no animation |

**Shared footer:** Reuse existing `.time-footer` markup + `adapt-hero.js` + `lab-egg.js` + `frost-tooltip.js` from `index.html` / `projects/index.html`.

---

## 8. Technical requirements

| Area | Requirement |
|------|-------------|
| **HTML** | `station.html`; `data-appearance` + theme-color + favicon pattern match home |
| **CSS** | Extend `css/styles.css` — `.station-page`, `.station-sky-panel`, `.transmission`, `.station-sitemap`, `.station-presence`; reuse `.hero` accent/prose tokens where appropriate |
| **JS** | `adapt-hero.js` (required); new `js/station-page.js` optional for day-bar marker + presence only |
| **SW** | Add `station.html` + any new assets to `sw.js` `PRECACHE_REL`; bump `STATIC_CACHE` |
| **A11y** | Skip link, heading hierarchy, focus styles on links, no autoplay audio |
| **HTTPS** | Required for geo on Sky toggle (same as site) |

**Do not** fork Sky palette logic into a second module.

---

## 9. User stories

| ID | Story | Priority |
|----|-------|----------|
| **ST-1** | As a visitor, I open `station.html` and see live sky + time before reading prose. | P0 |
| **ST-2** | As a visitor, I read “Why a station?” and understand the site’s frame. | P0 |
| **ST-3** | As a visitor, I see which instruments exist and which are coming. | P0 |
| **ST-4** | As a visitor, I can reach all major pages from the sitemap. | P0 |
| **ST-5** | As a visitor on mobile, I can read comfortably without horizontal scroll. | P0 |
| **ST-6** | As a visitor, I return to work via Index / pandji.co link. | P0 |
| **ST-7** | As a visitor, I see whether the station was tended recently. | P1 (MVP hardcoded) |
| **ST-8** | As a visitor, I opt in to ambient audio tied to sky. | P2 |
| **ST-9** | As a visitor, I follow **⁘** from home to the station. | P1 (wire footer) |
| **ST-10** | As a reader of RSS, I find the feed path in sitemap when live. | P2 |

*Site-wide station stories (footer Sky, mobile orientation) remain in [station-concept-and-critique.md](./station-concept-and-critique.md) Part Three.*

---

## 10. Build phases

### Phase A — MVP (ship readable station)

| Step | Task | Done when |
|------|------|-----------|
| A1 | `station.html` structure + sections 2–4, 6 copy in place | No lorem |
| A2 | Sky panel §7.1 — location/time/weather from existing caption APIs | Matches footer data |
| A3 | 24-hour bar + marker | Marker position correct at load + tick |
| A4 | Transmission block §7.2 — locked copy + datestamp | Matches §7.2 |
| A5 | Instruments list §7.3 incl. Collections | Links correct |
| A6 | Author block §7.4 | Links to `index.html` |
| A7 | Sitemap §7.6 | All live routes work on GH Pages |
| A8 | Presence §7.7 hardcoded + shared footer | Footer parity with home |
| A9 | Hero + **⁘** → `station.html` | Relative `station.html` |
| A10 | `sw.js` precache bump | Deploy verified |

### Phase B — Enhancement

| Step | Task |
|------|------|
| B1 | Tone.js ambient toggle §7.5 |
| B2 | Wire **⁘** `footer-extras-dial` to `station.html` (if product confirms) |
| B3 | Presence from Supabase when Longwave live |
| B4 | `/transmissions` + RSS links in sitemap |
| B5 | Optional `/sky` trace archive page |

---

## 11. Acceptance criteria (MVP)

- [ ] Page loads with correct Sky palette and footer caption without console errors.
- [ ] Locked transmission copy verbatim (§7.2).
- [ ] Instruments list includes **Sky**, **Collections**, **Transmissions**, **Trace**, **Presence** with accurate shipped/coming state.
- [ ] Sitemap links resolve on `https://apandji.github.io/pandjico/`.
- [ ] `about.html` stays the deeper bio; station author block stays brief.
- [ ] Lighthouse: no autoplay audio; readable contrast on prose (reuse `enforceProseWcagAgainstBg` patterns).
- [ ] Mobile: safe-area padding; 48px tap targets on toggles/links in panel.

---

## 12. Environment & dependencies

```bash
# Sky (existing — adapt-hero.js / Open-Meteo via fetch)
# No new keys required for MVP panel

# Longwave / Presence (later)
SUPABASE_URL=
SUPABASE_ANON_KEY=

# OpenWeatherMap — only if legacy path referenced; site uses Open-Meteo today
```

**npm (Phase B only):** `tone` for generative audio.

---

## 13. Open questions

| # | Question | Default if silent |
|---|----------|-------------------|
| 1 | Should **⁘** always link to `station.html`, or Shift+click keep lab? | Click → station; Shift → scene debug (current) |
| 2 | Separate **`/sky`** archive or only panel + footer? | Panel only for MVP |
| 3 | “Coming” label vs unlinked instruments? | Quiet `coming` for Trace, Transmissions until live |
| 4 | Merge instrument copy with concept doc table long descriptions? | Short inline per §7.3 |
| 5 | Clean URL `…/station/` via `station/index.html`? | Stay `station.html` until 11ty |

---

## 14. Doc maintenance

When MVP ships: move tasks to [next-actions.md](./next-actions.md) **Done**, check off §11 here, update [station-concept-and-critique.md](./station-concept-and-critique.md) Part Three page table (`station.html` **shipped**).

*PRD version: 2026-05-15 — integrated from station concept doc + `/station` page spec.*
