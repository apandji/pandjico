/**
 * Subtle cursor-linked texture on `.hero-panel::before` only (fine pointer, motion OK).
 * Scene color stays time-led (adapt-hero.js); pointer moves wash position, grain offset, and wash L a few points.
 *
 * Radial `at X% Y%` is relative to the hero panel — map the cursor into that box (not raw viewport %).
 * Atmosphere is hero-only (grain + radial on the panel, not the work rail).
 */
(function () {
    var root = document.documentElement;
    var reduce = false;
    var fine = false;
    try {
        reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        fine = window.matchMedia("(pointer: fine)").matches;
    } catch (e) {
        return;
    }
    if (reduce || !fine) {
        return;
    }

    var heroPanel = document.querySelector(".hero-panel");

    var pending = false;
    var lx = -1;
    var ly = -1;
    var EPS = 1.25;

    function localPercent(el, clientX, clientY) {
        if (!el) {
            return { x: 50, y: 45 };
        }
        var r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) {
            return { x: 50, y: 45 };
        }
        var x = ((clientX - r.left) / r.width) * 100;
        var y = ((clientY - r.top) / r.height) * 100;
        return {
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        };
    }

    function apply(clientX, clientY) {
        var vw = window.innerWidth || 1;
        var vh = window.innerHeight || 1;
        var h = localPercent(heroPanel, clientX, clientY);
        root.style.setProperty("--cursor-atmo-x-hero", h.x.toFixed(2) + "%");
        root.style.setProperty("--cursor-atmo-y-hero", h.y.toFixed(2) + "%");
        /* Sub-pixel parallax for grain tile — small coefficients, no layout reads. */
        root.style.setProperty("--cursor-atmo-gx", Math.round(-clientX * 0.06) + "px");
        root.style.setProperty("--cursor-atmo-gy", Math.round(-clientY * 0.06) + "px");
        var nx = clientX / vw - 0.5;
        var ny = clientY / vh - 0.5;
        var lShift = (nx * 0.42 + ny * 0.58) * 9;
        if (lShift > 4.5) {
            lShift = 4.5;
        } else if (lShift < -4.5) {
            lShift = -4.5;
        }
        root.style.setProperty("--cursor-atmo-l-shift", lShift.toFixed(2) + "%");
    }

    function onFrame() {
        pending = false;
        apply(lx, ly);
    }

    function onPointerMove(e) {
        if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
            return;
        }
        var x = e.clientX;
        var y = e.clientY;
        if (lx >= 0 && Math.abs(x - lx) < EPS && Math.abs(y - ly) < EPS) {
            return;
        }
        lx = x;
        ly = y;
        if (!pending) {
            pending = true;
            window.requestAnimationFrame(onFrame);
        }
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });

    window.addEventListener(
        "resize",
        function () {
            if (lx >= 0 && ly >= 0) {
                apply(lx, ly);
            }
        },
        { passive: true },
    );

    window.requestAnimationFrame(function () {
        var vw = window.innerWidth || 1;
        var vh = window.innerHeight || 1;
        apply(vw * 0.48, vh * 0.38);
    });
})();
