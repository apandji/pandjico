/**
 * Station day bar: hint, marker hover scale, structured tooltip, drag-to-scrub hour.
 */
(function () {
    "use strict";

    var bar = null;
    var track = null;
    var marker = null;
    var hint = null;
    var tip = null;
    var active = false;
    var dragging = false;

    function sky() {
        return window.pandjiSky || null;
    }

    function hourFromX(clientX) {
        if (!track) {
            return 0;
        }
        var r = track.getBoundingClientRect();
        if (r.width < 1) {
            return 0;
        }
        var x = (clientX - r.left) / r.width;
        return Math.max(0, Math.min(24, x * 24));
    }

    function setActive(on) {
        active = on;
        if (bar) {
            if (on) {
                bar.dataset.active = "true";
            } else {
                delete bar.dataset.active;
            }
        }
    }

    var lastTipPct = 0;
    var resizeBound = false;

    function readContentInsets() {
        var root = document.documentElement;
        var cs = getComputedStyle(root);
        return {
            left: parseFloat(cs.getPropertyValue("--content-inset-l")) || 16,
            right: parseFloat(cs.getPropertyValue("--content-inset-r")) || 16,
        };
    }

    function tipClampBounds() {
        var pad = 6;
        var insets = readContentInsets();
        var tr = track.getBoundingClientRect();
        var minLeft = Math.max(tr.left + pad, insets.left + pad);
        var maxRight = Math.min(tr.right - pad, window.innerWidth - insets.right - pad);
        return { minLeft: minLeft, maxRight: maxRight, tr: tr, span: Math.max(0, maxRight - minLeft) };
    }

    function syncTipAlign(pct) {
        if (!tip || !track || tip.getAttribute("aria-hidden") !== "false") {
            return;
        }
        lastTipPct = pct;
        function apply() {
            if (!tip || !track || tip.getAttribute("aria-hidden") !== "false") {
                return;
            }
            var bounds = tipClampBounds();
            if (bounds.span <= 0) {
                return;
            }
            tip.style.maxWidth = bounds.span + "px";
            var tr = bounds.tr;
            var markerX = tr.left + (pct / 100) * tr.width;
            var tipW = tip.getBoundingClientRect().width || tip.offsetWidth;
            var leftPx = markerX - tipW / 2;
            leftPx = Math.max(bounds.minLeft, Math.min(leftPx, bounds.maxRight - tipW));
            tip.style.left = leftPx - tr.left + "px";
            tip.style.transform = "translate(0, 0)";
            var br = tip.getBoundingClientRect();
            if (br.left < bounds.minLeft) {
                leftPx += bounds.minLeft - br.left;
            }
            if (br.right > bounds.maxRight) {
                leftPx -= br.right - bounds.maxRight;
            }
            tip.style.left = leftPx - tr.left + "px";
        }
        requestAnimationFrame(function () {
            requestAnimationFrame(apply);
        });
    }

    function bindTipResize() {
        if (resizeBound) {
            return;
        }
        resizeBound = true;
        window.addEventListener("resize", function () {
            if (active || dragging) {
                syncTipAlign(lastTipPct);
            }
        });
    }

    function resetTipPosition(pct) {
        if (!tip) {
            return;
        }
        tip.style.left = pct + "%";
        tip.style.transform = "";
        tip.style.maxWidth = "";
    }

    function setMarkerPct(pct) {
        if (!bar || !marker) {
            return;
        }
        var p = Math.max(0, Math.min(100, pct));
        bar.style.setProperty("--station-day-pct", String(p));
        marker.style.left = p + "%";
        if (tip) {
            if (tip.getAttribute("aria-hidden") === "false") {
                syncTipAlign(p);
            } else {
                tip.style.left = p + "%";
            }
        }
    }

    function renderTip(hour) {
        if (!tip || !sky() || typeof sky().buildDayBarTip !== "function") {
            return;
        }
        sky().buildDayBarTip(tip, hour, dragging);
        tip.setAttribute("aria-hidden", "false");
        syncTipAlign((hour / 24) * 100);
    }

    function hideTip() {
        if (!tip) {
            return;
        }
        tip.setAttribute("aria-hidden", "true");
        if (bar) {
            var pct = parseFloat(bar.style.getPropertyValue("--station-day-pct") || "0");
            resetTipPosition(pct);
        }
    }

    function refreshHint() {
        if (!hint || !sky() || typeof sky().formatDayBarHint !== "function") {
            return;
        }
        if (active || dragging) {
            return;
        }
        hint.textContent = sky().formatDayBarHint();
    }

    function showAtHour(hour, clientX) {
        if (clientX != null) {
            hour = hourFromX(clientX);
        }
        setMarkerPct((hour / 24) * 100);
        renderTip(hour);
    }

    function releaseToLive() {
        if (!sky() || typeof sky().updateStationDayBar !== "function") {
            return;
        }
        setActive(false);
        dragging = false;
        hideTip();
        sky().updateStationDayBar();
        refreshHint();
    }

    function bind() {
        bar = document.getElementById("station-day-bar");
        track = document.getElementById("station-day-track");
        marker = document.getElementById("station-day-bar-marker");
        hint = document.getElementById("station-day-hint");
        tip = document.getElementById("station-day-tip");
        if (!bar || !track || !marker || !tip) {
            return;
        }

        marker.addEventListener("pointerenter", function () {
            setActive(true);
            if (!dragging && sky()) {
                showAtHour(sky().getSceneClockHour());
            }
        });

        marker.addEventListener("pointerleave", function (e) {
            if (dragging) {
                return;
            }
            if (bar.contains(e.relatedTarget)) {
                return;
            }
            releaseToLive();
        });

        marker.addEventListener("focus", function () {
            setActive(true);
            if (sky()) {
                showAtHour(sky().getSceneClockHour());
            }
        });

        marker.addEventListener("blur", function () {
            if (!dragging) {
                releaseToLive();
            }
        });

        track.addEventListener("pointerdown", function (e) {
            if (e.button !== 0) {
                return;
            }
            dragging = true;
            setActive(true);
            if (track.setPointerCapture) {
                track.setPointerCapture(e.pointerId);
            }
            showAtHour(hourFromX(e.clientX), e.clientX);
            e.preventDefault();
        });

        track.addEventListener("pointermove", function (e) {
            if (!dragging) {
                return;
            }
            showAtHour(hourFromX(e.clientX), e.clientX);
        });

        track.addEventListener("pointerup", function (e) {
            if (!dragging) {
                return;
            }
            if (track.releasePointerCapture) {
                try {
                    track.releasePointerCapture(e.pointerId);
                } catch (err) {
                    /* ignore */
                }
            }
            dragging = false;
            if (bar.matches(":hover") || marker.matches(":hover")) {
                showAtHour(hourFromX(e.clientX), e.clientX);
            } else {
                releaseToLive();
            }
        });

        track.addEventListener("pointercancel", function () {
            dragging = false;
            releaseToLive();
        });

        track.addEventListener("keydown", function (e) {
            if (!sky()) {
                return;
            }
            var h = sky().getSceneClockHour();
            var step = e.shiftKey ? 1 : 0.25;
            if (e.key === "ArrowRight") {
                e.preventDefault();
                setActive(true);
                showAtHour((h + step) % 24);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setActive(true);
                showAtHour((h - step + 24) % 24);
            } else if (e.key === "Escape") {
                releaseToLive();
                marker.blur();
            }
        });

        refreshHint();
        bindTipResize();
        if (sky() && typeof sky().updateStationDayBar === "function") {
            sky().updateStationDayBar();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bind, { once: true });
    } else {
        bind();
    }
})();
