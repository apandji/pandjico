(function () {
    "use strict";

    const HOME_TIP_PHRASES = [
        "back to the front",
        "leave the station",
        "index",
        "where the work lives",
        "the front door",
        "home sky",
        "exit transmission",
        "tune out",
    ];
    const HOME_TIP_CHAR_MS = 38;
    const SECTION_BREAKPOINT = "(max-width: 899px)";

    const homeLink = document.querySelector(".station-toolbar .works-toolbar__home-mark");
    const homeTipTextEl = document.querySelector(".station-toolbar .works-home-tip__text");
    const homeTipCaretEl = document.querySelector(".station-toolbar .works-home-tip__caret");
    const sectionNav = document.querySelector(".station-toolbar__sections");
    const sectionLinks = sectionNav
        ? Array.from(sectionNav.querySelectorAll(".station-toolbar__jump"))
        : [];
    const sections = sectionLinks
        .map((link) => {
            const id = (link.getAttribute("href") || "").replace(/^#/, "");
            return id ? document.getElementById(id) : null;
        })
        .filter(Boolean);

    function homeTipReducedMotion() {
        try {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch {
            return false;
        }
    }

    if (homeLink && homeTipTextEl && homeTipCaretEl) {
        let homePhraseIndex = 0;
        let homeTipSession = 0;
        let homeTipEngaged = false;
        let homeTipTickId = 0;
        let homeTipLeaveId = 0;

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

    function setActiveSection(id) {
        for (const link of sectionLinks) {
            const href = (link.getAttribute("href") || "").replace(/^#/, "");
            if (href === id) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        }
    }

    function sectionNavEnabled() {
        try {
            return window.matchMedia(SECTION_BREAKPOINT).matches;
        } catch {
            return false;
        }
    }

    if (sectionLinks.length && sections.length) {
        for (const link of sectionLinks) {
            link.addEventListener("click", (event) => {
                const href = link.getAttribute("href");
                if (!href || href.charAt(0) !== "#") return;
                const target = document.getElementById(href.slice(1));
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveSection(target.id);
            });
        }

        let sectionObserver = null;

        function bindSectionObserver() {
            if (sectionObserver) {
                sectionObserver.disconnect();
                sectionObserver = null;
            }
            if (!sectionNavEnabled()) {
                for (const link of sectionLinks) {
                    link.removeAttribute("aria-current");
                }
                return;
            }
            sectionObserver = new IntersectionObserver(
                (entries) => {
                    const visible = entries
                        .filter((e) => e.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    if (visible.length && visible[0].target.id) {
                        setActiveSection(visible[0].target.id);
                    }
                },
                { root: null, rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.12, 0.35] },
            );
            for (const section of sections) {
                sectionObserver.observe(section);
            }
        }

        bindSectionObserver();
        try {
            window.matchMedia(SECTION_BREAKPOINT).addEventListener("change", bindSectionObserver);
        } catch {
            window.addEventListener("resize", bindSectionObserver);
        }
    }

    function refreshStationReadings() {
        if (!window.pandjiSky) {
            return;
        }
        if (typeof window.pandjiSky.updateStationReadings === "function") {
            window.pandjiSky.updateStationReadings();
        }
        if (typeof window.pandjiSky.updateStationDayBar === "function") {
            window.pandjiSky.updateStationDayBar();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", refreshStationReadings, { once: true });
    } else {
        refreshStationReadings();
    }
})();
