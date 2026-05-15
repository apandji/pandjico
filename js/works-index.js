(function () {
    "use strict";

    const main = document.getElementById("main");
    const tagContainer = document.getElementById("works-tag-container");
    const live = document.getElementById("works-live");
    const clearBtn = document.getElementById("works-clear-tags");
    const titleEl = document.getElementById("works-dynamic-title");
    const sortTimelineBtn = document.getElementById("works-sort-timeline");
    const sortTitleBtn = document.getElementById("works-sort-title");
    const sortTimelineLabel = document.getElementById("works-sort-timeline-label");
    const sortTitleLabel = document.getElementById("works-sort-title-label");
    const sortTimelineTip = document.getElementById("works-sort-timeline-tip");
    const sortTitleTip = document.getElementById("works-sort-title-tip");
    const viewMasonryBtn = document.getElementById("works-view-masonry");
    const viewListBtn = document.getElementById("works-view-list");

    /** Rotating lines for the home tooltip typewriter — edit the list anytime. */
    const HOME_TIP_PHRASES = [
        "country roads...",
        "back home",
        "/index.html",
        "take me home",
        "where it began",
        "the front door",
        "east or west...",
        "there's no place like …",
        "hello, again",
        "root, sweet root",
        "origin story",
        "begin again",
        "~/ but online",
    ];
    const HOME_TIP_CHAR_MS = 38;

    const homeLink = document.querySelector(".works-page .works-toolbar__home-mark");
    const homeTipTextEl = document.querySelector(".works-page .works-home-tip__text");
    const homeTipCaretEl = document.querySelector(".works-page .works-home-tip__caret");

    if (!main || !tagContainer) return;

    if (homeLink && homeTipTextEl && homeTipCaretEl) {
        let homePhraseIndex = 0;
        let homeTipSession = 0;
        let homeTipEngaged = false;
        let homeTipTickId = 0;
        let homeTipLeaveId = 0;

        function homeTipReducedMotion() {
            try {
                return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            } catch {
                return false;
            }
        }

        function clearHomeTipTimers() {
            window.clearTimeout(homeTipTickId);
            homeTipTickId = 0;
        }

        function clearHomeTipLeaveTimer() {
            if (homeTipLeaveId) {
                window.clearTimeout(homeTipLeaveId);
                homeTipLeaveId = 0;
            }
        }

        function releaseHomeTip() {
            homeTipEngaged = false;
            homeTipSession += 1;
            clearHomeTipTimers();
            clearHomeTipLeaveTimer();
            homeTipTextEl.textContent = "";
            homeTipCaretEl.classList.remove("sky-cursor-type__caret--done");
        }

        function scheduleReleaseHomeTip() {
            clearHomeTipLeaveTimer();
            homeTipLeaveId = window.setTimeout(() => {
                homeTipLeaveId = 0;
                if (homeLink !== document.activeElement) releaseHomeTip();
            }, 140);
        }

        function startHomeTip() {
            clearHomeTipLeaveTimer();
            if (homeTipEngaged) return;
            const list = HOME_TIP_PHRASES;
            if (!list.length) return;
            homeTipEngaged = true;

            homeTipSession += 1;
            const session = homeTipSession;

            clearHomeTipTimers();
            homeTipTextEl.textContent = "";
            homeTipCaretEl.classList.remove("sky-cursor-type__caret--done");

            const phrase = list[homePhraseIndex % list.length];
            homePhraseIndex = (homePhraseIndex + 1) % list.length;

            if (homeTipReducedMotion()) {
                homeTipTextEl.textContent = phrase;
                homeTipCaretEl.classList.add("sky-cursor-type__caret--done");
                return;
            }

            let i = 0;
            function typeStep() {
                if (session !== homeTipSession) return;
                if (i >= phrase.length) {
                    homeTipCaretEl.classList.add("sky-cursor-type__caret--done");
                    return;
                }
                homeTipTextEl.textContent = phrase.slice(0, ++i);
                homeTipTickId = window.setTimeout(typeStep, HOME_TIP_CHAR_MS);
            }
            homeTipTickId = window.setTimeout(typeStep, 80);
        }

        homeLink.addEventListener("pointerenter", () => {
            clearHomeTipLeaveTimer();
            startHomeTip();
        });
        homeLink.addEventListener("pointerleave", () => {
            if (homeLink !== document.activeElement) scheduleReleaseHomeTip();
        });
        homeLink.addEventListener("focus", startHomeTip);
        homeLink.addEventListener("blur", releaseHomeTip);
    }

    /** @type {{ slug: string, title: string, tags: string[], collection: string, draft?: boolean, year?: string, thumb?: string, href?: string, desc?: string }[]} */
    let projects = [];
    /** @type {Set<string>} */
    let selectedTags = new Set();
    let sortMode = "timeline";
    /** @type {boolean} true = newest year first (NOW→PAST) */
    /** false = oldest first (PAST→NOW), default */
    let timelineNewestFirst = false;
    /** @type {boolean} true = A→Z */
    let titleAscending = true;
    let viewMode = "masonry";
    /** @type {string} normalized collection slug from URL, or "" */
    let currentCollection = "";

    function normalizeTag(t) {
        return String(t || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function normalizeCollection(c) {
        return String(c || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function knownCollectionsSet() {
        const s = new Set();
        for (const p of projects) {
            const c = normalizeCollection(p.collection);
            if (c) s.add(c);
        }
        return s;
    }

    function readUrl() {
        const params = new URLSearchParams(window.location.search);
        const tagsParam = params.get("tags");
        selectedTags = new Set();
        if (tagsParam) {
            for (const part of tagsParam.split(",")) {
                const t = normalizeTag(part);
                if (t) selectedTags.add(t);
            }
        }
        sortMode = params.get("sort") === "title" ? "title" : "timeline";
        if (sortMode === "title") {
            titleAscending = params.get("alphaOrder") !== "za";
        } else {
            timelineNewestFirst = params.get("yearOrder") === "new";
        }
        viewMode = params.get("view") === "list" ? "list" : "masonry";
        const col = normalizeCollection(params.get("collection") || "");
        const known = knownCollectionsSet();
        currentCollection = col && known.has(col) ? col : "";
    }

    function writeUrl() {
        const params = new URLSearchParams();
        if (selectedTags.size) {
            const sorted = Array.from(selectedTags).sort();
            params.set("tags", sorted.join(","));
        }
        if (sortMode === "title") {
            params.set("sort", "title");
            if (!titleAscending) params.set("alphaOrder", "za");
        } else {
            if (timelineNewestFirst) params.set("yearOrder", "new");
        }
        if (viewMode === "list") params.set("view", "list");
        if (currentCollection) params.set("collection", currentCollection);
        const qs = params.toString();
        const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        window.history.replaceState({}, "", url);
    }

    function collectionDisplayName(slug) {
        if (!slug) return "";
        return slug
            .split("-")
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    }

    function updateTitle() {
        if (!titleEl) return;
        let text = "works : all";
        if (currentCollection) {
            text = `works : ${collectionDisplayName(currentCollection)}`;
        } else if (selectedTags.size) {
            const sorted = Array.from(selectedTags).sort();
            text = `works : ${sorted.join(", ")}`;
        }
        titleEl.textContent = text;
        const docTitle =
            currentCollection || selectedTags.size
                ? `${text} — Andrew Pandji`
                : "works — Andrew Pandji";
        if (document.title !== docTitle) document.title = docTitle;
    }

    function announce(msg) {
        if (live) live.textContent = msg;
    }

    function allTags() {
        const s = new Set();
        for (const p of projects) {
            for (const t of p.tags || []) s.add(normalizeTag(t));
        }
        return Array.from(s).sort();
    }

    function filteredProjects() {
        return projects.filter((p) => {
            const tags = (p.tags || []).map(normalizeTag);
            const col = normalizeCollection(p.collection);
            const tagOk =
                selectedTags.size === 0 ||
                tags.some((t) => selectedTags.has(t));
            const colOk = !currentCollection || col === currentCollection;
            return tagOk && colOk;
        });
    }

    function sortedList(list) {
        const out = list.slice();
        if (sortMode === "title") {
            const cmp = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
            out.sort((a, b) => (titleAscending ? cmp(a, b) : cmp(b, a)));
        } else {
            out.sort((a, b) => {
                const ya = parseInt(String(a.year || "0"), 10) || 0;
                const yb = parseInt(String(b.year || "0"), 10) || 0;
                let yd;
                if (timelineNewestFirst) {
                    yd = yb - ya;
                } else {
                    yd = ya - yb;
                }
                if (yd !== 0) return yd;
                return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
            });
        }
        return out;
    }

    function syncToolbarFromState() {
        if (sortTimelineLabel) {
            sortTimelineLabel.textContent = timelineNewestFirst ? "NOW→PAST" : "PAST→NOW";
        }
        if (sortTitleLabel) {
            sortTitleLabel.textContent = titleAscending ? "A→Z" : "Z→A";
        }
        if (sortTimelineBtn) {
            sortTimelineBtn.setAttribute("aria-pressed", sortMode === "timeline" ? "true" : "false");
            sortTimelineBtn.setAttribute(
                "aria-label",
                timelineNewestFirst
                    ? "Sort by time: newest first. Click to switch to oldest first."
                    : "Sort by time: oldest first. Click to switch to newest first."
            );
        }
        if (sortTitleBtn) {
            sortTitleBtn.setAttribute("aria-pressed", sortMode === "title" ? "true" : "false");
            sortTitleBtn.setAttribute(
                "aria-label",
                titleAscending
                    ? "Sort by title: A to Z. Click to switch to Z to A."
                    : "Sort by title: Z to A. Click to switch to A to Z."
            );
        }
        if (sortTimelineTip) {
            sortTimelineTip.textContent = timelineNewestFirst
                ? "Newest first — click for oldest first"
                : "Oldest first — click for newest first";
        }
        if (sortTitleTip) {
            sortTitleTip.textContent = titleAscending
                ? "A–Z — click for Z–A"
                : "Z–A — click for A–Z";
        }
        if (viewMasonryBtn) {
            viewMasonryBtn.setAttribute("aria-pressed", viewMode === "masonry" ? "true" : "false");
        }
        if (viewListBtn) {
            viewListBtn.setAttribute("aria-pressed", viewMode === "list" ? "true" : "false");
        }
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    /** Safe fragment for `view-transition-name` (custom ident). */
    function viewTransitionSlug(slug) {
        const raw = String(slug || "work")
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "-")
            .replace(/^-+|-+$/g, "");
        const core = raw.length ? raw : "work";
        return /^[a-z_]/.test(core) ? core : `w-${core}`;
    }

    let masonryFxAbort = null;

    /**
     * Same-origin project navigations: optional View Transitions API (no extra dependency).
     * Skips when click was modified, defaultPrevented (e.g. touch “peek” first tap), or unsupported.
     */
    function bindMasonryNavTransitions(grid, signal) {
        if (!grid) return;
        grid.addEventListener(
            "click",
            (e) => {
                const link = e.target && e.target.closest && e.target.closest("a.work-card");
                if (!link || !grid.contains(link)) return;
                if (e.defaultPrevented || e.button !== 0) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (typeof document.startViewTransition !== "function") return;
                let dest;
                try {
                    dest = new URL(link.getAttribute("href") || "", window.location.href);
                } catch {
                    return;
                }
                if (dest.origin !== window.location.origin) return;
                if (dest.pathname === window.location.pathname && dest.search === window.location.search) return;
                e.preventDefault();
                const href = dest.href;
                document.startViewTransition(() => {
                    window.location.assign(href);
                });
            },
            { signal }
        );
    }

    function slugFromHref(href) {
        const base = String(href || "")
            .split("/")
            .pop()
            .replace(/^\s+|\s+$/g, "");
        return base.replace(/\.html?$/i, "").replace(/\s+/g, "-").toLowerCase();
    }

    function thumbFromMedia(media) {
        if (!media || typeof media !== "object") return "";
        const t = media.poster || media.webp || media.jpg || "";
        return String(t || "");
    }

    function renderTags() {
        tagContainer.innerHTML = "";
        const tags = allTags();
        for (const tag of tags) {
            const id = `works-tag-${tag}`;
            const label = document.createElement("label");
            label.className = "works-tag-chip";
            label.htmlFor = id;
            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "visually-hidden";
            input.id = id;
            input.value = tag;
            input.checked = selectedTags.has(tag);
            input.addEventListener("change", () => {
                if (input.checked) selectedTags.add(tag);
                else selectedTags.delete(tag);
                writeUrl();
                render();
                announce(
                    selectedTags.size
                        ? `Filtered to tags: ${Array.from(selectedTags).sort().join(", ")}`
                        : "Showing all tags"
                );
            });
            const span = document.createElement("span");
            span.className = "works-tag-chip__text";
            span.textContent = tag;
            label.appendChild(input);
            label.appendChild(span);
            tagContainer.appendChild(label);
        }
    }

    function clearFilters() {
        selectedTags.clear();
        currentCollection = "";
        writeUrl();
        renderTags();
        render();
        syncToolbarFromState();
        announce("Filters cleared");
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", clearFilters);
    }

    if (sortTimelineBtn) {
        sortTimelineBtn.addEventListener("click", () => {
            timelineNewestFirst = !timelineNewestFirst;
            sortMode = "timeline";
            writeUrl();
            syncToolbarFromState();
            render();
            announce(timelineNewestFirst ? "Newest first" : "Oldest first");
        });
    }

    if (sortTitleBtn) {
        sortTitleBtn.addEventListener("click", () => {
            titleAscending = !titleAscending;
            sortMode = "title";
            writeUrl();
            syncToolbarFromState();
            render();
            announce(titleAscending ? "Title A to Z" : "Title Z to A");
        });
    }

    if (viewMasonryBtn) {
        viewMasonryBtn.addEventListener("click", () => {
            if (viewMode === "masonry") return;
            viewMode = "masonry";
            writeUrl();
            syncToolbarFromState();
            render();
            announce("Mosaic view");
        });
    }

    if (viewListBtn) {
        viewListBtn.addEventListener("click", () => {
            if (viewMode === "list") return;
            viewMode = "list";
            writeUrl();
            syncToolbarFromState();
            render();
            announce("List view");
        });
    }

    function buildCard(p) {
        const isDraft = Boolean(p.draft);
        const href = p.href || "#";
        const thumb = p.thumb || "";
        const year = p.year ? String(p.year) : "";
        const desc = (p.desc && String(p.desc).trim()) || "";
        const tags = (p.tags || []).map(normalizeTag);
        const tagLis = tags.map((t) => `<li class="work-card__tag">${escapeHtml(t)}</li>`).join("");
        const draftClass = isDraft ? " work-card--draft" : "";
        const draftBadge = isDraft
            ? '<span class="work-card__draft-badge" aria-hidden="true">In progress</span>'
            : "";
        const draftSuffix = isDraft ? " (in progress)" : "";
        const aria = escapeHtml(`${p.title}${draftSuffix}${year ? `, ${year}` : ""}`);
        const vt = viewTransitionSlug(p.slug);
        const vtStyleAttr = escapeHtml(`view-transition-name: work-${vt}`);
        const summaryBlock = desc
            ? `<p class="work-card__desc work-card__desc--summary">${escapeHtml(desc)}</p>`
            : "";
        const yearLine = year
            ? `<p class="work-card__desc work-card__desc--year">${escapeHtml(year)}</p>`
            : "";

        return `
<a class="work-card${draftClass}" data-work-slug="${escapeHtml(p.slug)}" href="${escapeHtml(
            href
        )}" aria-label="${aria}" style="${vtStyleAttr}">
  <figure class="work-card__figure">
    ${thumb ? `<img class="work-card__img" src="${escapeHtml(thumb)}" alt="" loading="lazy" decoding="async" />` : ""}
  </figure>
  <div class="work-card__overlay" aria-hidden="true">
    <span class="work-card__title">${escapeHtml(p.title)}${draftBadge}</span>
    ${summaryBlock}
    ${yearLine}
    <ul class="work-card__tags">${tagLis}</ul>
    <p class="work-card__hint">Tap again to open</p>
  </div>
</a>`;
    }

    function buildListItem(p) {
        const isDraft = Boolean(p.draft);
        const href = p.href || "#";
        const year = p.year ? String(p.year) : "";
        const tags = (p.tags || []).map(normalizeTag);
        const tagSpans = tags
            .map((t) => `<span class="work-card__tag">${escapeHtml(t)}</span>`)
            .join("");
        const draftSuffix = isDraft ? " <span class=\"works-list__draft\">(in progress)</span>" : "";
        const aria = escapeHtml(`${p.title}${isDraft ? " (in progress)" : ""}${year ? `, ${year}` : ""}`);
        const itemClass = isDraft ? " works-list__item--draft" : "";

        return `
<li class="works-list__item${itemClass}">
  <a class="works-list__link" href="${escapeHtml(href)}" aria-label="${aria}">
    <span class="works-list__year">${escapeHtml(year)}</span>
    <span class="works-list__title">${escapeHtml(p.title)}${draftSuffix}</span>
    <span class="works-list__meta works-list__tags">${tagSpans}</span>
  </a>
</li>`;
    }

    function render() {
        const list = sortedList(filteredProjects());
        main.dataset.worksLayout = viewMode === "list" ? "list" : "masonry";

        if (masonryFxAbort) {
            masonryFxAbort.abort();
            masonryFxAbort = null;
        }
        let fxSignal = null;
        if (viewMode === "masonry") {
            masonryFxAbort = new AbortController();
            fxSignal = masonryFxAbort.signal;
        }

        if (viewMode === "list") {
            const items = list.map(buildListItem).join("");
            main.innerHTML = `
<section class="works-list-wrap" aria-label="Projects as list">
  <ul class="works-list">${items}</ul>
</section>`;
        } else {
            const cards = list.map(buildCard).join("");
            main.innerHTML = `<div class="works-masonry" data-works-layout="masonry">${cards}</div>`;
            bindMasonryNavTransitions(main.querySelector(".works-masonry"), fxSignal);
        }

        if (list.length === 0) {
            main.insertAdjacentHTML(
                "beforeend",
                `<p class="works-empty" role="status">No projects match these filters.</p>`
            );
        }

        updateTitle();
        writeUrl();
    }

    fetch("projects.json")
        .then((r) => {
            if (!r.ok) throw new Error(String(r.status));
            return r.json();
        })
        .then((data) => {
            const raw = Array.isArray(data) ? data : data.projects || [];
            projects = raw.map((p) => {
                const href = p.href != null ? String(p.href) : "";
                const slug = String(p.slug || "").trim() || slugFromHref(href);
                const thumb =
                    p.thumb != null && String(p.thumb).trim()
                        ? String(p.thumb)
                        : thumbFromMedia(p.media);
                return {
                    slug,
                    title: String(p.title || slug || "Untitled"),
                    tags: Array.isArray(p.tags) ? p.tags.map(normalizeTag) : [],
                    collection: p.collection != null ? String(p.collection) : "",
                    draft: Boolean(p.draft),
                    year: p.year != null ? String(p.year) : "",
                    thumb,
                    href,
                    desc: p.desc != null ? String(p.desc) : "",
                };
            });
            readUrl();
            syncToolbarFromState();
            renderTags();
            render();
            announce(`Loaded ${projects.length} projects`);
        })
        .catch(() => {
            main.innerHTML =
                '<p class="works-empty" role="alert">Could not load projects. Try again later.</p>';
        });

    window.addEventListener("popstate", () => {
        readUrl();
        syncToolbarFromState();
        renderTags();
        render();
    });
})();
