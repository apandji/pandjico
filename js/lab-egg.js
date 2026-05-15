/**
 * Footer “easter egg”: lab (geo overrides + coords) and scene time debug.
 * Plain / Shift clicks toggle stored flags then reload. Alt+click clears both.
 * URLs: ?lab=0 | ?sceneDebug=0 (see adapt-hero.js init).
 */
(function () {
    function init() {
        var btn = document.getElementById("footer-extras-dial");
        if (!btn) {
            return;
        }

        btn.addEventListener("click", function (ev) {
            ev.preventDefault();
            try {
                if (ev.altKey) {
                    window.localStorage.removeItem("lab");
                    window.localStorage.removeItem("sceneDebug");
                } else if (ev.shiftKey) {
                    if (window.localStorage.getItem("sceneDebug") === "1") {
                        window.localStorage.removeItem("sceneDebug");
                    } else {
                        window.localStorage.setItem("sceneDebug", "1");
                    }
                } else {
                    if (window.localStorage.getItem("lab") === "1") {
                        window.localStorage.removeItem("lab");
                    } else {
                        window.localStorage.setItem("lab", "1");
                    }
                }
            } catch (e) {
                /* ignore */
            }
            window.location.reload();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
