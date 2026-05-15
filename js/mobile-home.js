/**
 * Mobile home: sky permission band, geolocation denied note, overscroll link tray.
 */
(function () {
    var mq = window.matchMedia("(max-width: 820px)");
    if (!mq.matches) {
        return;
    }

    var skyBtn = document.getElementById("mobile-sky-use");
    var footerToggle = document.getElementById("footer-sky-toggle");
    var deniedEl = document.getElementById("mobile-sky-denied");
    var tray = document.getElementById("mobile-overscroll-tray");

    if (skyBtn && footerToggle) {
        skyBtn.addEventListener("click", function () {
            footerToggle.click();
            if (deniedEl) {
                deniedEl.hidden = true;
            }
        });
    }

    if (footerToggle && deniedEl) {
        footerToggle.addEventListener(
            "click",
            function () {
                window.setTimeout(function () {
                    if (footerToggle.getAttribute("aria-pressed") !== "true") {
                        return;
                    }
                    if (!navigator.permissions) {
                        return;
                    }
                    navigator.permissions.query({ name: "geolocation" }).then(function (result) {
                        if (result.state === "denied") {
                            deniedEl.hidden = false;
                        }
                    }).catch(function () {
                        /* ignore */
                    });
                }, 800);
            },
            { once: false },
        );
    }

    if (!tray) {
        return;
    }

    var revealed = false;
    var touchStartY = 0;

    function revealTray() {
        if (revealed) {
            return;
        }
        revealed = true;
        tray.classList.add("mobile-overscroll-tray--revealed");
        tray.setAttribute("aria-hidden", "false");
    }

    function atBottom() {
        return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    }

    window.addEventListener(
        "scroll",
        function () {
            if (atBottom() && window.scrollY > 40) {
                revealTray();
            }
        },
        { passive: true },
    );

    document.addEventListener(
        "touchstart",
        function (e) {
            if (atBottom()) {
                touchStartY = e.touches[0].clientY;
            }
        },
        { passive: true },
    );

    document.addEventListener(
        "touchmove",
        function (e) {
            if (!atBottom()) {
                return;
            }
            var dy = e.touches[0].clientY - touchStartY;
            if (dy < -18) {
                revealTray();
            }
        },
        { passive: true },
    );
})();
