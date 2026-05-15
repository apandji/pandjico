# Pandji.co — The Station
## Concept Document & Site Critique
**Working document — not for public distribution yet**

**Role in repo:** North star for identity, instruments, copy voice, architecture, product themes, user stories, and page map. When product choices conflict, this doc wins. **Station page build spec:** [station-page.md](./station-page.md) (PRD). **Queue:** [next-actions.md](./next-actions.md). **Doc index:** [README.md](./README.md).

---

# Part One: The Concept

## What This Is

Pandji.co is a station.

Not a portfolio. Not a personal brand. Not a feed. A station — in the sense of a monitoring station, a signal station, a ground station. A place with instruments. A place where someone takes readings, tends the equipment, and transmits what they find.

The person who tends it is Andrew Pandji — a designer, artist, and creative technologist based in St. Louis. The work produced here sits at the intersection of tactility, environmental sensing, health technology, and the politics of interfaces. But the work is not the point of the station. The station is the context in which the work becomes legible.

---

## Why a Station

The dominant metaphor for a personal site is a portfolio — a curated presentation of finished objects, arranged for evaluation. The portfolio is a fundamentally extractive form. It asks the visitor to assess and move on. It has no relationship with time, place, or the conditions of its own making. It performs competence. It does not transmit.

A station does something different. It observes. It records. It transmits continuously, not just when something is finished. It is always located somewhere specific — a particular latitude, a particular hour, a particular temperature. That situatedness is not incidental. It is the whole point.

This station is located in St. Louis. It takes readings from the sky above it — color, temperature, time of day — and reflects those conditions back to anyone who visits. It maintains a log of transmissions: short ambient captures, longer considered pieces, work in progress. It keeps an anonymous record of everyone who has passed through, not to surveil them but to make the site feel inhabited. To make legible the fact that others have been here, in their own skies, at their own hours.

These are not features. They are instruments. And together they make an argument about what a personal web presence can be.

---

## The Argument

The current web is extractive. Every interaction is a data point harvested against the user. Every platform optimizes for engagement, which is a euphemism for capture. The interfaces are designed to disorient — to make you lose track of time, place, and your own intentions. A disoriented user is a more manipulable user. This is not an accident.

The early web was different. Not better in every way — it was also chaotic, exclusionary, technically crude. But it had a quality the current web has almost entirely lost: **you could feel its edges.** Sites knew they were part of a network. Visitors left marks. Hit counters told you others had been there. Webrings showed you where you were in a larger topology of related places. Away messages told you something true about the person behind the page. Presence was legible.

These weren't just nostalgic affordances. They were **grounding mechanisms** — ways of orienting a visitor in a space that was otherwise abstract and boundless. They situated both the site and the visitor in time and place and relation.

This station is built in that spirit, with contemporary means. Every instrument is visible. Every data collection is pointed back at the visitor rather than extracted from them. The sky you see when you arrive is your sky, or the station's sky if you haven't shared yours. The record of your visit is anonymous — a shape of light, a color, a time — nothing more. The log of transmissions is one-directional but human: a person thinking out loud, not a content strategy.

This is the design argument embedded in the infrastructure itself, before a single case study is read.

---

## The Instruments

| Instrument | Role | Spec / status |
|------------|------|----------------|
| **Sky** | Color engine from time, temp, sky; default St. Louis; visitor can share location | **Shipped** in static site (`adapt-hero.js`) |
| **Longwave / Transmissions** | Broadcast log at `/transmissions`; RSS; syndication outward | **Next build** — [project-longwave.md](./project-longwave.md) |
| **Trace** | Anonymous visitor record; consent-forward; `/sky` visualization | Planned |
| **Presence** | Ambient signal when station is recently tended | Planned |
| **Collections** | Curated subsets per audience; own URLs | **Partial** — All Works tags/filters → [instrument-collections.md](./instrument-collections.md); `audience` Phase 2 |
| **Webring** | Invited adjacent sites; traversed ring | Forthcoming |

**Sky** — The color engine. Takes readings from the environment — time of day, temperature, sky conditions — and maps them to the site's visual palette. Default is St. Louis. Visitors can share their own location and see their own sky. The station follows its tender: when a transmission is sent from elsewhere, the station's sky shifts to that location. The palette is always situated. There is no view from nowhere.

**Longwave / Transmissions** — The broadcast system. Short ambient captures sent from a phone in motion. Longer considered pieces written with intention. A reverse-chronological log at `/transmissions`. An RSS feed for people who still use RSS — which is a signal about the kind of audience this is for. Transmissions radiate outward to Bluesky and Are.na. Things start here.

**Trace** — The anonymous visitor record. Not analytics. Not surveillance. A portrait of the site's history built from aggregate, anonymized data: how many people have been here, at what hours, in what weather, from what distances. Visitors consent explicitly and are told plainly what is kept and why. The record is pointed back at them — you are part of a larger pattern of people who have passed through this space. The `/sky` page is where this becomes visible: a field of color swatches, each one a visit, each one a sky.

**Presence** — A derived state from recent activity. When the station has been recently tended — a transmission sent, something made, the tender online — a quiet signal appears. Not a green dot. Not a chat prompt. Something more ambient. The quality of light in a room where someone is working. It makes legible the fact that there is a person behind this place who is currently alive and thinking.

**The Collections** — A curatorial layer over the work. Different audiences receive different collections — a curated subset of projects framed for a specific context. Each collection is its own URL. Each one makes visible the station that contains it: whoever receives a collection link can feel that there is a larger system behind it if they want to explore. The work is never decontextualized from the practice that produced it.

**The Webring** *(forthcoming)* — A small network of sites belonging to people working at adjacent edges — design, technology, environment, embodiment, health. Tended, not algorithmic. You join by invitation. The ring has a name. Visitors can traverse it. It is infrastructure for community that does not require a platform.

---

## The Practice

The station is not a metaphor for the design work. It *is* the design work, in the same register as everything else produced here.

Aria makes air quality felt. Egress makes space navigable through touch. Color Scroller makes behavioral training visible. Sky makes environmental conditions perceptible. Trace makes anonymous presence legible. Transmissions makes a thinking practice public.

The common thread: **a system was operating silently. Now you can sense it.**

That is the station's practice. Observation, inscription, transmission. Taking readings from the world, making them perceptible, sending them outward. The portfolio work and the site infrastructure are not separate activities. They are the same activity at different scales.

---

## A Note on Situatedness

This station is located in St. Louis, Missouri. That is not incidental. St. Louis has specific air quality conditions, specific weather patterns, specific light. The station takes readings from that specific place and those readings inflect everything — the color of the page, the texture of the transmissions, the subjects of the work.

When the tender is elsewhere — in Bali, in Tokyo, passing through — the station follows. The sky shifts. The location of the transmission is part of the transmission. Situatedness is not a constraint. It is information.

Donna Haraway called this situated knowledge: the idea that all knowledge comes from somewhere, from someone, at some time, and that pretending otherwise is not objectivity but a particular kind of dishonesty. The station makes its situatedness visible. The data is never from nowhere. It is always from here, now, at this temperature, under this sky.

---

# Part Two: The Critique

## Reading the Current Site Through the Station Lens

The site as it stands — `apandji.github.io/pandjico` — was built before the station concept was named. Reading it now, you can see the concept emerging but not yet fully inhabited. The infrastructure is right. The identity isn't fully committed yet. Here is a close reading.

*Note (May 2026):* Footer intro copy, cloud toggle, and reduced 3D rail tilt reflect ongoing alignment with station voice; see implementation in `adapt-hero.js` / `index.html`.

---

## The Landing Page

**What's there:**
```
I'm Andrew Pandji — a creative technologist, artist & experience design leader.
Based in St. Louis with a career spanning brand, product, and health tech —
eight-plus years building tools that accelerated care and healing.
Now focused on interfaces that center tactility and grounding.

[Ascension logo] [TCARE logo]

[See what I'm working on] [Let's work together]

cv · are.na · github

Selected work
[three project cards]

site's colors change based on time of day; default is my home, st. louis,
where this site was crafted. click to use your own sky instead.

⁘
```

**The critique:**

The opening line is good but not yet committed. *"Creative technologist, artist & experience design leader"* describes categories. It doesn't transmit a position. Compare it to what the station concept produces: *"I tend a station. I take readings from the world and make invisible systems perceptible."* That's a position. The current line could be anyone with a similar background.

The Sky explanation — *"site's colors change based on time of day; default is my home, st. louis, where this site was crafted. click to use your own sky instead."* — is the most distinctive thing on the page and it's at the bottom, after the projects, in small type. This is the station's most legible instrument and it's been buried as a footnote. It should be closer to the top, not as a feature callout but as an orientation — *this is how this place works* — delivered before the work begins. **Mobile:** [mobile-spec.md](./mobile-spec.md) § Sky Context addresses this for small screens.

The social proof (Ascension, TCARE logos) is doing credential work but in a visual language borrowed from agency sites. The station framing makes this feel slightly off — a station doesn't have clients in that sense, it has a history of readings taken in specific contexts. The reframe: these aren't logos, they're locations where the practice was applied. The copy beneath them is already doing this — *"Seven-plus years transforming digital experience"* — but the logo treatment undermines it.

The CTAs — *"See what I'm working on"* and *"Let's work together"* — are conventional. They belong on a portfolio site. On a station the language shifts slightly. *"See what's been made"* or just an arrow into the work. The contact CTA could be *"Get in touch"* or more personally *"Reach the station."* Small changes but they shift the register.

The `⁘` at the bottom is a closing mark that implies there's a system and a sensibility behind the site. It's doing quiet work. Keep it.

**What's missing:**

There is no signal that the station exists. No link to `/station`, no Transmissions preview, no Presence indicator. The site currently presents as a portfolio with an interesting ambient color system. The station as a concept — as the frame that makes all of this coherent — is invisible. The visitor sees the instruments without knowing they're in a station.

The about page is a placeholder. This is understandable — it's hard to write about yourself — but the about page is where the station concept lives in its most concentrated form. Right now it says *"Add your bio, portrait, and highlights here."* It should say what a station is and why you tend one. That's the about page.

The CV page is also a placeholder. Less urgent but worth noting — the CV in the station context isn't a résumé, it's a record of where the practice has been applied. That's a different document with a different voice.

---

## The Works Page

**What's there:**
```
works : all

tags [filters]
sort: PAST→NOW / A→Z
show as: Mosaic / List

[no projects currently visible in the scraped content]

site's colors change based on time of day...
⁘
```

**The critique:**

The works page has good structural bones — tag filters, sort options, two view modes. This is the collections infrastructure waiting to happen. The mosaic/list toggle is the right instinct; the mosaic is the station-native view, the list is for when someone needs to scan efficiently.

The page title *"works : all"* is plain in a way that almost works but reads slightly awkward. *"all work"* or just *"work"* would be cleaner. Or — if you commit to the station framing — *"readings"* as the section name, with works as a subset. Though that might be too far for a hiring context. The tension between the station identity and legibility for a conventional hiring audience is real here and worth sitting with.

The tag filter system is important and needs to be populated deliberately. The tags in the station context aren't just organizational — they're the vocabulary of the practice. Tags like *health*, *experimental*, *brand* are fine but thin. Tags like *sensing*, *embodied*, *infrastructure*, *grounding* would be more specific to the actual work and would help the right audience self-select.

The Sky footer note appears here too, same as the landing. This repetition is actually right — the Sky system is always present, always operating, and its brief explanation should persist across pages. Consider making it slightly more ambient as the user gets deeper into the site — on the landing it gets a sentence of explanation, on inner pages it's just the `⁘` and the color. The first encounter explains, subsequent encounters just are.

---

## The Project Cards

**What's there:**
Three cards — Color Scroller, Ascension Video Chat, SYNEK launch campaign — each with a video or image, a title, a one-line description, and a tag.

**The critique:**

The one-line descriptions are strong. *"Scroll until stopping feels inevitable — then notice what the interface trained you to do."* That is a transmission. That is station-voice. It's doing exactly what the station concept asks of the work: making a system's operation visible, inviting the visitor to sense something they hadn't noticed. This should be the template for every project description on the site.

*"Run a day of telehealth without losing the thread between queue, chart, and video."* Also strong — functional, specific, places you in the situation. Good.

*"Brand a beer-dispenser startup from Kickstarter through an international tour — identity, campaign, touchpoints."* This one reads differently. It's describing scope rather than experience. Not wrong — the SYNEK work is brand work and brand work is harder to frame this way — but worth one more pass to find the felt quality of what that project did.

The *"Tap again to open"* mechanic, as noted in the mobile audit, needs to go. But in the station context there's an additional reason to rethink it: it makes the projects feel guarded, like they're behind a small barrier. A station is not guarded. It transmits openly. The project should open on first tap. **Mobile:** single-tap open — [mobile-spec.md](./mobile-spec.md) § Project Cards.

---

## The Navigation

**What's there:**
`cv · are.na · github` in the footer. No explicit nav at the top beyond the site title linking to the index.

**The critique:**

The minimal navigation is correct for the station philosophy. You don't want a nav bar that performs complexity. The dot-separated footer links are good. But the current set — cv, are.na, github — is missing the station itself. When `/station` and `/transmissions` exist, they belong here, and they should probably come first:

```
station · transmissions · cv · are.na · github
```

Or if you want to keep the footer purely external/administrative:
```
[station navigation handled in-page]
cv · are.na · github
```

Either way, the station needs a navigation presence. Right now the site has no way to route someone to the living parts of it because those parts don't exist yet. But the navigation should be designed now with those destinations in mind.

---

## What the Site Is Getting Right

It would be wrong to only identify gaps. The site is doing several things that are genuinely correct and should be protected:

**The Sky system is the right instinct executed well.** A site whose visual identity is tied to real environmental data is already doing what the station concept asks. The implementation exists. It just needs to be surfaced differently.

**The project descriptions are in the right voice.** The one-line descriptions under each project are precise, experiential, and specific. They don't describe what the project *is* — they describe what it *does to you*. That's the station voice. It should propagate to every piece of copy on the site.

**The restraint is right.** No hero image, no splash animation, no over-designed navigation. The site trusts its content and its color system. That trust is correct and should be maintained as the station layers are added. The temptation when adding Transmissions, Presence, and Trace will be to make them prominent. Resist this. The station's instruments are ambient, not loud.

**The `⁘` is right.** A small, unexplained closing mark that implies a system and a sensibility. Keep it. It will eventually link to `/station` — the mark becomes a door.

---

## Summary: What Needs to Change

**Immediate — copy and framing:**
- The opening line needs a station-voice rewrite. Not a description of categories but a transmission of position.
- The Sky explanation needs to move up the page — not as a feature, as an orientation. See [mobile-spec.md](./mobile-spec.md) for mobile layout.
- The about page needs to be written. It's the station's most important document.
- The social proof section needs a reframe — not logos, but locations where the practice was applied.

**Soon — architecture:**
- `/station` needs to exist. Right now there is no home for the living parts of the site.
- `/transmissions` needs to exist. The Longwave infrastructure can be built without it being public-facing yet, but the page needs a URL. → [project-longwave.md](./project-longwave.md)
- The navigation needs to be designed for a site that has a station, not just a portfolio.

**Eventually — integration:**
- Each case study page should carry a faint ambient layer — the sky conditions during the period the work was made. Not intrusive. Just situated.
- The collections system, when built, should make the station reference visible to anyone who receives a collection link.
- The `⁘` becomes a door to `/station` when the station exists.

---

## The One-Sentence Summary

The site currently presents as a portfolio with an interesting ambient color system. It should present as a station that also contains a body of design work. The infrastructure is largely right. The identity just needs to fully commit to what it already is.

---

# Part Three: Product themes, stories & scope

*Formerly `user-stories-and-scope.md` — folded here May 2026.*

## Scope (one paragraph)

Pandji.co is a **station**, not a portfolio: instruments (Sky, Transmissions, Trace, Presence, Collections) that observe, record, and transmit. The static site already ships **Sky** and a **Collections**-shaped index (**All Works** at `projects/index.html`). **Transmissions** is specified in [project-longwave.md](./project-longwave.md). Mobile treatment of Sky + work is in [mobile-spec.md](./mobile-spec.md).

## Product themes

| Theme | Direction |
|-------|-----------|
| **Footer** | Pin + one line: greeting, weekday date, time, temp, place; first-session intro (“readings” / rhythm copy) → glitch into live caption; `.time-footer__extras` reserved for more; centered bar layout. |
| **Sky anchor** | Default **St. Louis**; **Here** via cloud toggle + cached coords; `getCurrentPosition` (HTTPS); failures logged to **console**. Station instrument — surface as orientation, not a footnote (Part Two § Landing Page; [mobile-spec.md](./mobile-spec.md)). |
| **Lab** | `?lab=1` / `localStorage.lab=1`; apply / random / clear spoof coords. **Sun, weather, footer place, and scene/footer clock** follow the pin (Nominatim + timeapi.io; separate cache from real “here” place). |
| **Caption cadence** | Footer clock **1s**; weather ~**80s**; scene tick ~**5s**. |
| **Scene + a11y** | Hourly palette from sun + time; **outdoor °F** nudges palette by season; **`enforceProseWcagAgainstBg`** keeps hero prose/meta contrast vs `--bg-*` at **WCAG 2.1 AA** body text (~4.5:1 + headroom for CSS opacity). |
| **Debug** | `?sceneDebug=1`: time scrubber, accent-ink bump, **simulated °F** vs live weather. Footer **⁘**: lab (click), scene debug (Shift+click), clear (Alt+click); `?lab=0` · `?sceneDebug=0`. |

## User stories

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

- **US-D1** — Project pages match work cards; honest stubs until shipped. Card copy in **station voice** (what the work does to you, not category labels).
- **US-D2** — About = what a station is and why you tend one; Contact, CV in station register (CV as record of where practice was applied, not résumé theater).

### E. Authoring (optional)

- **US-E1–E2** — Faster case studies via static pipeline + optional CMS → [authoring-11ty-headless-cms.md](./authoring-11ty-headless-cms.md).

### F. Mobile (visitor)

- **US-F1** — Vertical, touch-native scroll; Sky orientation before work ([mobile-spec.md](./mobile-spec.md)).
- **US-F2** — Project cards: info visible, **single tap** to open (no two-tap guard).

### G. Transmissions (visitor / author) — later

- **US-G1** — Read reverse-chronological stream at `/transmissions` + RSS ([project-longwave.md](./project-longwave.md)).
- **US-G2** — Latest transmission as ambient “away message” on home when Longwave ships.

## Pages & stack

| Path | Role |
|------|------|
| `index.html` | Home: hero, work rail, adaptive footer (station landing; mobile rescope per [mobile-spec.md](./mobile-spec.md)) |
| `about.html` · `contact.html` · `cv.html` | About = deeper bio; Contact · CV = practice record |
| `station.html` | **In progress** — station interior; PRD [station-page.md](./station-page.md) |
| `/transmissions` | **Planned** — Longwave stream ([project-longwave.md](./project-longwave.md)) |
| `projects/*.html` | Case studies; **`tactility-grounding.html`** = SYNEK card until you rename + redirect |
| `projects/index.html` | **Collections** (All Works v2) — toolbar, masonry + list, `?view=list` — [instrument-collections.md](./instrument-collections.md) |

**Primary code:** `js/adapt-hero.js` (palette, anchors, Open-Meteo, lab geo/TZ/place, prose WCAG, footer timers), `css/styles.css`, `js/work-cards.js` (rail; `attentionCenterY` under **820px**), `js/works-index.js`, `js/lab-egg.js`, `js/register-sw.js` + **`sw.js`** (bump **`STATIC_CACHE`** when precached assets change), `js/frost-tooltip.js`.

## Out of scope (for now)

**Trace**, **Presence**, **Webring** (instruments above, not built). **Longwave** stack on Next.js until explicitly started. Server-side geolocation; runtime CMS on the **current** static site. **Custom domain:** [github-pages.md](./github-pages.md).

## Status snapshot

| Area | State |
|------|--------|
| Footer, sky toggle, lab egg, geo + caption flow, work-rail small viewports, SYNEK stub alignment, temp-driven palette, scene-debug °F sim, hero prose WCAG vs `--bg-*` | In repo |
| **Collections / All Works** (`projects/index.html`, JSON, filters, sort, URL, views, SW precache) | **v2 shipped**; polish: lazy tiles, device QA — [next-actions.md](./next-actions.md) |
| Station copy (hero, about), mobile rescope, case study prose, contact/CV, SYNEK slug, footer extras, 11ty/CMS, Longwave | Needs you — [next-actions.md](./next-actions.md) |

*When priorities shift, update [next-actions.md](./next-actions.md); keep Part Three in sync if themes or stories change.*
