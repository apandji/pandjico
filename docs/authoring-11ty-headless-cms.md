# Authoring: Eleventy + a visual headless CMS

**Goal:** Make **starting** and **shipping** project case studies easier than hand-maintaining parallel HTML files, while keeping the site **static** (fast, cheap hosting, no runtime CMS on the public site).

**Context today:** Hand-authored HTML (`index.html`, `projects/*.html`), shared `styles.css`, no `package.json` yet.

---

## 1. Why Eleventy (11ty) fits

- **HTML-first:** You can keep Nunjucks/Liquid layouts that mirror your current markup (`<main class="project-page">`, back link, etc.).
- **Incremental:** You can migrate **only** `projects/` first, leave the hero/footer JS as passthrough assets until you are ready to move the home page into templates.
- **Data-driven home rail:** A `projects.json` or `projects/*.md` collection can feed both **case study pages** and the **work card** grid on `index`—one source of truth for title, slug, tags, poster, and `href`.

Official docs: [https://www.11ty.dev/](https://www.11ty.dev/)

---

## 2. “Visual headless CMS” — what that usually means

| Approach | What you see | Where content lives | Best for |
|----------|----------------|---------------------|----------|
| **Markdown + Git** (no CMS) | Editor + preview in VS Code / Obsidian | Repo files | Lowest ops; you already live in the repo |
| **Decap CMS** (formerly Netlify CMS) | Web UI on `/admin`, edits Markdown/JSON in Git | Same repo via GitHub | Simple fields, editorial UI, **free**; “visual” is limited (often side-by-side preview) |
| **TinaCMS** | Sidebar / optional visual blocks on a dev/preview URL | Git-backed Markdown/JSON | **Strong “editing next to the page”** story for Markdown sites |
| **Sanity Studio** | Full custom studio, portable text, references | Sanity cloud + CDN assets | Rich case studies, image pipelines, **very** flexible; more setup |
| **Storyblok** | True block-based visual page builder | Storyblok API | Teams that want **WYSIWYG blocks**; monthly cost at scale |

For a **solo portfolio** where the main pain is **project pages + media**, a common sweet spot is:

1. **11ty + Markdown** (or JSON) for all project bodies and metadata.  
2. Add **Tina** or **Decap** if you want a **browser UI** without leaving Git as source of truth.  
3. Choose **Sanity** if you want **structured modules** (hero, gallery, quote, video) and a polished studio—and you are fine maintaining schemas.

---

## 3. Suggested project content model (for 11ty)

Each project is one file (or folder) with **front matter** + body, for example:

```yaml
---
title: "SYNEK launch campaign"
slug: "synek-launch"           # becomes projects/synek-launch/index.html
summary: "Brand a beer-dispenser startup from Kickstarter through an international tour."
tags:
  - brand
card:
  kind: picture                # picture | video
  poster: /images/projects/synek-story-poster.jpg
  webp: /images/projects/synek-story.webp
  alt: ""
order: 30                      # work rail sort
---

Long-form Markdown or MDX body starts here…
```

**Home page:** An 11ty template loops `collections.projects` sorted by `order` and emits the same `work-card` markup you have now—so you never hand-duplicate card + project URL again.

**URLs:** Prefer `projects/<slug>/index.html` (clean `…/synek-launch/`) or keep flat `projects/<slug>.html` via `permalink`—match whatever you want for links and hosting.

---

## 4. Migration phases (low risk)

| Phase | What you do | Risk |
|-------|----------------|------|
| **0** | Add `package.json`, `eleventy.config.*`, `src/` (or `content/`), `.gitignore` (`node_modules`, `_site` or `dist`) | None until you switch deploy |
| **1** | Recreate **one** case study (e.g. SYNEK) as Markdown + `project-page` layout; **match** current CSS classes | Low |
| **2** | Point the home **work card** for that project at the new URL; redirect old HTML if slug changes | SEO/bookmarks |
| **3** | Move remaining `projects/*.html` into collections | Medium (batch work) |
| **4** | Optional: move `index.html`, `about.html`, etc. into 11ty layouts + includes | Higher (touch global layout) |
| **5** | Plug in **Tina / Decap / Sanity** once the schema is stable | Ongoing schema tweaks |

Deploy: build to `_site/` (or `dist/`) and point **Netlify / Cloudflare Pages / GitHub Pages** at that folder. Keep `images/` as **passthrough** so paths stay stable.

---

## 5. CMS pairing (concrete)

### Option A — **TinaCMS** + Markdown (good “visual-ish” + Git)

- Local or hosted **Tina Admin** edits front matter and body.  
- Visual editing for Markdown is solid; block fields possible later.  
- [https://tina.io/](https://tina.io/)

### Option B — **Decap CMS** + Markdown (simplest admin UI)

- YAML config, `/admin` route, commits via GitHub OAuth.  
- Less “page builder,” more form + optional preview.  
- [https://decapcms.org/](https://decapcms.org/)

### Option C — **Sanity** + 11ty data file

- Studio defines `project`, `mediaBlock`, `gallery`, etc.  
- Build step runs `sanity dataset export` or uses `@sanity/client` in an 11ty **global data** file to pull JSON at build time.  
- Best when case studies are **highly structured** and you want asset pipelines.  
- [https://www.sanity.io/](https://www.sanity.io/)

### Option D — **Storyblok**

- Strong if non-devs edit; may be heavier than you need for a personal site.  
- [https://www.storyblok.com/](https://www.storyblok.com/)

---

## 6. Things to decide up front

1. **Permalinks:** Keep `projects/foo.html` or move to `projects/foo/`?  
2. **MDX vs Markdown:** MDX only if you need React components inside posts (adds complexity).  
3. **Images:** Keep paths under `images/projects/` with passthrough, or move to CMS-hosted URLs (Sanity/Storyblok).  
4. **Preview:** Tina/Decap often need a **deploy preview** URL for OAuth; local-only editing is simpler with plain Markdown first.

---

## 7. Minimal commands (when you init the repo)

```bash
npm init -y
npm install @11ty/eleventy --save-dev
```

Then add `eleventy.config.cjs` with `dir.input`, `dir.output`, and `addPassthroughCopy` for `images`, `fonts`, and your existing `*.js` unless you later bundle them.

*(Exact config should match the folder layout you choose; avoid writing HTML output into the same tree as unbuilt sources without a clear `src/` vs `_site/` split.)*

---

## 8. Summary recommendation

1. **Start with 11ty + Markdown + one shared `project-page` layout**—immediate win, no CMS yet.  
2. Add **Tina** or **Decap** when you miss a **browser** editor.  
3. Consider **Sanity** if you outgrow Markdown and want **reusable modules** and a real asset library.

This keeps the **public site static** while making **writing** the long pole faster—and aligns with the scope doc’s “trustworthy project URLs” and SYNEK slug cleanup.
