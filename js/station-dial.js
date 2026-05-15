/**
 * Footer ⁘ on index: navigate to station; Shift+click = scene debug; Alt+click = clear lab flags.
 */
(function () {
    function init() {
        var dial = document.getElementById("footer-extras-dial");
        if (!dial || dial.tagName !== "A") {
            return;
        }

        dial.addEventListener("click", function (ev) {
            if (!ev.shiftKey && !ev.altKey) {
                return;
            }
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
