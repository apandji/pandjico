/**
 * Frost tooltips (`.frost-tooltip`): footer sky hint only — borderless glass, backdrop blur.
 * Fine pointer: tip tracks cursor (below-right, flips when clipped). Keyboard / coarse: clamped
 * near the wrap.
 */
(function () {
    var pad = 12;
    var gap = 10;
    var cursorOffX = 14;
    var cursorOffY = 16;
    var maxWpx = 400; /* keep in sync with footer `.frost-tooltip` width cap */
    var anchorClass = "frost-tooltip--anchored";

    var wraps = document.querySelectorAll(".time-footer__sky-wrap");
    if (!wraps.length) {
        return;
    }

    var openWrap = null;
    var followPointer = false;
    var rafPlaceId = 0;
    var lastPx = 0;
    var lastPy = 0;

    function clamp(x, lo, hi) {
        return Math.max(lo, Math.min(hi, x));
    }

    /** Max tooltip width: viewport cap. */
    function maxTooltipWidth(wrap, vw, pad) {
        var cap = vw - pad * 2;
        return Math.min(maxWpx, Math.max(96, cap));
    }

    /** Horizontal bounds in viewport px for `position: fixed` tips. */
    function horizTipClamp(wrap, tw, pad) {
        var vw = window.innerWidth || 0;
        var minLeft = pad;
        var innerRight = vw - pad;
        var maxLeft = innerRight - tw;
        if (maxLeft < minLeft) {
            maxLeft = minLeft;
        }
        return { minLeft: minLeft, maxLeft: maxLeft, innerRight: innerRight };
    }

    /** Viewport `left`/`top` for `position: fixed` (hero). Under `.time-footer__sky-wrap`, anchored tips use `position: absolute` — convert to wrap-local coords. */
    function writeTipBox(tip, wrap, viewportLeft, viewportTop, widthPx) {
        var l = viewportLeft;
        var t = viewportTop;
        if (wrap.classList.contains("time-footer__sky-wrap")) {
            var wr = wrap.getBoundingClientRect();
            l -= wr.left;
            t -= wr.top;
        }
        tip.style.left = Math.round(l) + "px";
        tip.style.top = Math.round(t) + "px";
        tip.style.width = widthPx + "px";
    }

    function getTip(wrap) {
        return wrap.querySelector(".frost-tooltip");
    }

    /** Measure height with a definite width; leaves `.frost-tooltip--anchored` on. */
    function measureTipHeight(tip, maxW) {
        tip.classList.add(anchorClass);
        tip.style.left = "-9999px";
        tip.style.top = "0";
        tip.style.width = maxW + "px";
        tip.style.opacity = "1";
        tip.style.visibility = "visible";
        var th = tip.offsetHeight || 48;
        tip.style.opacity = "";
        tip.style.visibility = "";
        return th;
    }

    function placeFromWrap(wrap, tip, maxW, vw, vh) {
        var wr = wrap.getBoundingClientRect();
        var th = measureTipHeight(tip, maxW);
        tip.style.width = "";
        var tw = maxW;
        var cx = wr.left + wr.width * 0.5;
        var left = cx - tw * 0.5;
        var hb = horizTipClamp(wrap, tw, pad);
        left = clamp(left, hb.minLeft, hb.maxLeft);
        var top = wr.top - th - gap;
        if (top < pad) {
            top = wr.bottom + gap;
        }
        if (top + th > vh - pad) {
            top = clamp(vh - th - pad, pad, vh - th - pad);
        }
        if (top < pad) {
            top = pad;
        }
        writeTipBox(tip, wrap, left, top, maxW);
    }

    function placeFromCursor(wrap, tip, maxW, vw, vh, clientX, clientY) {
        var th = measureTipHeight(tip, maxW);
        tip.style.width = "";
        var tw = maxW;
        var hb = horizTipClamp(wrap, tw, pad);
        /* Ride with the pointer: default anchor below–right of cursor. */
        var left = clientX + cursorOffX;
        var top = clientY + cursorOffY;
        if (left + tw > hb.innerRight) {
            left = clientX - cursorOffX - tw;
        }
        left = clamp(left, hb.minLeft, hb.maxLeft);
        if (top + th > vh - pad) {
            top = clientY - cursorOffY - th;
        }
        if (top < pad) {
            top = pad;
        }
        top = clamp(top, pad, vh - th - pad);
        writeTipBox(tip, wrap, left, top, maxW);
    }

    function place(wrap, clientX, clientY) {
        var tip = getTip(wrap);
        if (!tip) {
            return;
        }
        var vw = window.innerWidth || 0;
        var vh = window.innerHeight || 0;
        if (vw < 2 || vh < 2) {
            return;
        }
        var maxW = maxTooltipWidth(wrap, vw, pad);
        var usePointer =
            followPointer &&
            typeof clientX === "number" &&
            typeof clientY === "number" &&
            !isNaN(clientX) &&
            !isNaN(clientY);

        if (usePointer) {
            placeFromCursor(wrap, tip, maxW, vw, vh, clientX, clientY);
        } else {
            placeFromWrap(wrap, tip, maxW, vw, vh);
        }
    }

    function clear(wrap) {
        var tip = getTip(wrap);
        if (!tip) {
            return;
        }
        tip.classList.remove(anchorClass);
        tip.style.left = "";
        tip.style.top = "";
        tip.style.width = "";
        tip.style.opacity = "";
        tip.style.visibility = "";
    }

    function isOpen(wrap) {
        return wrap.matches(":hover") || wrap.contains(document.activeElement);
    }

    function schedulePlace(wrap, clientX, clientY) {
        if (rafPlaceId) {
            cancelAnimationFrame(rafPlaceId);
        }
        rafPlaceId = requestAnimationFrame(function () {
            rafPlaceId = 0;
            if (!openWrap || openWrap !== wrap || !isOpen(wrap)) {
                return;
            }
            if (
                followPointer &&
                typeof clientX === "number" &&
                typeof clientY === "number" &&
                !isNaN(clientX) &&
                !isNaN(clientY)
            ) {
                place(wrap, clientX, clientY);
            } else {
                place(wrap);
            }
        });
    }

    document.addEventListener(
        "pointermove",
        function (e) {
            lastPx = e.clientX;
            lastPy = e.clientY;
            if (openWrap && followPointer && isOpen(openWrap) && e.pointerType === "mouse") {
                schedulePlace(openWrap, lastPx, lastPy);
            }
        },
        { passive: true },
    );

    wraps.forEach(function (wrap) {
        var btn = wrap.querySelector("#footer-sky-toggle");
        if (btn) {
            function suppressFooterTip() {
                var tip = getTip(wrap);
                if (tip) {
                    tip.classList.add("frost-tooltip--suppress-hover");
                }
                if (openWrap === wrap) {
                    openWrap = null;
                }
                followPointer = false;
                clear(wrap);
            }
            btn.addEventListener("pointerdown", suppressFooterTip, true);
            btn.addEventListener("click", suppressFooterTip, true);
        }

        wrap.addEventListener(
            "pointerenter",
            function (e) {
                lastPx = e.clientX;
                lastPy = e.clientY;
                openWrap = wrap;
                followPointer = e.pointerType === "mouse";
                window.requestAnimationFrame(function () {
                    window.requestAnimationFrame(function () {
                        if (!isOpen(wrap)) {
                            return;
                        }
                        if (followPointer) {
                            place(wrap, e.clientX, e.clientY);
                        } else {
                            place(wrap);
                        }
                    });
                });
            },
            { passive: true },
        );

        wrap.addEventListener(
            "pointermove",
            function (e) {
                if (e.pointerType === "mouse") {
                    followPointer = true;
                }
                if (openWrap === wrap && isOpen(wrap) && followPointer) {
                    schedulePlace(wrap, e.clientX, e.clientY);
                }
            },
            { passive: true },
        );

        wrap.addEventListener(
            "pointerleave",
            function () {
                var tip = getTip(wrap);
                if (tip) {
                    tip.classList.remove("frost-tooltip--suppress-hover");
                }
                if (openWrap === wrap) {
                    openWrap = null;
                }
                followPointer = false;
                clear(wrap);
            },
            { passive: true },
        );

        wrap.addEventListener("focusin", function () {
            openWrap = wrap;
            followPointer = false;
            window.requestAnimationFrame(function () {
                if (isOpen(wrap)) {
                    place(wrap);
                }
            });
        });

        wrap.addEventListener("focusout", function (e) {
            if (!wrap.contains(e.relatedTarget)) {
                var tipOut = getTip(wrap);
                if (tipOut) {
                    tipOut.classList.remove("frost-tooltip--suppress-hover");
                }
                if (openWrap === wrap) {
                    openWrap = null;
                }
                followPointer = false;
                clear(wrap);
            }
        });
    });

    function onGlobalMove() {
        if (!openWrap || !isOpen(openWrap)) {
            return;
        }
        if (followPointer) {
            schedulePlace(openWrap, lastPx, lastPy);
        } else {
            schedulePlace(openWrap);
        }
    }

    window.addEventListener("scroll", onGlobalMove, { passive: true, capture: true });
    window.addEventListener("resize", onGlobalMove);
    var panel = document.querySelector(".hero-panel");
    if (panel) {
        panel.addEventListener("scroll", onGlobalMove, { passive: true });
    }
})();
