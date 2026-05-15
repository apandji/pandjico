/**
 * Touch / coarse pointers: first tap opens the overlay; second tap follows href.
 * Hover-capable fine pointers: overlay opens on :focus-visible, scroll-primary card, or touch; cursor is the site circle (CSS + adapt-hero.js on `:root`).
 */
(function () {
    var mq = window.matchMedia("(hover: hover)");
    if (mq.matches) {
        return;
    }

    document.querySelectorAll(".work-card").forEach(function (card) {
        card.addEventListener("click", function (e) {
            if (card.classList.contains("is-touch-open")) {
                card.classList.remove("is-touch-open");
                try {
                    window.dispatchEvent(new CustomEvent("work-card-attention"));
                } catch (e) {
                    /* ignore */
                }
                return;
            }
            e.preventDefault();
            document.querySelectorAll(".work-card.is-touch-open").forEach(function (c) {
                c.classList.remove("is-touch-open");
            });
            card.classList.add("is-touch-open");
            try {
                window.dispatchEvent(new CustomEvent("work-card-attention"));
            } catch (e) {
                /* ignore */
            }
        });
    });

    document.addEventListener(
        "click",
        function (e) {
            var t = e.target;
            if (t && t.closest && !t.closest(".work-card")) {
                var hadOpen = document.querySelector(".work-card.is-touch-open");
                document.querySelectorAll(".work-card.is-touch-open").forEach(function (c) {
                    c.classList.remove("is-touch-open");
                });
                if (hadOpen) {
                    try {
                        window.dispatchEvent(new CustomEvent("work-card-attention"));
                    } catch (e2) {
                        /* ignore */
                    }
                }
            }
        },
        true,
    );

    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") {
            return;
        }
        document.querySelectorAll(".work-card.is-touch-open").forEach(function (c) {
            c.classList.remove("is-touch-open");
        });
        try {
            window.dispatchEvent(new CustomEvent("work-card-attention"));
        } catch (e3) {
            /* ignore */
        }
    });
})();

/**
 * Work rail scroll “attention”: one primary card (viewport-centered), soft scale, gentle blur /
 * desaturation on siblings, exponential smoothing. Only the active card is tabbable / pointer-targetable.
 * `prefers-reduced-motion: reduce` caps blur and keeps opacity closer to 1 (still shows a hint).
 */
(function () {
    var reduceMotion = false;
    try {
        reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e0) {
        reduceMotion = false;
    }

    var root = document.documentElement;
    var rail = document.querySelector(".work-rail");
    var cards = rail ? rail.querySelectorAll(".work-card") : null;
    if (!cards || !cards.length) {
        return;
    }

    root.setAttribute("data-work-card-attention", "1");

    var smoothByEl = new WeakMap();
    /* Slightly higher k = fewer frames to settle; coalesced scroll already cuts redundant work. */
    var SMOOTH = reduceMotion ? 0.22 : 0.16;
    var BLUR_CAP = reduceMotion ? 2.25 : 6.5;
    var EPS = 0.008;
    var rafId = null;
    var scrollCoalesceRaf = null;

    function clamp(x, a, b) {
        return Math.max(a, Math.min(b, x));
    }

    function readFocusScale() {
        try {
            var v = window.getComputedStyle(root).getPropertyValue("--work-card-focus-scale").trim();
            var n = parseFloat(v);
            if (!isNaN(n) && n >= 1 && n <= 1.15) {
                return n;
            }
        } catch (e1) {
            /* ignore */
        }
        return 1.045;
    }

    function pickActiveIndex(vh, rects) {
        var vc = vh * 0.5;
        var bestI = 0;
        var bestS = -1;
        var i;
        var el;
        var r;
        var h;
        var ov;
        var vis;
        var mid;
        var dist;
        var sigma;
        var g;
        var score;

        for (i = 0; i < cards.length; i++) {
            el = cards[i];
            if (el.classList.contains("is-touch-open")) {
                return i;
            }
            r = rects[i];
            if (!r) {
                continue;
            }
            h = r.height || 1;
            ov = Math.min(r.bottom, vh) - Math.max(r.top, 0);
            vis = clamp(ov / h, 0, 1);
            if (vis < 0.03) {
                continue;
            }
            mid = (r.top + r.bottom) * 0.5;
            dist = Math.abs(mid - vc);
            sigma = vh * 0.4;
            g = Math.exp(-(dist * dist) / (2 * sigma * sigma));
            score = g * (0.22 + 0.78 * vis);
            if (score > bestS) {
                bestS = score;
                bestI = i;
            }
        }
        return bestI;
    }

    function targetsForIndex(i, activeIdx, vh, focusScale, r) {
        var el = cards[i];
        var h = (r && r.height) || 1;
        var ov = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        var vis = clamp(ov / h, 0, 1);
        var vc = vh * 0.5;
        var mid = (r.top + r.bottom) * 0.5;
        var dist = Math.abs(mid - vc);
        var sigma = vh * 0.4;
        var w = Math.exp(-(dist * dist) / (2 * sigma * sigma)) * (0.2 + 0.8 * vis);

        if (el.classList.contains("is-touch-open")) {
            return { sh: 0, sc: 1, op: 1, bl: 0, sat: 1 };
        }

        if (i === activeIdx) {
            return {
                sh: clamp((mid - vc) * -0.045, -5, 5),
                sc: focusScale,
                op: 1,
                bl: 0,
                sat: 1,
            };
        }

        var pen = clamp(1 - w, 0, 1);
        var blurBase = 2.1 + pen * 6.5;
        var bl = Math.min(BLUR_CAP, blurBase);
        if (vis < 0.04 && pen < 0.2) {
            bl *= 0.5;
        }
        var opLo = reduceMotion ? 0.55 : 0.32;
        var opHi = reduceMotion ? 0.9 : 0.52;
        var opMid = reduceMotion ? 0.86 - 0.28 * pen : 0.54 - 0.4 * pen;
        return {
            sh: clamp((mid - vc) * -0.035, -4, 4),
            sc: clamp(1 - pen * 0.055, 0.91, 1),
            op: clamp(opMid, opLo, opHi),
            bl: bl,
            sat: clamp(1 - pen * 0.32, 0.62, 1),
        };
    }

    function stepToward(cur, target, k) {
        return cur + (target - cur) * k;
    }

    function tick(instant) {
        var vh = window.innerHeight || 1;
        var focusScale = readFocusScale();
        var i;
        var rects = new Array(cards.length);
        for (i = 0; i < cards.length; i++) {
            rects[i] = cards[i].getBoundingClientRect();
        }
        var activeIdx = pickActiveIndex(vh, rects);
        var k = instant ? 1 : SMOOTH;
        var dirty = false;
        var el;
        var tgt;
        var sm;
        var d;

        for (i = 0; i < cards.length; i++) {
            el = cards[i];
            el.classList.toggle("work-card--scroll-active", i === activeIdx);
            el.tabIndex = i === activeIdx ? 0 : -1;

            tgt = targetsForIndex(i, activeIdx, vh, focusScale, rects[i]);
            sm = smoothByEl.get(el);
            if (!sm || instant) {
                sm = { sh: tgt.sh, sc: tgt.sc, op: tgt.op, bl: tgt.bl, sat: tgt.sat };
                smoothByEl.set(el, sm);
            } else {
                sm.sh = stepToward(sm.sh, tgt.sh, k);
                sm.sc = stepToward(sm.sc, tgt.sc, k);
                sm.op = stepToward(sm.op, tgt.op, k);
                sm.bl = stepToward(sm.bl, tgt.bl, k);
                sm.sat = stepToward(sm.sat, tgt.sat, k);
            }

            var op = clamp(sm.op, 0.14, 1);
            el.style.setProperty("--card-scroll-shift", sm.sh.toFixed(2) + "px");
            el.style.setProperty("--card-scroll-scale", sm.sc.toFixed(4));
            el.style.setProperty("--card-scroll-opacity", op.toFixed(3));
            el.style.setProperty("--card-scroll-blur", sm.bl.toFixed(2) + "px");
            el.style.setProperty("--card-scroll-sat", clamp(sm.sat, 0.62, 1).toFixed(3));
            el.style.opacity = String(op);
            el.style.transform = "translate3d(" + sm.sh.toFixed(2) + "px, 0, 0) scale(" + sm.sc.toFixed(4) + ")";

            if (!instant) {
                d = Math.max(
                    Math.abs(tgt.sh - sm.sh),
                    Math.abs(tgt.sc - sm.sc),
                    Math.abs(tgt.op - sm.op),
                    Math.abs(tgt.bl - sm.bl),
                    Math.abs(tgt.sat - sm.sat),
                );
                if (d > EPS) {
                    dirty = true;
                }
            }
        }
        return dirty;
    }

    function scheduleFollowUp() {
        if (rafId != null) {
            return;
        }
        rafId = window.requestAnimationFrame(function () {
            rafId = null;
            if (tick(false)) {
                scheduleFollowUp();
            }
        });
    }

    /** One layout + tick per frame while the wheel fires; avoids N× getBoundingClientRect per scroll burst. */
    function onScroll() {
        if (scrollCoalesceRaf != null) {
            return;
        }
        scrollCoalesceRaf = window.requestAnimationFrame(function () {
            scrollCoalesceRaf = null;
            tick(false);
            scheduleFollowUp();
        });
    }

    function onResizeOrAttention() {
        if (scrollCoalesceRaf != null) {
            window.cancelAnimationFrame(scrollCoalesceRaf);
            scrollCoalesceRaf = null;
        }
        tick(true);
        scheduleFollowUp();
    }

    function mount() {
        tick(true);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResizeOrAttention);
        window.addEventListener("work-card-attention", onResizeOrAttention);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                onResizeOrAttention();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount);
    } else {
        mount();
    }
})();
