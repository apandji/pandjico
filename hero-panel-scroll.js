/**
 * Split layout (wide): hero column does not scroll on its own — wheel/trackpad over the intro
 * panel scrolls the main document so the work rail moves.
 */
(function () {
    var panel = document.querySelector(".hero-panel");
    if (!panel) {
        return;
    }

    var mqSplit = window.matchMedia("(min-width: 821px)");

    function isSplitLayout() {
        return mqSplit.matches;
    }

    panel.addEventListener(
        "wheel",
        function (e) {
            if (!isSplitLayout()) {
                return;
            }
            e.preventDefault();
            window.scrollBy({
                left: e.deltaX,
                top: e.deltaY,
                behavior: "auto",
            });
        },
        { passive: false },
    );
})();
