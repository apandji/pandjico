/**
 * Register the site service worker. Included from every HTML page (root + projects/).
 * Resolves `sw.js` and scope from this script’s URL so it works on GitHub project Pages and locally.
 */
(function () {
    if (!("serviceWorker" in navigator)) {
        return;
    }
    var sc = document.currentScript;
    if (!sc || !sc.src) {
        var scripts = document.getElementsByTagName("script");
        sc = scripts[scripts.length - 1];
    }
    if (!sc || !sc.src) {
        return;
    }
    try {
        var swUrl = new URL("../sw.js", sc.src).href;
        var scopeUrl = new URL("../", sc.src).href;
        navigator.serviceWorker.register(swUrl, { scope: scopeUrl }).catch(function () {
            /* ignore — file://, blocked context, etc. */
        });
    } catch (e) {
        /* ignore */
    }
})();
