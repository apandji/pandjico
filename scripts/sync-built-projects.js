/**
 * After `eleventy` writes `_site/projects/*.html` from Markdown, copy those files back
 * to `projects/` so GitHub Pages (repo-root deploy) serves the authored case HTML.
 *
 * Listed slugs match `content/projects/*.md`.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SLUGS = ["synek-launch", "sensory-language", "adaptive-interfaces"];

function copyIfExists(slug) {
    const src = path.join(ROOT, "_site", "projects", `${slug}.html`);
    const dest = path.join(ROOT, "projects", `${slug}.html`);
    if (!fs.existsSync(src)) {
        console.warn(`sync-built-projects: skip ${slug} (${src} missing — run npm run eleventy first)`);
        return;
    }
    fs.copyFileSync(src, dest);
    console.log(`sync-built-projects: ${slug}.html`);
}

SLUGS.forEach(copyIfExists);
