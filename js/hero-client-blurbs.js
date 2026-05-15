/**
 * Hero client logos: one shared blurb row below both marks. Fine pointer / keyboard: show the
 * matching copy while pointer or focus is inside `.hero-clients__group`; hide when leaving the group.
 */
(function () {
    var group = document.querySelector(".hero-clients__group");
    if (!group) {
        return;
    }

    var mqHover = window.matchMedia("(hover: hover)");
    var links = group.querySelectorAll(".hero-clients__link");

    function setActive(key) {
        if (key) {
            group.setAttribute("data-active-blurb", key);
        } else {
            group.removeAttribute("data-active-blurb");
        }
    }

    function clearIfLeaving(e) {
        var rt = e.relatedTarget;
        if (rt && group.contains(rt)) {
            return;
        }
        setActive(null);
    }

    links.forEach(function (link, i) {
        var key = i === 0 ? "asc" : "tcare";

        link.addEventListener("pointerenter", function () {
            if (mqHover.matches) {
                setActive(key);
            }
        });

        link.addEventListener("focusin", function () {
            setActive(key);
        });
    });

    group.addEventListener("pointerleave", clearIfLeaving);
    group.addEventListener("focusout", clearIfLeaving);
})();
