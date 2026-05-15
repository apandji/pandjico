# pandjico — Mobile Experience Spec
**For: Cursor / implementation reference**
**Site: apandji.github.io/pandjico**

**Role in repo:** Immediate implementation spec for mobile layout and touch behavior. Aligns with station **Sky** orientation and open transmission of work. **North star:** [station-concept-and-critique.md](./station-concept-and-critique.md). **Queue:** [next-actions.md](./next-actions.md).

---

## Philosophy

The desktop site is atmospheric and ambient — color shifts at the periphery, information reveals gradually. Mobile shouldn't be a shrunk version of that. It should feel like the *original* form: intimate, vertical, touch-native. The phone is the right place for a site about place, time, and sensation.

The scroll is the primary gesture. Almost everything is delivered through it. Very little chrome, very little UI. The experience should feel more like reading a zine than navigating a nav-heavy portfolio.

---

## Page Structure & Scroll Flow

The mobile page is a single, tall scroll. No sticky nav. Each section occupies a deliberate portion of the viewport. The rhythm is: **arrive → read the person → understand the context → discover the work → leave with a way to follow up.**

```
┌─────────────────────────┐
│  [1] HERO               │  ~100vh — typographic, full bleed
├─────────────────────────┤
│  [2] SKY CONTEXT        │  ~50–60vh — ambient intro + permission
├─────────────────────────┤
│  [3] COME BACK NOTE     │  ~20vh — one-line peripheral nudge
├─────────────────────────┤
│  [4] PROJECT CARDS      │  ~90vh each — tall, immersive
│      (repeating)        │
├─────────────────────────┤
│  [5] SOCIAL PROOF       │  ~50vh — logos + brief credential lines
├─────────────────────────┤
│  [6] CONTACT BAND       │  ~40vh — what I'm working on + CTA
├─────────────────────────┤
│  [7] OVERSCROLL         │  Revealed on over-pull — cv, github, are.na
└─────────────────────────┘
```

---

## Section-by-Section Spec

---

### [1] Hero — Typographic Arrival

**Goal:** Establish identity immediately. No ambiguity about who this person is.

**Layout:**
- Full viewport height (`100svh` — use `svh` not `vh` to account for mobile browser chrome)
- Vertically centered, slight top bias (~40% from top)
- No image, no logo — pure type

**Content:**
```
I'm Andrew Pandji —
a creative technologist,
artist & experience
design leader.
```

**Typography treatment:**
- The name "Andrew Pandji" should be visually differentiated — could be italic (as it is on desktop), or a slightly different weight, or a color derived from the current sky palette
- Font size: `clamp(2.4rem, 9vw, 5rem)` — large enough that on a 390px screen the name wraps naturally into 2–3 lines and feels poster-like
- Line height: `1.1`–`1.15` — tight, editorial
- The text should feel like it *fills* the screen with intent, not that it was scaled down from somewhere else

**Animation (optional but recommended):**
- Staggered word-by-word or line-by-line fade-up on load
- `animation-delay` increments of ~80ms per element
- Keep it under 600ms total — this is a reveal, not a performance

**No nav here.** No hamburger menu. Nothing except the text and the ambient background color.

---

### [2] Sky Context — Ambient System Intro

**Goal:** Explain the color system without making it feel like a feature callout. It should feel like a whisper, not a tooltip.

**Layout:**
- ~50–60% viewport height
- Text sits in the lower half; upper half is dominated by the current background color breathing visibly (a very subtle slow pulse or gradient shift — CSS `@keyframes` on opacity or saturation, 6–8s cycle)
- Text is left-aligned, comfortable reading width (~32ch max)

**Content (suggested copy):**
```
This site's colors change with the time of day and
temperature of the sky above you.

Right now it's set to St. Louis — where this was made.

Tap below to use your own sky instead.
```

**The permission button:**
- Single tap target: `[ Use my sky ]` or `[ Use my location ]`
- Style: ghost/outlined — don't make it feel like a marketing CTA, keep it low-key
- On tap: request geolocation, then immediately update the color palette
- If denied: show a brief inline note — *"No worries — St. Louis skies are good skies."* — and continue
- The button should feel optional, not required

**Implementation notes:**
```javascript
// On tap
navigator.geolocation.getCurrentPosition(
  (pos) => updateSkyColors(pos.coords.latitude, pos.coords.longitude),
  (err) => showDeniedMessage()
);
```
- Fetch current weather/time for the user's coordinates
- Map to your existing color palette logic
- The transition between palettes should be a smooth CSS custom property transition (~1.5–2s)

---

### [3] Come Back Note — Peripheral Nudge

**Goal:** Plant a seed for return visits. One line. No pressure.

**Layout:**
- Thin band, maybe 15–20% viewport height
- Centered text, small — `0.85rem`, secondary color (lower opacity or lighter weight)
- Almost a caption

**Content:**
```
Come back later to see different colors.
```

Or with a timestamp flavor:
```
Come back tonight. The sky will be different.
```

**No interaction here.** Just a line. It passes by as the user scrolls.

---

### [4] Project Cards — Tall, Immersive Work Units

**Goal:** Each project gets its own moment. The work feels substantial, not like a thumbnail grid.

**Layout per card:**
- Height: `88–92svh` — almost full screen, but the top of the next card peeks below the fold (this is important — it signals scrollability and creates anticipation)
- Full bleed background: the video or image fills the card edge-to-edge
- Text overlays at the bottom of the card on a dark gradient scrim

**Card anatomy:**
```
┌───────────────────────────┐
│                           │
│   [video / image fill]    │
│                           │
│                           │
├───────────────────────────┤  ← gradient scrim starts here (~60% up)
│  Tag label                │  e.g. "health" or "experimental"
│  Project title            │  e.g. "Ascension Video Chat"
│  One-line description     │  "Run a day of telehealth..."
│                           │
│  [ Open project → ]       │  Single tap target, full width
└───────────────────────────┘
```

**Video handling:**
```html
<video autoplay muted loop playsinline preload="none" poster="card-thumb.jpg">
  <source src="project-loop.mp4" type="video/mp4">
</video>
```
- `playsinline` is required for iOS — without it, video opens fullscreen
- `preload="none"` defers loading until near viewport — use IntersectionObserver to trigger play
- Always include a `poster` image as fallback

**Card entrance animation:**
- Use `IntersectionObserver` with a threshold of ~0.15
- On entry: fade-in + slight translate-up (12–16px, 400ms ease-out)
- The card itself doesn't need to do anything exotic — the rhythm of large cards appearing on scroll creates its own momentum

**Replacing the hover/two-tap mechanic:**
- On desktop: hover reveals project info overlay
- On mobile: **info is always visible** at the bottom of the card (the overlay is default-open)
- Single tap navigates to the project
- No two-tap pattern — mobile users won't discover it

**Scroll snapping (optional, consider carefully):**
```css
.projects-scroll {
  scroll-snap-type: y mandatory;
}
.project-card {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```
This creates a paged feel — each project snaps into place. Can feel great or too rigid depending on content. Test it. If it feels constraining, use `proximity` instead of `mandatory`.

---

### [5] Social Proof — Logos & Credentials

**Goal:** Establish credibility without feeling like a resume dump. Keep the ambient, understated tone of the rest of the site.

**This is the trickiest section for mobile.** Here's a recommended approach:

**Option A — Stacked credential cards (recommended)**

Each client/role becomes a small stacked unit:

```
┌───────────────────────────┐
│  [Ascension logo]         │
│  Seven-plus years —       │
│  pharmacy to clinical     │
│  tools to virtual care.   │
└───────────────────────────┘

┌───────────────────────────┐
│  [TCARE logo]             │
│  Pre-seed through         │
│  Series A. Pilots,        │
│  product, growth.         │
└───────────────────────────┘
```

- Each card is its own block, full width, comfortable padding
- Logo is small (~40–48px tall), left-aligned, tinted to the current sky color palette (desaturated or monochrome treatment)
- The accompanying text is 2–3 lines max — earned, not exhaustive
- Cards appear with staggered entrance on scroll

**Option B — Horizontal scroll row**

If logos need to be grouped (e.g. if you add more over time):
```css
.logos-row {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 2rem;
  padding: 1rem 1.5rem;
  scrollbar-width: none;
}
```
This works well for 4+ logos but feels thin with only 2. Stick with Option A unless the logo count grows.

**Design note:** Logos should never feel like a badge wall. Treat them as part of the prose, not proof points. The one-line context beneath each is what does the credential work.

---

### [6] Contact Band — What I'm Working On + CTA

**Goal:** Give someone a reason to reach out, and make reaching out trivially easy.

**Layout:**
- ~40–50svh
- Two distinct moments within the section, separated by generous spacing

**Moment 1 — What I'm working on:**
```
Currently focused on interfaces that center
tactility and grounding. Open to senior and
lead design roles in health, climate, and
emerging tech.
```
- This text should be updated to reflect your actual current focus — treat it as a living line, not a static bio
- Keep it under 3 lines on mobile (use `clamp` on font size to ensure this)

**Moment 2 — CTA:**
- Two options, stacked vertically, full-width tap targets (min 48px height)
```
[ See all work ]
[ Let's work together → ]
```
- "Let's work together" goes to `/contact` or opens `mailto:` — your call
- Don't use a mailto directly on mobile if you can avoid it; it opens the mail app which can feel jarring. A `/contact` page with a form is better UX.

**Typography note:** The CTA buttons should not look like Bootstrap buttons. Consider plain text links with a custom underline animation or border treatment that matches the site's visual language.

---

### [7] Overscroll — Navigation as Discovery

**Goal:** The cv, github, and are.na links feel like a hidden layer — found by those who pull past the end of the page. Rewards curiosity without demanding it.

**Implementation approach:**

```javascript
// Detect overscroll on iOS / momentum scroll past bottom
let lastScrollY = 0;
let isAtBottom = false;

window.addEventListener('scroll', () => {
  const scrollBottom = window.scrollY + window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;
  
  if (scrollBottom >= docHeight - 4) {
    isAtBottom = true;
  }
  
  if (isAtBottom && window.scrollY < lastScrollY) {
    // User pulled back from bottom — reveal the tray
    revealFooterTray();
  }
  
  lastScrollY = window.scrollY;
});
```

Alternatively, use a CSS-based overscroll reveal with `overscroll-behavior` and a sticky footer that peeks through:
```css
body {
  overscroll-behavior-y: none; /* prevent default bounce obscuring reveal */
}

.footer-tray {
  position: fixed;
  bottom: 0;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-tray.revealed {
  transform: translateY(0);
}
```

**Content of the tray:**
```
cv · are.na · github
```
- Keep it minimal — this is not a footer, it's a secret layer
- The `⁘` symbol from the desktop site could appear here as a kind of closing mark
- Same type style as the rest of the site, centered, generous vertical padding

**Reveal trigger:** User reaches the bottom of the content and pulls/scrolls further. On iOS this manifests as the rubber-band bounce — the tray is revealed beneath it. On Android, `overscroll-behavior: contain` on `body` and a manual scroll listener is more reliable.

---

## Global Mobile CSS Foundations

```css
/* ---- Fluid type scale ---- */
:root {
  --text-hero: clamp(2.4rem, 9vw, 5rem);
  --text-body: clamp(1rem, 3.5vw, 1.25rem);
  --text-label: clamp(0.75rem, 2.5vw, 0.875rem);
  --text-caption: clamp(0.8rem, 2.8vw, 0.9rem);
}

/* ---- Safe area insets (notch / home indicator) ---- */
.hero, .contact-band {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* ---- Touch targets ---- */
a, button {
  min-height: 44px;
  min-width: 44px;
}

/* ---- No horizontal overflow ---- */
html, body {
  overflow-x: hidden;
  max-width: 100%;
}

/* ---- Reduce motion respect ---- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ---- Sky color transitions ---- */
:root {
  --sky-bg: hsl(232 26% 5%);
  --sky-accent: hsl(220 20% 20%);
  transition: --sky-bg 1.5s ease, --sky-accent 1.5s ease;
  /* Note: custom property transitions require @property declarations in modern browsers */
}

/* Project cards */
.project-card {
  height: 88svh;
  position: relative;
  overflow: hidden;
}

.project-card video,
.project-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.project-card-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1.5rem;
  background: linear-gradient(
    to top,
    hsla(0, 0%, 0%, 0.85) 0%,
    hsla(0, 0%, 0%, 0.6) 50%,
    transparent 100%
  );
}
```

---

## IntersectionObserver — Card Entrance Pattern

```javascript
const cards = document.querySelectorAll('.project-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      
      // Start video playback when in view, pause when not
      const video = entry.target.querySelector('video');
      if (video) video.play().catch(() => {}); // catch autoplay policy rejections
      
      observer.unobserve(entry.target); // only animate in once
    } else {
      const video = entry.target.querySelector('video');
      if (video) video.pause();
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

cards.forEach(card => observer.observe(card));
```

```css
.project-card {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 400ms ease-out, transform 400ms ease-out;
}

.project-card.in-view {
  opacity: 1;
  transform: translateY(0);
}
```

---

## Open Questions (to resolve in design pass)

1. **Logo treatment at social proof section:** Monochrome/tinted to sky palette vs. original color? Tinted feels more cohesive but may reduce logo recognizability. Test both.

2. **"What I'm working on" copy:** This is currently implied by the bio. Does it become its own distinct section, or does it integrate into the contact band? Recommend distinct — it's doing different work (interest-signaling to recruiters) vs. the hero (identity).

3. **Contact mechanism:** `/contact` form page vs. `mailto:` vs. Calendly link vs. all three stacked? Given the seniority signal you're building, a form page feels more considered than a raw mailto.

4. **Tag/filter system on mobile:** On desktop, project tags (health / experimental / brand) presumably allow filtering. On mobile, this filter pattern needs rethinking — a horizontal scrollable pill row above the project cards is the standard pattern; alternatively, treat the project index page as the filtering surface and let the homepage just be the three best pieces.

5. **Scroll snapping:** Try `scroll-snap-type: y proximity` first on the project cards section. Mandatory can feel aggressive. Pull it out entirely if testers find it claustrophobic.

---

## Implementation Priority Order

| Priority | Section | Notes |
|---|---|---|
| 1 | Global CSS foundations | Safe areas, fluid type, overflow fixes |
| 2 | Hero typographic treatment | Biggest first impression, fastest win |
| 3 | Project card layout + video handling | Core content, most complex |
| 4 | Sky context + geolocation permission | Defines the site's character |
| 5 | Social proof stacking | Structural, not animated |
| 6 | Contact band | Functional requirement |
| 7 | Overscroll tray | Delightful but not critical path |
| 8 | Come back note | One line, five minutes |
