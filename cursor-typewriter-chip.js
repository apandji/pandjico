/**
 * Ephemeral cursor-adjacent typewriter chip (shared: initial hint + sky toggle feedback).
 * Assigns `window.showCursorTypewriterChip(text, clientX, clientY)`.
 */
(function () {
    var CHAR_MS = 38;
    var HOLD_MS = 2000;
    var FADE_MS = 400;
    var PAD = 12;
    var OFF_X = 14;
    var OFF_Y = 20;

    function clamp(n, lo, hi) {
        return Math.max(lo, Math.min(hi, n));
    }

    function reduceMotion() {
        try {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (e) {
            return false;
        }
    }

    window.showCursorTypewriterChip = function (fullText, clientX, clientY) {
        if (!fullText) {
            return;
        }
        var prev = document.querySelector(".sky-cursor-type.sky-cursor-type--ephemeral");
        if (prev && prev.parentNode) {
            prev.parentNode.removeChild(prev);
        }

        var cx =
            typeof clientX === "number" && !isNaN(clientX)
                ? clientX
                : (window.innerWidth || 640) * 0.48;
        var cy =
            typeof clientY === "number" && !isNaN(clientY)
                ? clientY
                : (window.innerHeight || 480) * 0.38;

        var el = document.createElement("p");
        el.className = "sky-cursor-type sky-cursor-type--ephemeral sky-ui-chip";
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

        var typing = false;
        var tickId = 0;
        var holdId = 0;
        var i = 0;
        var rm = reduceMotion();

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
            el.classList.remove("sky-cursor-type--visible");
            el.classList.add("sky-cursor-type--out");
            window.removeEventListener("resize", place);
            window.setTimeout(function () {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }, FADE_MS + 80);
        }

        function typeStep() {
            if (i >= fullText.length) {
                caret.classList.add("sky-cursor-type__caret--done");
                holdId = window.setTimeout(markDone, HOLD_MS);
                return;
            }
            inner.textContent = fullText.slice(0, ++i);
            place();
            tickId = window.setTimeout(typeStep, CHAR_MS);
        }

        function typeBegin() {
            typing = true;
            el.classList.add("sky-cursor-type--visible");
            place();
            if (rm) {
                inner.textContent = fullText;
                place();
                caret.classList.add("sky-cursor-type__caret--done");
                holdId = window.setTimeout(markDone, Math.min(HOLD_MS, 1400));
                return;
            }
            tickId = window.setTimeout(typeStep, 80);
        }

        window.addEventListener("resize", place);
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(typeBegin);
        });
    };
})();
