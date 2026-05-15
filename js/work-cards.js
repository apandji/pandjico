/**
 * Touch / coarse pointers: cards navigate on first tap (station + mobile-spec).
 * Overlay copy stays visible on narrow viewports via CSS.
 */

/**
 * Work rail scroll “attention”: primary card near viewport center, soft scale, blur on siblings.
 * Skips the all-works `.works-masonry` gallery (transforms break layout). Home: `[data-works-layout]` without `.works-masonry`, or legacy `.work-rail`.
 * Mounts scroll listeners on first non-empty rail; listens for `work-rail-updated` to attach after JS render.
 */
(function () {
    var reduceMotion = false;
    try {
        reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e0) {
        reduceMotion = false;
    }

    var root = document.documentElement;
    var smoothByEl = new WeakMap();
    var SMOOTH = reduceMotion ? 0.22 : 0.18;
    var BLUR_CAP = reduceMotion ? 1.5 : 3.25;
    var EPS = 0.01;
    var rafId = null;
    var scrollCoalesceRaf = null;
    var scrollListenersMounted = false;
    var lastActiveIdx = -1;

    function getCardsArray() {
        var host = document.querySelector('[data-works-layout="masonry"]');
        /* All-works gallery: `.works-masonry` + scroll-attention transforms breaks multicol/grid packing. */
        if (host && host.querySelector(".works-masonry")) {
            return [];
        }
        if (host) {
            return Array.prototype.slice.call(host.querySelectorAll(".work-card"));
        }
        var rail = document.querySelector(".work-rail");
        if (!rail) {
            return [];
        }
        return Array.prototype.slice.call(rail.querySelectorAll(".work-card"));
    }

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

    function attentionCenterY(vh) {
        try {
            if (window.matchMedia("(max-width: 820px)").matches) {
                return vh * 0.36;
            }
        } catch (eMq) {
            /* ignore */
        }
        return vh * 0.5;
    }

    function offsetTopInRail(el, rail) {
        var top = 0;
        var node = el;
        while (node && node !== rail) {
            top += node.offsetTop;
            node = node.offsetParent;
        }
        return top;
    }

    /** Layout-stable card boxes (ignore per-card scale/transform so focus doesn’t oscillate). */
    function layoutRectsForCards(cards, rail) {
        var railRect = rail.getBoundingClientRect();
        var railTop = railRect.top;
        var out = new Array(cards.length);
        var i;
        var el;
        var h;
        var top;
        var bottom;
        for (i = 0; i < cards.length; i++) {
            el = cards[i];
            h = el.offsetHeight || 1;
            top = railTop + offsetTopInRail(el, rail);
            bottom = top + h;
            out[i] = { top: top, bottom: bottom, height: h };
        }
        return out;
    }

    function pickActiveIndex(cards, vh, rects) {
        var vc = attentionCenterY(vh);
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

    function targetsForIndex(cards, i, activeIdx, vh, focusScale, r) {
        var el = cards[i];
        var h = (r && r.height) || 1;
        var ov = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        var vis = clamp(ov / h, 0, 1);
        var vc = attentionCenterY(vh);
        var mid = (r.top + r.bottom) * 0.5;
        var dist = Math.abs(mid - vc);
        var sigma = vh * 0.4;
        var w = Math.exp(-(dist * dist) / (2 * sigma * sigma)) * (0.2 + 0.8 * vis);

        if (i === activeIdx) {
            return {
                sh: 0,
                sc: focusScale,
                op: 1,
                bl: 0,
                sat: 1,
            };
        }

        var pen = clamp(1 - w, 0, 1);
        var blurBase = 0.85 + pen * 2.4;
        var bl = Math.min(BLUR_CAP, blurBase);
        if (vis < 0.04 && pen < 0.2) {
            bl *= 0.5;
        }
        var opLo = reduceMotion ? 0.55 : 0.38;
        var opHi = reduceMotion ? 0.9 : 0.58;
        var opMid = reduceMotion ? 0.86 - 0.28 * pen : 0.6 - 0.28 * pen;
        return {
            sh: 0,
            sc: clamp(1 - pen * 0.045, 0.93, 1),
            op: clamp(opMid, opLo, opHi),
            bl: bl,
            sat: clamp(1 - pen * 0.18, 0.78, 1),
        };
    }

    function stepToward(cur, target, k) {
        return cur + (target - cur) * k;
    }

    function tick(instant) {
        var cards = getCardsArray();
        if (!cards.length) {
            return false;
        }
        ensureScrollListeners();
        var rail = cards[0].closest(".work-rail") || cards[0].parentElement;
        if (!rail) {
            return false;
        }
        var vh = window.innerHeight || 1;
        var focusScale = readFocusScale();
        var i;
        var rects = layoutRectsForCards(cards, rail);
        var activeIdx = pickActiveIndex(cards, vh, rects);
        var activeChanged = activeIdx !== lastActiveIdx;
        lastActiveIdx = activeIdx;
        var k = instant || activeChanged ? 1 : SMOOTH;
        var dirty = false;
        var el;
        var tgt;
        var sm;
        var d;

        for (i = 0; i < cards.length; i++) {
            el = cards[i];
            el.classList.toggle("work-card--scroll-active", i === activeIdx);
            el.tabIndex = i === activeIdx ? 0 : -1;

            tgt = targetsForIndex(cards, i, activeIdx, vh, focusScale, rects[i]);
            sm = smoothByEl.get(el);
            if (!sm || instant || activeChanged) {
                sm = { sh: tgt.sh, sc: tgt.sc, op: tgt.op, bl: tgt.bl, sat: tgt.sat };
                smoothByEl.set(el, sm);
            } else {
                sm.sh = stepToward(sm.sh, tgt.sh, k);
                sm.sc = stepToward(sm.sc, tgt.sc, k);
                sm.op = stepToward(sm.op, tgt.op, k);
                sm.bl = stepToward(sm.bl, tgt.bl, k);
                sm.sat = stepToward(sm.sat, tgt.sat, k);
            }

            var op = clamp(sm.op, 0.2, 1);
            el.style.setProperty("--card-scroll-shift", "0px");
            el.style.setProperty("--card-scroll-scale", sm.sc.toFixed(4));
            el.style.setProperty("--card-scroll-opacity", op.toFixed(3));
            el.style.setProperty("--card-scroll-blur", sm.bl.toFixed(2) + "px");
            el.style.setProperty("--card-scroll-sat", clamp(sm.sat, 0.62, 1).toFixed(3));
            el.style.opacity = String(op);
            el.style.transform = "translate3d(0, 0, 0) scale(" + sm.sc.toFixed(4) + ")";

            if (!instant && !activeChanged) {
                d = Math.max(
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
        lastActiveIdx = -1;
        tick(true);
        scheduleFollowUp();
    }

    function ensureScrollListeners() {
        if (scrollListenersMounted) {
            return;
        }
        if (!getCardsArray().length) {
            return;
        }
        scrollListenersMounted = true;
        root.setAttribute("data-work-card-attention", "1");
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResizeOrAttention);
        window.addEventListener("work-card-attention", onResizeOrAttention);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                onResizeOrAttention();
            }
        });
    }

    function boot() {
        ensureScrollListeners();
        tick(true);
        scheduleFollowUp();
    }

    document.addEventListener("work-rail-updated", function () {
        ensureScrollListeners();
        onResizeOrAttention();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
