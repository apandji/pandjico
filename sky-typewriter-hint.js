/**
 * First visit this session: typewriter line near the cursor (fallback if no pointer yet).
 */
(function () {
    var SESSION_KEY = "pandjiSkyAdaptiveHintDismissed";
    var FULL = "the colors of the site follow the rhythms of the day";
    var OFF_X = 14;
    var OFF_Y = 20;
    var PAD = 12;
    var CHAR_MS = 40;
    var HOLD_MS = 2200;
    var FALLBACK_MS = 900;
    var FADE_MS = 420;

    try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
            return;
        }
    } catch (err) {
        /* ignore */
    }

    var reduceMotion = false;
    try {
        reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (err) {
        /* ignore */
    }

    var el = document.createElement("p");
    el.className = "sky-cursor-type sky-cursor-type--intro sky-ui-chip";
    el.setAttribute("aria-live", "polite");
    el.setAttribute("role", "status");

    var inner = document.createElement("span");
    inner.className = "sky-cursor-type__text";
    var caret = document.createElement("span");
    caret.className = "sky-cursor-type__caret";
    caret.setAttribute("aria-hidden", "true");

    el.appendChild(inner);
    el.appendChild(caret);
    document.body.appendChild(el);

    var cx = (window.innerWidth || 640) * 0.48;
    var cy = (window.innerHeight || 480) * 0.4;
    var typing = false;
    var tickId = 0;
    var holdId = 0;
    var i = 0;

    function clamp(n, lo, hi) {
        return Math.max(lo, Math.min(hi, n));
    }

    function place() {
        var vw = window.innerWidth || 0;
        var vh = window.innerHeight || 0;
        if (vw < 8 || vh < 8) {
            return;
        }
        var w = el.offsetWidth || 200;
        var h = el.offsetHeight || 32;
        var left = clamp(cx + OFF_X, PAD, vw - w - PAD);
        var top = clamp(cy + OFF_Y, PAD, vh - h - PAD);
        el.style.left = left + "px";
        el.style.top = top + "px";
    }

    function markDone() {
        window.clearTimeout(tickId);
        window.clearTimeout(holdId);
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch (err) {
            /* ignore */
        }
        el.classList.remove("sky-cursor-type--visible");
        el.classList.add("sky-cursor-type--out");
        window.removeEventListener("pointermove", onPointerMove, { passive: true });
        window.removeEventListener("resize", place);
        window.setTimeout(function () {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, FADE_MS + 60);
    }

    function typeStep() {
        if (i >= FULL.length) {
            caret.classList.add("sky-cursor-type__caret--done");
            holdId = window.setTimeout(markDone, HOLD_MS);
            return;
        }
        inner.textContent = FULL.slice(0, ++i);
        place();
        tickId = window.setTimeout(typeStep, CHAR_MS);
    }

    function typeBegin() {
        if (typing) {
            return;
        }
        typing = true;
        el.classList.add("sky-cursor-type--visible");
        place();
        if (reduceMotion) {
            inner.textContent = FULL;
            place();
            caret.classList.add("sky-cursor-type__caret--done");
            holdId = window.setTimeout(markDone, Math.min(HOLD_MS, 1400));
            return;
        }
        tickId = window.setTimeout(typeStep, 120);
    }

    function onPointerMove(e) {
        cx = e.clientX;
        cy = e.clientY;
        if (!kickStarted) {
            kickStarted = true;
            window.clearTimeout(beginFallback);
            typeBegin();
        } else if (typing) {
            place();
        }
    }

    var kickStarted = false;
    var beginFallback = window.setTimeout(function () {
        if (!kickStarted) {
            kickStarted = true;
            typeBegin();
        }
    }, FALLBACK_MS);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", place);

    window.requestAnimationFrame(function () {
        window.requestAnimationFrame(place);
    });
})();
