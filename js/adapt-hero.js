/**
 * Adaptive scene: hourly cyclical palette → `--bg-*`, type, hero title.
 *
 * — Background: 24 knots H/S/L, eased blend within the hour; 23:00 → 00:00 wraps to midnight blue.
 * — Light/dark: always from civil twilight at the chosen “sky anchor” (no manual theme).
 * — Anchor: St. Louis (America/Chicago) by default, or “your sky” after geolocation (cached in localStorage).
 * — Hourly palette + greetings follow the scene clock (anchor TZ, or lab-resolved TZ when a debug pin is set).
 * — Hero + CTAs: `--accent-*` on `:root` — hue is bg + 180° (complement) on bright panels; bg + ~28° (analogous) when the panel reads dim (same luminance band as inverted client marks) or in full night (`data-appearance="dark"`). S/L are contrast-picked for WCAG; light-on-dark picks favor saturated high-80s L so hue stays visible.
 * — Client logos: tinted monochrome via CSS `filter` (`--logo-hue-rotate` from accent hue); no image libs.
 * — Hover on hero name + scene-arrow links: text shifts to the other accent family (complement ↔ analogous), not a chroma wash (`css/styles.css`).
 * — `.hero` still stores `--hero-h` (= scene bg hue) for legacy hooks; cursor follows computed `.hero` color (accent).
 * — Hourly field: after sun + golden bands, outbound °F (Open-Meteo) nudges H/S/L slightly cooler in winter,
 *   warmer in summer so one location still drifts with seasons. Prose `--fg-*` / `--meta-*` are then clamped so
 *   contrast vs `--bg-*` meets WCAG 2.1 AA for body text (~4.5:1 with small headroom for text opacity in CSS).
 * — Footer: caption (greeting, date, time, temp, place) + pin toggle; Open-Meteo weather; place via Nominatim reverse
 *   (Open-Meteo has no reverse API). Lab pin also resolves IANA TZ (timeapi.io) so footer + scene clock match the spoofed point.
 * — Playground readout: ?lab=1 | localStorage.lab=1 — extra coordinates line + optional lat/lon override
 *   (footerGeoDebugLat / footerGeoDebugLon) so sun, weather, caption place, and scene/footer clock use test coords. ?lab=0 clears the stored flag.
 * — Scene scrubber (debug): ?sceneDebug=1 | localStorage.sceneDebug=1; ?sceneDebug=0 clears the stored flag.
 * — Hero accent ink (dark on light panels): optional extra L vs WCAG floor — ?accentInkBump=0–14 |
 *   localStorage.accentInkBump (default 5). Scene debug adds a live slider; combine with ?sceneDebug=1
 *   and turn off “Follow local time” to scrub 0–24h.
 */
(function () {
    var root = document.documentElement;
    var LAB_STORAGE_KEY = "lab";

    function initLabFromQuery() {
        try {
            var q = new URLSearchParams(window.location.search);
            if (q.get("lab") === "1") {
                window.localStorage.setItem(LAB_STORAGE_KEY, "1");
            } else if (q.get("lab") === "0") {
                window.localStorage.removeItem(LAB_STORAGE_KEY);
            }
        } catch (e) {
            /* ignore */
        }
    }

    function initSceneDebugFromQuery() {
        try {
            var q = new URLSearchParams(window.location.search);
            if (q.get("sceneDebug") === "0") {
                window.localStorage.removeItem("sceneDebug");
            }
        } catch (eSd) {
            /* ignore */
        }
    }

    function labPlaygroundEnabled() {
        try {
            var q = new URLSearchParams(window.location.search);
            if (q.get("lab") === "1") {
                return true;
            }
            if (q.get("lab") === "0") {
                return false;
            }
            return window.localStorage.getItem(LAB_STORAGE_KEY) === "1";
        } catch (e2) {
            return false;
        }
    }

    function applyLabDataset() {
        if (labPlaygroundEnabled()) {
            root.dataset.lab = "1";
        } else {
            delete root.dataset.lab;
        }
    }

    initLabFromQuery();
    initSceneDebugFromQuery();
    applyLabDataset();
    var hero = document.querySelector(".hero");
    var pageSplit = document.querySelector(".page-split");

    var FOOTER_ANCHOR_KEY = "footerAnchor";
    var FOOTER_GEO_LAT_KEY = "footerGeoLat";
    var FOOTER_GEO_LON_KEY = "footerGeoLon";
    var FOOTER_GEO_PLACE_KEY = "footerGeoPlace";
    /** Lab-only: caption “in …” + TZ for scene/footer clock while a debug pin is active (separate from real “here” cache). */
    var FOOTER_GEO_LAB_PLACE_KEY = "footerGeoLabPlace";
    var FOOTER_GEO_LAB_CAPTION_TZ_KEY = "footerGeoLabCaptionTz";
    var FOOTER_GEO_DEBUG_LAT_KEY = "footerGeoDebugLat";
    var FOOTER_GEO_DEBUG_LON_KEY = "footerGeoDebugLon";
    var FOOTER_CAPTION_INTRO_KEY = "pandjiFooterCaptionIntroDismissed";
    var FOOTER_INTRO_LINE =
        "This site take readings, with colors shifting to match the rhythm of the day.";
    var FOOTER_SKY_TOOLTIP_DEFAULT = "use my own sky instead";
    var FOOTER_SKY_TOOLTIP_DENIED = "no worries — st. louis skies are good skies.";
    var footerSkyDenyResetId = 0;
    var FOOTER_CAPTION_TYPE_CHAR_MS = 34;
    var FOOTER_CAPTION_INTRO_HOLD_MS = 5200;
    var FOOTER_CAPTION_GLITCH_MS = 1120;
    var FOOTER_CAPTION_GLITCH_STEPS = 36;
    var FOOTER_GLITCH_CHARSET = "·:;|/\\{}[]?+=-_…—░▒▓×÷•0123456789";
    var footerCaptionIntroTimer = null;
    var footerCaptionTypeTick = 0;
    var footerCaptionIntroRunning = false;
    var footerCaptionIntroStarted = false;
    var STL_LAT = 38.627;
    var STL_LON = -90.1994;
    var STL_TZ = "America/Chicago";

    function readFooterAnchorMode() {
        try {
            if (window.localStorage.getItem(FOOTER_ANCHOR_KEY) === "here") {
                return "here";
            }
        } catch (e) {
            /* ignore */
        }
        return "stl";
    }

    function writeFooterAnchorMode(mode) {
        try {
            if (mode === "here") {
                window.localStorage.setItem(FOOTER_ANCHOR_KEY, "here");
            } else {
                window.localStorage.setItem(FOOTER_ANCHOR_KEY, "stl");
            }
        } catch (e2) {
            /* ignore */
        }
    }

    function parseLatLonPair(latKey, lonKey) {
        try {
            var la = parseFloat(window.localStorage.getItem(latKey) || "");
            var lo = parseFloat(window.localStorage.getItem(lonKey) || "");
            if (!isNaN(la) && !isNaN(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180) {
                return { lat: la, lon: lo };
            }
        } catch (ePl) {
            /* ignore */
        }
        return null;
    }

    function readStoredGeoCoords() {
        return parseLatLonPair(FOOTER_GEO_LAT_KEY, FOOTER_GEO_LON_KEY);
    }

    /** Lab-only: overrides readAnchorLatLon for sun + weather; caption place/TZ use separate lab cache. */
    function readDebugGeoOverride() {
        if (!labPlaygroundEnabled()) {
            return null;
        }
        return parseLatLonPair(FOOTER_GEO_DEBUG_LAT_KEY, FOOTER_GEO_DEBUG_LON_KEY);
    }

    function writeDebugGeoOverride(lat, lon) {
        try {
            window.localStorage.setItem(FOOTER_GEO_DEBUG_LAT_KEY, String(lat));
            window.localStorage.setItem(FOOTER_GEO_DEBUG_LON_KEY, String(lon));
        } catch (eDbgW) {
            /* ignore */
        }
    }

    function clearDebugGeoOverride() {
        try {
            window.localStorage.removeItem(FOOTER_GEO_DEBUG_LAT_KEY);
            window.localStorage.removeItem(FOOTER_GEO_DEBUG_LON_KEY);
        } catch (eDbgC) {
            /* ignore */
        }
        clearLabCaptionCache();
    }

    var GEO_DEBUG_PRESETS = [
        { lat: 35.6762, lon: 139.6503 },
        { lat: 51.5074, lon: -0.1278 },
        { lat: 40.7128, lon: -74.006 },
        { lat: -33.8688, lon: 151.2093 },
        { lat: 55.7558, lon: 37.6173 },
        { lat: 19.4326, lon: -99.1332 },
        { lat: 1.3521, lon: 103.8198 },
        { lat: 48.8566, lon: 2.3522 },
        { lat: -22.9068, lon: -43.1729 },
        { lat: 37.7749, lon: -122.4194 },
    ];

    function pickRandomDebugPreset() {
        var i = Math.floor(Math.random() * GEO_DEBUG_PRESETS.length);
        return GEO_DEBUG_PRESETS[i];
    }

    function refreshGeoDebugInputsFromStorage() {
        var latIn = document.getElementById("footer-debug-lat");
        var lonIn = document.getElementById("footer-debug-lon");
        if (!latIn || !lonIn) {
            return;
        }
        var o = readDebugGeoOverride();
        if (o) {
            latIn.value = String(o.lat);
            lonIn.value = String(o.lon);
        } else {
            latIn.value = "";
            lonIn.value = "";
        }
    }

    function syncFooterGeoDebugHint() {
        var hint = document.getElementById("footer-geo-debug-hint");
        if (!hint) {
            return;
        }
        if (readDebugGeoOverride()) {
            hint.textContent =
                "Override on — sun, weather, footer place, and scene/footer clock follow these coordinates (until you clear the pin).";
        } else {
            hint.textContent =
                "Apply custom lat/lon or random city to stress-test sky gradient and weather. Clear override or ?lab=0 to stop. Geolocation needs HTTPS and browser permission.";
        }
    }

    function syncFooterGeoDebugPanel() {
        var wrap = document.getElementById("footer-geo-debug");
        if (!wrap) {
            return;
        }
        if (!labPlaygroundEnabled()) {
            wrap.setAttribute("hidden", "");
            wrap.setAttribute("aria-hidden", "true");
            return;
        }
        wrap.removeAttribute("hidden");
        wrap.setAttribute("aria-hidden", "false");
        syncFooterGeoDebugHint();
    }

    function ensureFooterGeoDebugWired() {
        var wrap = document.getElementById("footer-geo-debug");
        if (!wrap || wrap.dataset.wired === "1") {
            return;
        }
        wrap.dataset.wired = "1";
        var latIn = document.getElementById("footer-debug-lat");
        var lonIn = document.getElementById("footer-debug-lon");
        var btnApply = document.getElementById("footer-debug-apply");
        var btnRand = document.getElementById("footer-debug-random");
        var btnClear = document.getElementById("footer-debug-clear");
        var btnCopy = document.getElementById("footer-debug-copy");
        if (!latIn || !lonIn || !btnApply || !btnRand || !btnClear) {
            return;
        }
        btnApply.addEventListener("click", function () {
            var la = parseFloat(String(latIn.value).replace(/,/g, "."));
            var lo = parseFloat(String(lonIn.value).replace(/,/g, "."));
            if (isNaN(la) || isNaN(lo) || la < -90 || la > 90 || lo < -180 || lo > 180) {
                return;
            }
            clearLabCaptionCache();
            writeDebugGeoOverride(la, lo);
            lastWeatherAttempt = 0;
            tick();
            refreshGeoDebugInputsFromStorage();
            syncFooterGeoDebugHint();
        });
        btnRand.addEventListener("click", function () {
            var p = pickRandomDebugPreset();
            clearLabCaptionCache();
            writeDebugGeoOverride(p.lat, p.lon);
            lastWeatherAttempt = 0;
            tick();
            refreshGeoDebugInputsFromStorage();
            syncFooterGeoDebugHint();
        });
        btnClear.addEventListener("click", function () {
            clearDebugGeoOverride();
            lastWeatherAttempt = 0;
            tick();
            refreshGeoDebugInputsFromStorage();
            syncFooterGeoDebugHint();
        });
        if (btnCopy) {
            btnCopy.addEventListener("click", function () {
                var ll = readAnchorLatLon();
                var t = ll.lat.toFixed(5) + ", " + ll.lon.toFixed(5);
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(t).catch(function () {
                        /* ignore */
                    });
                } else {
                    var ta = document.createElement("textarea");
                    ta.value = t;
                    ta.setAttribute("readonly", "");
                    ta.style.position = "fixed";
                    ta.style.left = "-9999px";
                    document.body.appendChild(ta);
                    ta.select();
                    try {
                        document.execCommand("copy");
                    } catch (eCp) {
                        /* ignore */
                    }
                    document.body.removeChild(ta);
                }
            });
        }
    }

    function writeStoredGeoCoords(lat, lon) {
        try {
            window.localStorage.setItem(FOOTER_GEO_LAT_KEY, String(lat));
            window.localStorage.setItem(FOOTER_GEO_LON_KEY, String(lon));
            window.localStorage.removeItem(FOOTER_GEO_PLACE_KEY);
            window.localStorage.removeItem(FOOTER_GEO_LAB_PLACE_KEY);
            window.localStorage.removeItem(FOOTER_GEO_LAB_CAPTION_TZ_KEY);
        } catch (e4) {
            /* ignore */
        }
    }

    /** Normalize orphaned “here” without coordinates back to St. Louis. */
    function normalizeFooterAnchorState() {
        if (readFooterAnchorMode() !== "here") {
            return;
        }
        if (!readStoredGeoCoords()) {
            writeFooterAnchorMode("stl");
        }
    }

    function anchorTimeZone() {
        return readFooterAnchorMode() === "here"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : STL_TZ;
    }

    /** Scene + footer caption clock: anchor TZ, or lab-resolved TZ when a debug pin is set. */
    function effectiveSceneTimeZone() {
        if (readDebugGeoOverride() && labPlaygroundEnabled()) {
            var labTz = readCachedLabCaptionTz();
            if (labTz) {
                return labTz;
            }
        }
        return anchorTimeZone();
    }

    function readAnchorLatLon() {
        var dbg = readDebugGeoOverride();
        if (dbg) {
            return dbg;
        }
        if (readFooterAnchorMode() === "here") {
            var g = readStoredGeoCoords();
            if (g) {
                return g;
            }
        }
        return { lat: STL_LAT, lon: STL_LON };
    }

    function zonedClockHourFloat(date, timeZone) {
        var parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: timeZone,
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
        }).formatToParts(date);
        var hour = 0;
        var minute = 0;
        var second = 0;
        var i;
        for (i = 0; i < parts.length; i++) {
            if (parts[i].type === "hour") {
                hour = parseInt(parts[i].value, 10) || 0;
            }
            if (parts[i].type === "minute") {
                minute = parseInt(parts[i].value, 10) || 0;
            }
            if (parts[i].type === "second") {
                second = parseInt(parts[i].value, 10) || 0;
            }
        }
        return hour + minute / 60 + second / 3600;
    }

    function sceneClockHourFloat() {
        if (simSlider && followReal && !followReal.checked) {
            return clockHourFloat();
        }
        return zonedClockHourFloat(new Date(), effectiveSceneTimeZone());
    }

    var lastWeatherTempF = null;
    var lastWeatherAttempt = 0;
    var placeNameFetchInFlight = false;

    function readCachedPlaceLower() {
        try {
            var s = window.localStorage.getItem(FOOTER_GEO_PLACE_KEY);
            if (s != null && String(s).trim()) {
                return String(s).trim().toLowerCase();
            }
        } catch (ePl) {
            /* ignore */
        }
        return null;
    }

    function writeCachedPlaceLower(name) {
        try {
            window.localStorage.setItem(FOOTER_GEO_PLACE_KEY, String(name).trim().toLowerCase());
        } catch (ePl2) {
            /* ignore */
        }
    }

    function clearLabCaptionCache() {
        try {
            window.localStorage.removeItem(FOOTER_GEO_LAB_PLACE_KEY);
            window.localStorage.removeItem(FOOTER_GEO_LAB_CAPTION_TZ_KEY);
        } catch (eLabClr) {
            /* ignore */
        }
    }

    function readCachedLabPlaceLower() {
        try {
            var s = window.localStorage.getItem(FOOTER_GEO_LAB_PLACE_KEY);
            if (s != null && String(s).trim()) {
                return String(s).trim().toLowerCase();
            }
        } catch (eLp) {
            /* ignore */
        }
        return null;
    }

    function writeCachedLabPlaceLower(name) {
        try {
            window.localStorage.setItem(FOOTER_GEO_LAB_PLACE_KEY, String(name).trim().toLowerCase());
        } catch (eLp2) {
            /* ignore */
        }
    }

    function readCachedLabCaptionTz() {
        try {
            var s = window.localStorage.getItem(FOOTER_GEO_LAB_CAPTION_TZ_KEY);
            if (s != null && String(s).trim()) {
                return String(s).trim();
            }
        } catch (eTz) {
            /* ignore */
        }
        return null;
    }

    function writeCachedLabCaptionTz(iana) {
        try {
            window.localStorage.setItem(FOOTER_GEO_LAB_CAPTION_TZ_KEY, String(iana).trim());
        } catch (eTz2) {
            /* ignore */
        }
    }

    function formatLatLonPlaceholderLower(lat, lon) {
        return formatLatLonLine(lat, lon).toLowerCase().replace(/\s+/g, " ");
    }

    function readDisplayPlaceLower() {
        var dbg = readDebugGeoOverride();
        if (dbg) {
            return readCachedLabPlaceLower() || formatLatLonPlaceholderLower(dbg.lat, dbg.lon);
        }
        if (readFooterAnchorMode() === "here" && readStoredGeoCoords()) {
            return readCachedPlaceLower() || "here";
        }
        return "st louis";
    }

    function nominatimPlaceLabelFromJson(j) {
        if (!j || typeof j !== "object") {
            return "";
        }
        var addr = j.address;
        if (addr && typeof addr === "object") {
            var keys = [
                "city",
                "town",
                "village",
                "municipality",
                "suburb",
                "city_district",
                "county",
                "state_district",
                "state",
                "country",
            ];
            var ki;
            for (ki = 0; ki < keys.length; ki++) {
                var v = addr[keys[ki]];
                if (v && String(v).trim()) {
                    return String(v).trim().toLowerCase();
                }
            }
        }
        if (j.name && String(j.name).trim()) {
            return String(j.name).trim().toLowerCase();
        }
        return "";
    }

    function fetchNominatimPlaceLabel(lat, lon) {
        var url =
            "https://nominatim.openstreetmap.org/reverse?lat=" +
            encodeURIComponent(String(lat)) +
            "&lon=" +
            encodeURIComponent(String(lon)) +
            "&format=jsonv2";
        return window
            .fetch(url, {
                headers: {
                    "Accept-Language": "en",
                    "User-Agent": "pandjico/1.0 (https://apandji.github.io/pandjico; portfolio)",
                },
            })
            .then(function (r) {
                return r.ok ? r.json() : null;
            })
            .then(function (j) {
                return nominatimPlaceLabelFromJson(j);
            });
    }

    function fetchCaptionTimeZoneForLatLon(lat, lon) {
        var url =
            "https://timeapi.io/api/TimeZone/coordinate?latitude=" +
            encodeURIComponent(String(lat)) +
            "&longitude=" +
            encodeURIComponent(String(lon));
        return window
            .fetch(url)
            .then(function (r) {
                return r.ok ? r.json() : null;
            })
            .then(function (j) {
                if (j && j.timeZone && String(j.timeZone).trim()) {
                    return String(j.timeZone).trim();
                }
                return "";
            });
    }

    function fetchHerePlaceName(lat, lon) {
        if (placeNameFetchInFlight) {
            return;
        }
        placeNameFetchInFlight = true;
        try {
            fetchNominatimPlaceLabel(lat, lon)
                .then(function (label) {
                    placeNameFetchInFlight = false;
                    if (label) {
                        writeCachedPlaceLower(label);
                    }
                    tick();
                })
                .catch(function () {
                    placeNameFetchInFlight = false;
                    tick();
                });
        } catch (eHere) {
            placeNameFetchInFlight = false;
        }
    }

    function fetchLabCaptionGeo(lat, lon) {
        if (placeNameFetchInFlight) {
            return;
        }
        placeNameFetchInFlight = true;
        try {
            Promise.all([
                fetchNominatimPlaceLabel(lat, lon),
                fetchCaptionTimeZoneForLatLon(lat, lon),
            ])
                .then(function (pair) {
                    placeNameFetchInFlight = false;
                    var label = pair[0];
                    var tz = pair[1];
                    if (label) {
                        writeCachedLabPlaceLower(label);
                    }
                    if (tz) {
                        writeCachedLabCaptionTz(tz);
                    }
                    tick();
                })
                .catch(function () {
                    placeNameFetchInFlight = false;
                    tick();
                });
        } catch (eLab) {
            placeNameFetchInFlight = false;
        }
    }

    function maybeRefreshPlaceName() {
        if (placeNameFetchInFlight) {
            return;
        }
        var dbg = readDebugGeoOverride();
        if (dbg) {
            if (readCachedLabPlaceLower()) {
                return;
            }
            fetchLabCaptionGeo(dbg.lat, dbg.lon);
            return;
        }
        if (readFooterAnchorMode() !== "here" || !readStoredGeoCoords()) {
            return;
        }
        if (readCachedPlaceLower()) {
            return;
        }
        var g = readStoredGeoCoords();
        if (g) {
            fetchHerePlaceName(g.lat, g.lon);
        }
    }

    function maybeRefreshWeather() {
        var now = Date.now();
        if (now - lastWeatherAttempt < 80 * 1000) {
            return;
        }
        lastWeatherAttempt = now;
        var ll = readAnchorLatLon();
        var url =
            "https://api.open-meteo.com/v1/forecast?latitude=" +
            encodeURIComponent(String(ll.lat)) +
            "&longitude=" +
            encodeURIComponent(String(ll.lon)) +
            "&current=temperature_2m,weather_code&temperature_unit=fahrenheit";
        try {
            window
                .fetch(url)
                .then(function (r) {
                    return r.ok ? r.json() : null;
                })
                .then(function (j) {
                    if (!j || !j.current) {
                        return;
                    }
                    var t = j.current.temperature_2m;
                    if (typeof t !== "number") {
                        return;
                    }
                    lastWeatherTempF = Math.round(t);
                    if (followLiveTemp && followLiveTemp.checked && tempSimSlider) {
                        tempSimSlider.value = String(lastWeatherTempF);
                    }
                    tick();
                })
                .catch(function () {
                    /* ignore */
                });
        } catch (e5) {
            /* ignore */
        }
    }

    var followReal = null;
    var simSlider = null;
    var accentBumpSlider = null;
    var followLiveTemp = null;
    var tempSimSlider = null;

    /** When set (scene-debug slider), overrides URL/localStorage for max accent-ink L bump. */
    var liveAccentInkBump = null;

    /** Scene anchor for hero hue (set from the sampled palette each tick). */
    var sceneHueForHero = 238;

    /** Default max HSL L bump for dark-on-light hero accent (`bumpDarkInkL`; still contrast-clamped). */
    var ACCENT_INK_BUMP_DEFAULT = 5;
    /** Do not push dark ink lighter than this L — keeps “ink”, not paper-gray. */
    var ACCENT_INK_L_CAP = 48;

    function readAccentInkBumpMax() {
        if (liveAccentInkBump != null && !isNaN(liveAccentInkBump)) {
            return Math.max(0, Math.min(14, liveAccentInkBump));
        }
        try {
            var q = new URLSearchParams(window.location.search);
            if (q.has("accentInkBump")) {
                var n = parseInt(q.get("accentInkBump"), 10);
                return isNaN(n) ? ACCENT_INK_BUMP_DEFAULT : Math.max(0, Math.min(14, n));
            }
        } catch (eAb) {
            /* ignore */
        }
        try {
            var st = window.localStorage.getItem("accentInkBump");
            if (st != null && st !== "") {
                var n2 = parseInt(st, 10);
                if (!isNaN(n2)) {
                    return Math.max(0, Math.min(14, n2));
                }
            }
        } catch (eAb2) {
            /* ignore */
        }
        return ACCENT_INK_BUMP_DEFAULT;
    }

    function sceneDebugEnabled() {
        try {
            var q = new URLSearchParams(window.location.search);
            if (q.get("sceneDebug") === "0") {
                return false;
            }
            if (q.get("sceneDebug") === "1" || q.get("debug") === "scene") {
                return true;
            }
            return window.localStorage.getItem("sceneDebug") === "1";
        } catch (e) {
            return false;
        }
    }

    function wireSceneDebugSliders() {
        if (!followReal || !simSlider) {
            return;
        }
        followReal.addEventListener("change", function () {
            simSlider.disabled = followReal.checked;
            if (followReal.checked) {
                simSlider.value = String(
                    Math.min(100, Math.max(0, Math.round((clockHourFloat() % 24) * (100 / 24)))),
                );
            }
            tick();
        });

        simSlider.addEventListener("input", function () {
            if (followReal.checked) {
                return;
            }
            tick();
        });

        if (followLiveTemp && tempSimSlider) {
            followLiveTemp.addEventListener("change", function () {
                tempSimSlider.disabled = followLiveTemp.checked;
                if (followLiveTemp.checked && lastWeatherTempF != null && !isNaN(lastWeatherTempF)) {
                    tempSimSlider.value = String(lastWeatherTempF);
                }
                tick();
            });
            tempSimSlider.addEventListener("input", function () {
                if (followLiveTemp.checked) {
                    return;
                }
                tick();
            });
        }
    }

    /** °F for seasonal palette tint: live API unless scene-debug “sim °F” is unchecked. */
    function effectivePaletteTempF() {
        if (followLiveTemp && tempSimSlider && sceneDebugEnabled() && !followLiveTemp.checked) {
            var v = parseInt(tempSimSlider.value, 10);
            if (!isNaN(v)) {
                return v;
            }
        }
        return lastWeatherTempF;
    }

    /** °F shown in footer caption (matches palette when simulating). */
    function captionDisplayTempF() {
        return effectivePaletteTempF();
    }

    function mountSceneDebugUi() {
        if (!sceneDebugEnabled()) {
            return;
        }
        var panel = document.createElement("div");
        panel.className = "tod-sim";
        panel.id = "tod-sim";

        var hint = document.createElement("p");
        hint.className = "tod-sim-debug-hint";
        hint.appendChild(document.createTextNode("Scene debug · "));
        var c1 = document.createElement("code");
        c1.textContent = "?sceneDebug=1";
        hint.appendChild(c1);
        hint.appendChild(document.createTextNode(" · "));
        var c2 = document.createElement("code");
        c2.textContent = "localStorage.removeItem('sceneDebug')";
        hint.appendChild(c2);
        hint.appendChild(document.createTextNode(" + reload · lab "));
        var c3 = document.createElement("code");
        c3.textContent = "?lab=1";
        hint.appendChild(c3);
        hint.appendChild(document.createTextNode(" · ink "));
        var c4 = document.createElement("code");
        c4.textContent = "?accentInkBump=0–14";
        hint.appendChild(c4);
        hint.appendChild(document.createTextNode(" · sim outdoor \u00b0F"));

        followReal = document.createElement("input");
        followReal.type = "checkbox";
        followReal.id = "tod-follow-real";
        followReal.checked = true;

        var checkLabel = document.createElement("label");
        checkLabel.className = "tod-sim-check";
        checkLabel.appendChild(followReal);
        checkLabel.appendChild(document.createTextNode(" Follow local time"));

        simSlider = document.createElement("input");
        simSlider.type = "range";
        simSlider.id = "tod-sim-slider";
        simSlider.min = "0";
        simSlider.max = "100";
        simSlider.value = "50";
        simSlider.disabled = true;

        var row = document.createElement("div");
        row.className = "tod-sim-row";
        var rangeLabel = document.createElement("label");
        rangeLabel.className = "tod-sim-range-label";
        rangeLabel.htmlFor = "tod-sim-slider";
        rangeLabel.appendChild(document.createTextNode("Simulate time of day ("));
        var tCode = document.createElement("code");
        tCode.textContent = "0–24h";
        rangeLabel.appendChild(tCode);
        rangeLabel.appendChild(document.createTextNode(", clock off)"));
        row.appendChild(rangeLabel);
        row.appendChild(simSlider);

        followLiveTemp = document.createElement("input");
        followLiveTemp.type = "checkbox";
        followLiveTemp.id = "tod-follow-live-temp";
        followLiveTemp.checked = true;

        var tempCheckLabel = document.createElement("label");
        tempCheckLabel.className = "tod-sim-check";
        tempCheckLabel.appendChild(followLiveTemp);
        tempCheckLabel.appendChild(document.createTextNode(" Follow live weather \u00b0F"));

        var tempRow = document.createElement("div");
        tempRow.className = "tod-sim-row";
        var tempRangeLabel = document.createElement("label");
        tempRangeLabel.className = "tod-sim-range-label";
        tempRangeLabel.htmlFor = "tod-temp-sim-slider";
        tempRangeLabel.appendChild(document.createTextNode("Simulate outdoor temp ("));
        var tempCode = document.createElement("code");
        tempCode.textContent = "\u221220\u2013110\u00b0F";
        tempRangeLabel.appendChild(tempCode);
        tempRangeLabel.appendChild(document.createTextNode(", live off)"));

        tempSimSlider = document.createElement("input");
        tempSimSlider.type = "range";
        tempSimSlider.id = "tod-temp-sim-slider";
        tempSimSlider.min = "-20";
        tempSimSlider.max = "110";
        tempSimSlider.step = "1";
        tempSimSlider.value = String(lastWeatherTempF != null && !isNaN(lastWeatherTempF) ? lastWeatherTempF : 54);
        tempSimSlider.disabled = true;

        tempRow.appendChild(tempRangeLabel);
        tempRow.appendChild(tempSimSlider);

        var bumpRow = document.createElement("div");
        bumpRow.className = "tod-sim-row";
        var bumpLabel = document.createElement("label");
        bumpLabel.className = "tod-sim-range-label";
        bumpLabel.htmlFor = "tod-accent-ink-bump";
        bumpLabel.appendChild(document.createTextNode("Hero accent ink · max "));
        var bumpCode = document.createElement("code");
        bumpCode.textContent = "L";
        bumpLabel.appendChild(bumpCode);
        bumpLabel.appendChild(document.createTextNode(" bump (dark on light, 0–14)"));
        accentBumpSlider = document.createElement("input");
        accentBumpSlider.type = "range";
        accentBumpSlider.id = "tod-accent-ink-bump";
        accentBumpSlider.min = "0";
        accentBumpSlider.max = "14";
        accentBumpSlider.value = String(readAccentInkBumpMax());
        bumpRow.appendChild(bumpLabel);
        bumpRow.appendChild(accentBumpSlider);

        panel.appendChild(hint);
        panel.appendChild(checkLabel);
        panel.appendChild(row);
        panel.appendChild(tempCheckLabel);
        panel.appendChild(tempRow);
        panel.appendChild(bumpRow);

        function finishSceneDebugMount() {
            document.body.appendChild(panel);
            accentBumpSlider.addEventListener("input", function () {
                liveAccentInkBump = parseInt(accentBumpSlider.value, 10);
                if (isNaN(liveAccentInkBump)) {
                    liveAccentInkBump = 0;
                }
                tick();
            });
            wireSceneDebugSliders();
        }

        if (document.body) {
            finishSceneDebugMount();
        } else {
            document.addEventListener("DOMContentLoaded", finishSceneDebugMount, { once: true });
        }
    }

    mountSceneDebugUi();

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(pointer: fine)").matches;

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function wrapHue(n) {
        return ((n % 360) + 360) % 360;
    }

    /** Shortest-path hue interpolation (cyclical ramp across midnight). */
    function lerpHue(h0, h1, t) {
        var a = wrapHue(h0);
        var b = wrapHue(h1);
        var d = ((b - a + 540) % 360) - 180;
        return wrapHue(a + d * t);
    }

    /** Solar elevation (degrees), same model as SunCalc `getPosition` (Meeus / astronomy). */
    function sunAltitudeDegrees(date, lat, lng) {
        var PI = Math.PI;
        var rad = PI / 180;
        var sin = Math.sin;
        var cos = Math.cos;
        var tan = Math.tan;
        var asin = Math.asin;
        var atan2 = Math.atan2;
        var e = rad * 23.4397;

        function rightAscension(l, b) {
            return atan2(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
        }

        function declination(l, b) {
            return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
        }

        function solarMeanAnomaly(d) {
            return rad * (357.5291 + 0.98560028 * d);
        }

        function eclipticLongitude(M) {
            var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M));
            var P = rad * 102.9372;
            return M + C + P + PI;
        }

        function sunCoords(d) {
            var M = solarMeanAnomaly(d);
            var L = eclipticLongitude(M);
            return { dec: declination(L, 0), ra: rightAscension(L, 0) };
        }

        function siderealTime(d, lw) {
            return rad * (280.16 + 360.9856235 * d) - lw;
        }

        function altitude(H, phi, dec) {
            return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
        }

        var dayMs = 1000 * 60 * 60 * 24;
        var J1970 = 2440588;
        var J2000 = 2451545;

        function toJulian(d) {
            return d.valueOf() / dayMs - 0.5 + J1970;
        }

        function toDays(d) {
            return toJulian(d) - J2000;
        }

        var lw = rad * -lng;
        var phi = rad * lat;
        var d = toDays(date);
        var c = sunCoords(d);
        var H = siderealTime(d, lw) - c.ra;
        return altitude(H, phi, c.dec) * (180 / PI);
    }

    function sceneDateFromClock(clockH) {
        if (simSlider && followReal && !followReal.checked) {
            var d = new Date();
            var h = clockH % 24;
            if (h < 0) {
                h += 24;
            }
            var hh = Math.floor(h);
            var mm = Math.min(59, Math.max(0, Math.floor((h - hh) * 60 + 1e-6)));
            d.setHours(hh, mm, 0, 0);
            return d;
        }
        return new Date();
    }

    function sunContextForScene(clockH) {
        var d = sceneDateFromClock(clockH);
        var ll = readAnchorLatLon();
        var altDeg = sunAltitudeDegrees(d, ll.lat, ll.lon);
        var darkSchemeAuto = !(altDeg > -6);
        var tz = effectiveSceneTimeZone();
        var hFloat = zonedClockHourFloat(d, tz);
        var goldenMorning = hFloat >= 4 && hFloat <= 11 && altDeg > 0 && altDeg < 12;
        var goldenEvening = hFloat >= 14 && hFloat <= 22 && altDeg > 0 && altDeg < 14;
        var golden = goldenMorning || goldenEvening;
        return {
            altDeg: altDeg,
            darkSchemeAuto: darkSchemeAuto,
            golden: golden,
            goldenMorning: goldenMorning,
            goldenEvening: goldenEvening,
        };
    }

    /**
     * Local hour 0–24 cyclical palette (H = degrees, S/L = 0–100 before % in CSS).
     * Midnight deep blue → pre-dawn → morning cream/yellow → cool day → golden hour → twilight blue → night.
     */
    var SCENE_H = [
        240, 239, 238, 237, 236, 246, 268, 48, 46, 44, 218, 215, 212, 210, 208, 52, 40, 18, 322, 278, 232, 236, 242,
        240,
    ];
    var SCENE_S = [
        36, 34, 32, 30, 28, 26, 22, 18, 22, 16, 12, 10, 9, 8, 10, 16, 24, 34, 24, 15, 14, 18, 32, 35,
    ];
    var SCENE_L = [
        7, 8, 8, 9, 10, 14, 24, 80, 86, 88, 90, 91, 92, 91, 90, 86, 76, 54, 44, 34, 26, 17, 12, 8,
    ];

    function clockHourFloat() {
        if (simSlider && followReal && !followReal.checked) {
            var v = parseInt(simSlider.value, 10);
            if (isNaN(v)) {
                v = 0;
            }
            return (v / 100) * 24;
        }
        var d = new Date();
        return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    }

    function sampleScene(clockH) {
        var h = clockH % 24;
        if (h < 0) {
            h += 24;
        }
        var i0 = Math.floor(h) % 24;
        var i1 = (i0 + 1) % 24;
        var fractRaw = h - Math.floor(h);
        var fract = 1 - Math.pow(1 - fractRaw, 1.58);
        return {
            h: lerpHue(SCENE_H[i0], SCENE_H[i1], fract),
            s: lerp(SCENE_S[i0], SCENE_S[i1], fract),
            l: lerp(SCENE_L[i0], SCENE_L[i1], fract),
        };
    }

    /** Warmer, slightly richer field during low-sun bands. */
    function applyGoldenTint(sampled, golden, goldenMorning) {
        if (!golden) {
            return sampled;
        }
        var warm = goldenMorning ? 44 : 302;
        var pull = goldenMorning ? 0.24 : 0.09;
        return {
            h: lerpHue(sampled.h, warm, pull),
            s: Math.min(92, sampled.s * (goldenMorning ? 1.1 : 1.04)),
            l: Math.min(94, Math.max(4, sampled.l + (goldenMorning ? 2.2 : -0.45))),
        };
    }

    /**
     * Outbound temperature only: small seasonal bias on the hourly palette (same anchor all year).
     * Cold → slight pull toward blue-violet; hot → toward warm cream. No-op until `lastWeatherTempF` is set.
     */
    function applyTempSeasonTint(sampled, tempF) {
        if (typeof tempF !== "number" || isNaN(tempF)) {
            return sampled;
        }
        // ~−1 (cold) … +1 (hot); tighter scale than before so seasonal swings read clearly
        var u = (tempF - 54) / 28;
        if (u > 1) {
            u = 1;
        }
        if (u < -1) {
            u = -1;
        }
        var coolTarget = 252;
        var warmTarget = 42;
        var target = u >= 0 ? warmTarget : coolTarget;
        var au = Math.abs(u);
        // Ease so mid-range temps still pick up a visible bias (not only extremes)
        var pull = (1 - Math.pow(1 - au, 1.35)) * 0.26;
        return {
            h: lerpHue(sampled.h, target, pull),
            s: Math.min(100, Math.max(0, sampled.s + u * 3.2)),
            l: Math.min(94, Math.max(4, sampled.l + u * 1.5)),
        };
    }

    /** Meta/body lightness from background L only (stable contrast on any hour). */
    function inkLFromBackground(bgN) {
        if (bgN >= 46) {
            return Math.round(Math.max(14, Math.min(36, 102 - 0.84 * bgN)));
        }
        return Math.round(Math.min(94, Math.max(72, bgN + 47)));
    }

    /**
     * Body + lede: near-neutral ink (fixed hue + very low S), with only a whisper of scene hue
     * so type never picks up obvious color from the hourly ramp.
     */
    function proseFromField(bgH, bgSNum, bgLNum) {
        var l = inkLFromBackground(bgLNum);
        var inkHue = 40;
        var huePull = bgLNum >= 48 ? 0.04 : 0.02;
        var h = Math.round(lerpHue(inkHue, bgH, huePull));
        var baseS = bgLNum >= 48 ? 6 : 4;
        var sMax = bgLNum >= 48 ? 11 : 7;
        var fgS = Math.round(Math.min(sMax, Math.max(3, baseS + bgSNum * 0.035)));
        var metaS = Math.max(3, Math.min(sMax, fgS - 1));
        return {
            fg: { h: h, s: fgS },
            meta: { h: h, s: metaS },
            l: l,
        };
    }

    function heroSLFromBg(bgH, bgSNum, bgLNum) {
        if (bgLNum >= 50) {
            return {
                s: Math.round(Math.min(58, Math.max(36, 34 + bgSNum * 0.4))),
                l: Math.round(Math.max(11, Math.min(26, 106 - bgLNum * 0.9))),
            };
        }
        return {
            s: Math.round(Math.min(56, Math.max(38, 38 + bgSNum * 0.28))),
            l: Math.round(Math.min(94, Math.max(76, 84 + bgLNum * 0.12))),
        };
    }

    /** Degrees added to scene bg hue for accent: complement on light panels; small step on dark (analogous family). */
    var ACCENT_HUE_OFFSET = 180;
    var ACCENT_HUE_OFFSET_ANALOG_DARK = 28;

    function hslToHex(h, s, l) {
        var rgb = hslToRgb(h, s, l);
        function byte(n) {
            var x = Math.round(Math.max(0, Math.min(255, n)));
            var hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }
        return ("#" + byte(rgb.r) + byte(rgb.g) + byte(rgb.b)).toLowerCase();
    }

    function scenePaletteAtHour(clockH) {
        var sunCtx = sunContextForScene(clockH);
        var darkScheme = sunCtx.darkSchemeAuto;
        var sampled = sampleScene(clockH);
        sampled = applyGoldenTint(sampled, sunCtx.golden, sunCtx.goldenMorning);
        sampled = applyTempSeasonTint(sampled, effectivePaletteTempF());
        var bgH = Math.round(sampled.h);
        var bgSNum = sampled.s;
        var bgL = sampled.l;
        if (darkScheme) {
            bgL = Math.min(bgL, 86);
        }
        var bgLNum = Math.round(bgL);
        var bgSRound = Math.round(bgSNum);
        var wantLightAccent = darkScheme;
        var nh = ((bgH % 360) + 360) % 360;
        var compHue = wrapHue(nh + ACCENT_HUE_OFFSET);
        var analHue = wrapHue(nh + ACCENT_HUE_OFFSET_ANALOG_DARK);
        var compPick = pickAccentSL(compHue, bgH, bgSRound, bgLNum, wantLightAccent, 3.2);
        var analPick = pickAccentSL(analHue, bgH, bgSRound, bgLNum, wantLightAccent, 3.2);
        return {
            sky: { h: bgH, s: bgSRound, l: bgLNum },
            complement: { h: Math.round(compHue), s: compPick.s, l: compPick.l },
            analogous: { h: Math.round(analHue), s: analPick.s, l: analPick.l },
        };
    }

    function formatSceneTimeLabel(clockH) {
        var h = clockH % 24;
        if (h < 0) {
            h += 24;
        }
        var hi = Math.floor(h);
        var mi = Math.round((h - hi) * 60);
        if (mi === 60) {
            hi = (hi + 1) % 24;
            mi = 0;
        }
        return (hi < 10 ? "0" : "") + hi + ":" + (mi < 10 ? "0" : "") + mi;
    }

    function formatRelativeSceneHours(clockH) {
        var now = sceneClockHourFloat() % 24;
        var delta = (clockH % 24) - now;
        if (delta > 12) {
            delta -= 24;
        }
        if (delta < -12) {
            delta += 24;
        }
        if (Math.abs(delta) < 0.08) {
            return "";
        }
        var hours = Math.round(delta);
        if (hours === 0) {
            var mins = Math.round(delta * 60);
            if (mins === 0) {
                return "";
            }
            return mins > 0 ? "(in about +" + mins + " min)" : "(about " + mins + " min ago)";
        }
        return hours > 0 ? "(in about +" + hours + " hours)" : "(about " + -hours + " hours ago)";
    }

    function paletteColorMeta(c) {
        return {
            hex: hslToHex(c.h, c.s, c.l),
            hsl: c.h + " " + c.s + "% " + c.l + "%",
        };
    }

    function buildDayBarTipRow(label, c) {
        var meta = paletteColorMeta(c);
        var row = document.createElement("div");
        row.className = "station-day-bar__tip-row";
        row.innerHTML =
            '<span class="station-day-bar__tip-label">' +
            label +
            '</span><span class="station-day-bar__tip-colon">:</span>' +
            '<span class="station-day-bar__tip-swatch" style="background:' +
            meta.hex +
            '"></span>' +
            '<span class="station-day-bar__tip-hex">' +
            meta.hex +
            '</span>' +
            '<span class="station-day-bar__tip-hsl">' +
            meta.hsl +
            "</span>";
        return row;
    }

    function buildDayBarTip(tipEl, clockH, showRelative) {
        if (!tipEl) {
            return;
        }
        var palette = scenePaletteAtHour(clockH);
        var rel = showRelative ? formatRelativeSceneHours(clockH) : "";
        tipEl.replaceChildren();
        var timeRow = document.createElement("p");
        timeRow.className = "station-day-bar__tip-time";
        timeRow.textContent = formatSceneTimeLabel(clockH);
        if (rel) {
            var relSpan = document.createElement("span");
            relSpan.className = "station-day-bar__tip-offset";
            relSpan.textContent = " " + rel;
            timeRow.appendChild(relSpan);
        }
        tipEl.appendChild(timeRow);
        tipEl.appendChild(buildDayBarTipRow("sky", palette.sky));
        tipEl.appendChild(buildDayBarTipRow("ink analog", palette.analogous));
        tipEl.appendChild(buildDayBarTipRow("ink complement", palette.complement));
    }

    function formatDayBarHint() {
        return "currently it is " + formatSceneTimeLabel(sceneClockHourFloat());
    }

    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;
        var c = (1 - Math.abs(2 * l - 1)) * s;
        var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        var m = l - c / 2;
        var rp = 0;
        var gp = 0;
        var bp = 0;
        if (h < 60) {
            rp = c;
            gp = x;
        } else if (h < 120) {
            rp = x;
            gp = c;
        } else if (h < 180) {
            gp = c;
            bp = x;
        } else if (h < 240) {
            gp = x;
            bp = c;
        } else if (h < 300) {
            rp = x;
            bp = c;
        } else {
            rp = c;
            bp = x;
        }
        return { r: (rp + m) * 255, g: (gp + m) * 255, b: (bp + m) * 255 };
    }

    function linearChannel(u) {
        u /= 255;
        return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
    }

    function luminanceFromHsl(h, s, l) {
        var rgb = hslToRgb(h, s, l);
        return 0.2126 * linearChannel(rgb.r) + 0.7152 * linearChannel(rgb.g) + 0.0722 * linearChannel(rgb.b);
    }

    function contrastRatio(lumA, lumB) {
        var hi = Math.max(lumA, lumB);
        var lo = Math.min(lumA, lumB);
        return (hi + 0.05) / (lo + 0.05);
    }

    /** WCAG 2.1 AA body text baseline; small multiplier for CSS prose opacity below 1. */
    var WCAG_AA_BODY_TEXT = 4.5;
    var WCAG_PROSE_HEADROOM = 1.06;

    /**
     * Adjust `--fg-*` / `--meta-*` lightness (then chroma) so body copy meets AA against the scene panel.
     * Runs after golden-hour hue tweaks so temp + time-of-day cannot push prose below target contrast.
     */
    function enforceProseWcagAgainstBg(prose, bgH, bgS, bgL) {
        var minCr = WCAG_AA_BODY_TEXT * WCAG_PROSE_HEADROOM;
        var bgSr = Math.round(bgS);
        var lumBg = luminanceFromHsl(bgH, bgSr, bgL);
        var h = prose.fg.h;
        var startL = prose.l;
        var startS = prose.fg.s;
        function crFor(L, sChroma) {
            var lumFg = luminanceFromHsl(
                h,
                Math.max(0, Math.min(100, sChroma)),
                Math.max(0, Math.min(100, L)),
            );
            return contrastRatio(lumBg, lumFg);
        }
        var L = startL;
        var s = startS;
        var iter;
        if (crFor(L, s) >= minCr) {
            return;
        }
        var lightPanel = lumBg > 0.42;
        for (iter = 0; iter < 90; iter++) {
            if (crFor(L, s) >= minCr) {
                prose.l = L;
                prose.fg.s = s;
                prose.meta.s = Math.max(2, Math.min(prose.meta.s, s - 1));
                return;
            }
            if (lightPanel) {
                L = Math.max(4, L - 1);
            } else {
                L = Math.min(96, L + 1);
            }
        }
        s = startS;
        while (s > 2) {
            s -= 1;
            L = startL;
            for (iter = 0; iter < 90; iter++) {
                if (crFor(L, s) >= minCr) {
                    prose.l = L;
                    prose.fg.s = s;
                    prose.meta.s = Math.max(2, Math.min(prose.meta.s, s - 1));
                    return;
                }
                if (lightPanel) {
                    L = Math.max(4, L - 1);
                } else {
                    L = Math.min(96, L + 1);
                }
            }
        }
        prose.l = lightPanel ? 10 : 94;
        prose.fg.s = 0;
        prose.meta.s = 0;
        prose.meta.h = prose.fg.h;
    }

    /**
     * Pick S/L on `accentHue` so contrast vs the panel meets `minRatio` (WCAG).
     * `wantLightAccent`: dark panels → light ink; light panels → dark ink.
     * For light-on-dark, avoid always snapping to L≈97 (hue disappears). Prefer L in the high-80s
     * with strong S first, then ease lighter only if contrast still fails.
     */
    function pickAccentSL(accentHue, bgH, bgS, bgL, wantLightAccent, minRatio) {
        var bgLum = luminanceFromHsl(bgH, bgS, bgL);
        var best = { s: 50, l: wantLightAccent ? 94 : 18, ratio: 0 };
        if (wantLightAccent) {
            var li;
            var s;
            var lum;
            var cr;
            for (li = 88; li <= 97; li += 1) {
                for (s = 90; s >= 22; s -= 3) {
                    lum = luminanceFromHsl(accentHue, s, li);
                    cr = contrastRatio(bgLum, lum);
                    if (cr >= minRatio) {
                        return { s: s, l: li, ratio: cr };
                    }
                    if (cr > best.ratio) {
                        best = { s: s, l: li, ratio: cr };
                    }
                }
            }
            for (li = 87; li >= 62; li -= 1) {
                for (s = 90; s >= 22; s -= 3) {
                    lum = luminanceFromHsl(accentHue, s, li);
                    cr = contrastRatio(bgLum, lum);
                    if (cr >= minRatio) {
                        return { s: s, l: li, ratio: cr };
                    }
                    if (cr > best.ratio) {
                        best = { s: s, l: li, ratio: cr };
                    }
                }
            }
            for (li = 98; li <= 100; li += 1) {
                for (s = 90; s >= 22; s -= 3) {
                    lum = luminanceFromHsl(accentHue, s, li);
                    cr = contrastRatio(bgLum, lum);
                    if (cr >= minRatio) {
                        return { s: s, l: li, ratio: cr };
                    }
                    if (cr > best.ratio) {
                        best = { s: s, l: li, ratio: cr };
                    }
                }
            }
        } else {
            for (var s2 = 84; s2 >= 20; s2 -= 3) {
                for (var ld = 15; ld <= 48; ld += 1) {
                    var lum2 = luminanceFromHsl(accentHue, s2, ld);
                    var cr2 = contrastRatio(bgLum, lum2);
                    if (cr2 >= minRatio) {
                        return { s: s2, l: ld, ratio: cr2 };
                    }
                    if (cr2 > best.ratio) {
                        best = { s: s2, l: ld, ratio: cr2 };
                    }
                }
            }
        }
        return best;
    }

    /**
     * Nudge dark hero accent ink slightly lighter on light panels, without breaking `minRatio`.
     * Tries higher L first (up to `capL` and `l + maxBump`).
     */
    function bumpDarkInkL(accentHue, bgH, bgSRound, bgLNum, s, l, minRatio, maxBump, capL) {
        if (maxBump <= 0) {
            return l;
        }
        var bgLum = luminanceFromHsl(bgH, bgSRound, bgLNum);
        var top = Math.min(capL, l + maxBump);
        var tryL;
        for (tryL = top; tryL > l; tryL--) {
            var lum = luminanceFromHsl(accentHue, s, tryL);
            if (contrastRatio(bgLum, lum) >= minRatio) {
                return tryL;
            }
        }
        return l;
    }

    function applyHeroHueFromScene() {
        if (!hero) {
            return;
        }
        hero.style.setProperty("--hero-h", String(Math.round(sceneHueForHero)));
        syncHeroCursor();
    }

    var lastHeroCursorRgb = "";

    function buildHeroCircleCursor(rgbCss, fillOpacity) {
        var svg =
            "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>" +
            "<circle cx='16' cy='16' r='12' fill='" +
            rgbCss +
            "' fill-opacity='" +
            fillOpacity +
            "'/></svg>";
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") 16 16, auto';
    }

    /** Soft overlay circle matching computed `.hero` headline color (fine pointer only). */
    function syncHeroCursor() {
        if (!finePointer || !hero) {
            return;
        }
        var rgb = getComputedStyle(hero).color;
        if (rgb === lastHeroCursorRgb) {
            return;
        }
        lastHeroCursorRgb = rgb;
        root.style.setProperty("--hero-cursor-rest", buildHeroCircleCursor(rgb, 0.26));
        root.style.setProperty("--hero-cursor-hover", buildHeroCircleCursor(rgb, 0.5));
        root.style.setProperty("--hero-cursor-fill", rgb);
    }

    var lastSceneChromeKey = "";

    /** Tab icon + `theme-color`: scene background (same H/S/L as `--bg-*`). */
    function syncFaviconFromBg(h, sRound, lPct) {
        var key = String(h) + "-" + String(sRound) + "-" + String(lPct);
        if (key === lastSceneChromeKey) {
            return;
        }
        lastSceneChromeKey = key;
        var fill = "hsl(" + h + " " + sRound + "% " + lPct + "%)";
        var svg =
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='15' fill='" +
            fill +
            "'/></svg>";
        var href = "data:image/svg+xml," + encodeURIComponent(svg);
        var link = document.getElementById("dynamic-favicon");
        if (!link) {
            link = document.createElement("link");
            link.id = "dynamic-favicon";
            link.rel = "icon";
            link.type = "image/svg+xml";
            document.head.appendChild(link);
        }
        link.href = href;

        var meta = document.getElementById("dynamic-theme-color");
        if (!meta) {
            meta = document.createElement("meta");
            meta.id = "dynamic-theme-color";
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", fill);
    }

    function applyScene(clockH) {
        var paletteHour = sceneClockHourFloat();
        var sunCtx = sunContextForScene(clockH);
        var darkScheme = sunCtx.darkSchemeAuto;
        root.dataset.appearance = darkScheme ? "dark" : "light";

        var sampled = sampleScene(paletteHour);
        sampled = applyGoldenTint(sampled, sunCtx.golden, sunCtx.goldenMorning);
        sampled = applyTempSeasonTint(sampled, effectivePaletteTempF());
        var bgH = Math.round(sampled.h);
        var bgSNum = sampled.s;
        var bgL = sampled.l;
        if (darkScheme) {
            bgL = Math.min(bgL, 86);
        }
        var bgLNum = Math.round(bgL);
        sceneHueForHero = bgH;

        /** Sun-based `appearance` can stay light while the hourly panel is already dim; invert marks like full dark. */
        var panelLum = luminanceFromHsl(bgH, Math.round(bgSNum), bgLNum);
        if (!darkScheme && panelLum < 0.52) {
            root.dataset.heroLogos = "inverted";
        } else {
            delete root.dataset.heroLogos;
        }

        root.style.setProperty("--bg-h", String(bgH));
        root.style.setProperty("--bg-s", Math.round(bgSNum) + "%");
        root.style.setProperty("--bg-l", bgLNum + "%");

        var chromaPopS = Math.min(100, Math.round(Math.round(bgSNum) * 1.15 + 28));
        var chromaPopL;
        var washAlpha;
        if (darkScheme) {
            chromaPopL = Math.min(44, Math.round(bgLNum + 14));
            washAlpha = 0.34;
        } else {
            chromaPopL = Math.max(62, Math.min(90, Math.round(bgLNum - 6)));
            washAlpha = 0.16;
        }
        root.style.setProperty("--bg-chroma-pop-s", chromaPopS + "%");
        root.style.setProperty("--bg-chroma-pop-l", chromaPopL + "%");
        root.style.setProperty(
            "--link-hover-wash",
            "hsl(" + bgH + " " + chromaPopS + "% " + chromaPopL + "% / " + washAlpha + ")"
        );

        syncFaviconFromBg(bgH, Math.round(bgSNum), bgLNum);

        var inkL = inkLFromBackground(bgLNum);
        var prose = proseFromField(bgH, bgSNum, bgLNum);
        if (sunCtx.golden) {
            var g = sunCtx.goldenMorning ? 0.12 : 0.1;
            prose.fg.h = Math.round(lerpHue(prose.fg.h, sunCtx.goldenMorning ? 38 : 32, g));
            prose.meta.h = Math.round(lerpHue(prose.meta.h, sunCtx.goldenMorning ? 36 : 30, g * 0.85));
            prose.fg.s = Math.min(12, Math.round(prose.fg.s + 1));
            prose.meta.s = Math.min(11, Math.round(prose.meta.s + 1));
        }
        enforceProseWcagAgainstBg(prose, bgH, Math.round(bgSNum), bgLNum);
        root.style.setProperty("--fg-h", String(prose.fg.h));
        root.style.setProperty("--fg-s", prose.fg.s + "%");
        root.style.setProperty("--fg-l", prose.l + "%");
        root.style.setProperty("--meta-h", String(prose.meta.h));
        root.style.setProperty("--meta-s", prose.meta.s + "%");
        root.style.setProperty("--meta-l", prose.l + "%");

        var heroSL = heroSLFromBg(bgH, bgSNum, bgLNum);
        var hsNum = heroSL.s;
        var hlNum = heroSL.l;
        if (darkScheme && bgLNum < 44) {
            hlNum = Math.max(hlNum, 82);
            hsNum = Math.min(58, hsNum + 10);
        }

        var nh = ((Math.round(bgH) % 360) + 360) % 360;
        var wantLightAccent = darkScheme;
        var dimPanelForAccent = panelLum < 0.52;
        var primaryAnalogous = wantLightAccent || dimPanelForAccent;
        var accentHue = wrapHue(
            nh + (primaryAnalogous ? ACCENT_HUE_OFFSET_ANALOG_DARK : ACCENT_HUE_OFFSET)
        );
        var accentHueHover = wrapHue(
            nh + (primaryAnalogous ? ACCENT_HUE_OFFSET : ACCENT_HUE_OFFSET_ANALOG_DARK)
        );
        var bgSRound = Math.round(bgSNum);
        var bgLum = luminanceFromHsl(bgH, bgSRound, bgLNum);

        var headPick = pickAccentSL(accentHue, bgH, bgSRound, bgLNum, wantLightAccent, 3.2);
        var bodyPick = pickAccentSL(accentHue, bgH, bgSRound, bgLNum, wantLightAccent, 4.55);

        var accentS = headPick.s;
        var accentL = headPick.l;
        var inkBumpMax = readAccentInkBumpMax();
        if (!wantLightAccent && inkBumpMax > 0) {
            accentL = bumpDarkInkL(accentHue, bgH, bgSRound, bgLNum, accentS, accentL, 3.2, inkBumpMax, ACCENT_INK_L_CAP);
        }

        var accentMutedS = Math.max(14, Math.round(bodyPick.s - 8));
        var accentLede = bodyPick.l;
        if (!wantLightAccent && inkBumpMax > 0) {
            accentLede = bumpDarkInkL(
                accentHue,
                bgH,
                bgSRound,
                bgLNum,
                bodyPick.s,
                accentLede,
                4.55,
                inkBumpMax,
                ACCENT_INK_L_CAP
            );
        }
        var ledeLum = luminanceFromHsl(accentHue, accentMutedS, accentLede);
        var g = 0;
        while (g < 30 && contrastRatio(bgLum, ledeLum) < 4.5 && accentMutedS < bodyPick.s + 2) {
            accentMutedS += 2;
            ledeLum = luminanceFromHsl(accentHue, accentMutedS, accentLede);
            g += 1;
        }
        if (contrastRatio(bgLum, ledeLum) < 4.5) {
            accentMutedS = bodyPick.s;
            accentLede = bodyPick.l;
        }

        var headPickHover = pickAccentSL(accentHueHover, bgH, bgSRound, bgLNum, wantLightAccent, 3.2);
        var accentHoverS = headPickHover.s;
        var accentHoverL = headPickHover.l;
        if (!wantLightAccent && inkBumpMax > 0) {
            accentHoverL = bumpDarkInkL(
                accentHueHover,
                bgH,
                bgSRound,
                bgLNum,
                accentHoverS,
                accentHoverL,
                3.2,
                inkBumpMax,
                ACCENT_INK_L_CAP
            );
        }

        root.style.setProperty("--accent-h", String(accentHue));
        root.style.setProperty("--accent-s", accentS + "%");
        root.style.setProperty("--accent-l", accentL + "%");
        root.style.setProperty("--accent-s-muted", accentMutedS + "%");
        root.style.setProperty(
            "--accent-color",
            "hsl(" + accentHue + " " + accentS + "% " + accentL + "%)"
        );
        root.style.setProperty(
            "--accent-color-muted",
            "hsl(" + accentHue + " " + accentMutedS + "% " + accentLede + "% / 0.98)"
        );
        root.style.setProperty("--accent-hover-h", String(accentHueHover));
        root.style.setProperty("--accent-hover-s", accentHoverS + "%");
        root.style.setProperty("--accent-hover-l", accentHoverL + "%");
        root.style.setProperty(
            "--accent-color-hover",
            "hsl(" + accentHueHover + " " + accentHoverS + "% " + accentHoverL + "%)"
        );
        var sepiaPivot = 35;
        root.style.setProperty("--logo-hue-rotate", wrapHue(Math.round(accentHue) - sepiaPivot) + "deg");
        root.style.setProperty("--all-works-h", String(accentHue));
        root.style.setProperty("--all-works-s", accentS + "%");
        root.style.setProperty("--all-works-l", accentL + "%");

        if (!hero) {
            return;
        }

        hero.style.setProperty("--hero-s", hsNum + "%");
        hero.style.setProperty("--hero-l", hlNum + "%");

        applyHeroHueFromScene();
    }

    function greetingFromHour(h) {
        if (h >= 5 && h < 12) {
            return "good morning";
        }
        if (h >= 12 && h < 17) {
            return "good afternoon";
        }
        if (h >= 17 && h < 22) {
            return "good evening";
        }
        return "good night";
    }

    /** Discrete phase for the hourly palette (and low-sun accents when `sunCtx` is passed). */
    function scenePhaseFromClockHour(clockH, sunCtx) {
        if (sunCtx && sunCtx.golden) {
            return sunCtx.goldenMorning ? "sunrise-golden" : "sunset-golden";
        }
        var h = Math.floor(clockH % 24);
        if (h < 0) {
            h += 24;
        }
        if (h >= 22 || h < 5) {
            return "night";
        }
        if (h < 8) {
            return "dawn";
        }
        if (h < 17) {
            return "day";
        }
        if (h < 20) {
            return "sunset";
        }
        return "twilight";
    }

    function updateSceneLegibility(clockH) {
        var ph = sceneClockHourFloat();
        var sunCtx = sunContextForScene(clockH);
        var phase = scenePhaseFromClockHour(ph, sunCtx);
        root.dataset.scenePhase = phase;
    }

    function formatLatLonLine(lat, lon) {
        var ns = lat >= 0 ? "N" : "S";
        var ew = lon >= 0 ? "E" : "W";
        return Math.abs(lat).toFixed(2) + "\u00b0" + ns + " " + Math.abs(lon).toFixed(2) + "\u00b0" + ew;
    }

    function readFooterCaptionIntroDismissed() {
        try {
            return window.sessionStorage.getItem(FOOTER_CAPTION_INTRO_KEY) === "1";
        } catch (eIntroRead) {
            return false;
        }
    }

    function shouldShowFooterCaptionIntro() {
        if (readFooterCaptionIntroDismissed()) {
            return false;
        }
        if (readFooterAnchorMode() === "here" && readStoredGeoCoords()) {
            return false;
        }
        return true;
    }

    function cancelFooterCaptionIntroAnimations() {
        window.clearTimeout(footerCaptionTypeTick);
        footerCaptionTypeTick = 0;
        if (footerCaptionIntroTimer) {
            window.clearTimeout(footerCaptionIntroTimer);
            footerCaptionIntroTimer = null;
        }
        footerCaptionIntroRunning = false;
        var capStop = document.getElementById("footer-caption");
        if (capStop) {
            capStop.classList.remove("footer-caption--glitch", "footer-caption--fade-to-live");
        }
    }

    function markFooterCaptionIntroDismissed() {
        try {
            window.sessionStorage.setItem(FOOTER_CAPTION_INTRO_KEY, "1");
        } catch (eIntroWrite) {
            /* ignore */
        }
    }

    function footerCaptionIntroReducedMotion() {
        try {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (eRm) {
            return false;
        }
    }

    function footerCaptionGlitchEase(t) {
        return t * t * (3 - 2 * t);
    }

    function ensureFooterCaptionTypeNodes(cap) {
        var textEl = cap.querySelector(".footer-caption-type__text");
        var caretEl = cap.querySelector(".footer-caption-type__caret");
        if (!textEl) {
            textEl = document.createElement("span");
            textEl.className = "footer-caption-type__text";
            cap.appendChild(textEl);
        }
        if (!caretEl) {
            caretEl = document.createElement("span");
            caretEl.className = "footer-caption-type__caret sky-cursor-type__caret";
            caretEl.setAttribute("aria-hidden", "true");
            cap.appendChild(caretEl);
        }
        return { textEl: textEl, caretEl: caretEl };
    }

    function zonedDateTimeParts(now, tz) {
        var wd = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" })
            .format(now)
            .toLowerCase();
        var dateFmt = new Intl.DateTimeFormat("en-GB", {
            timeZone: tz,
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        var timeFmt;
        try {
            timeFmt = new Intl.DateTimeFormat("en-GB", {
                timeZone: tz,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                hourCycle: "h23",
            });
        } catch (eTf) {
            timeFmt = new Intl.DateTimeFormat("en-GB", {
                timeZone: tz,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        }
        var day = "";
        var month = "";
        var year = "";
        var hh = "";
        var mm = "";
        var dparts = dateFmt.formatToParts(now);
        var i;
        for (i = 0; i < dparts.length; i++) {
            if (dparts[i].type === "day") {
                day = dparts[i].value;
            }
            if (dparts[i].type === "month") {
                month = dparts[i].value.toLowerCase();
            }
            if (dparts[i].type === "year") {
                year = dparts[i].value;
            }
        }
        var tparts = timeFmt.formatToParts(now);
        for (i = 0; i < tparts.length; i++) {
            if (tparts[i].type === "hour") {
                hh = tparts[i].value;
            }
            if (tparts[i].type === "minute") {
                mm = tparts[i].value;
            }
        }
        if (hh === "" || mm === "") {
            var tf = timeFmt.format(now).replace(/\u202f|\u00a0/g, " ").trim();
            var hm = tf.match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
            if (hm) {
                hh = hm[1];
                mm = hm[2];
            }
        }
        var hi = parseInt(hh || "0", 10);
        var mi = parseInt(mm || "0", 10);
        if (isNaN(hi)) {
            hi = 0;
        }
        if (isNaN(mi)) {
            mi = 0;
        }
        hh = hi < 10 ? "0" + hi : String(hi);
        mm = mi < 10 ? "0" + mi : String(mi);
        return { wd: wd, day: day, month: month, year: year, hh: hh, mm: mm };
    }

    function buildStationReadingsText(clockH) {
        void clockH;
        var now = new Date();
        var tz = effectiveSceneTimeZone();
        var p = zonedDateTimeParts(now, tz);
        var parts = [p.wd + " " + p.day + " " + p.month, p.hh + ":" + p.mm];
        var capTemp = captionDisplayTempF();
        if (capTemp != null && !isNaN(capTemp)) {
            parts.push(Math.round(capTemp) + "\u00b0");
        }
        parts.push(readDisplayPlaceLower());
        return parts.join(" \u00b7 ");
    }

    function updateStationReadings(clockH) {
        var el = document.getElementById("station-readings");
        if (!el) {
            return;
        }
        var text = buildStationReadingsText(clockH);
        var span = el.querySelector("[data-station-readings-text]");
        if (span) {
            span.textContent = text;
        } else {
            el.textContent = text;
        }
    }

    function updateStationDayBar() {
        var bar = document.getElementById("station-day-bar");
        var marker = document.getElementById("station-day-bar-marker");
        var hint = document.getElementById("station-day-hint");
        var tip = document.getElementById("station-day-tip");
        if (!bar || bar.dataset.active === "true") {
            return;
        }
        var h = sceneClockHourFloat() % 24;
        if (h < 0) {
            h += 24;
        }
        var pct = (h / 24) * 100;
        bar.style.setProperty("--station-day-pct", String(pct));
        if (marker) {
            marker.style.left = pct + "%";
        }
        if (tip) {
            tip.style.left = pct + "%";
        }
        if (hint) {
            hint.textContent = formatDayBarHint();
        }
    }

    function buildFooterCaptionText(clockH) {
        void clockH;
        var now = new Date();
        var tz = effectiveSceneTimeZone();
        var p = zonedDateTimeParts(now, tz);
        var hFloat = zonedClockHourFloat(now, tz);
        var greet = greetingFromHour(hFloat);
        var place = readDisplayPlaceLower();
        var core =
            greet +
            ", it's " +
            p.wd +
            " " +
            p.day +
            " " +
            p.month +
            " " +
            p.year +
            ", " +
            p.hh +
            ":" +
            p.mm;
        var capTemp = captionDisplayTempF();
        if (capTemp != null && !isNaN(capTemp)) {
            core += " and " + Math.round(capTemp) + "\u00b0 in " + place;
        } else {
            core += " in " + place;
        }
        return core;
    }

    function runFooterCaptionGlitch(cap, textEl, from, to, onDone) {
        var pool = FOOTER_GLITCH_CHARSET + from + to;
        var step = 0;
        var stepMs = Math.max(16, Math.round(FOOTER_CAPTION_GLITCH_MS / FOOTER_CAPTION_GLITCH_STEPS));
        cap.classList.add("footer-caption--glitch");

        function glitchChar() {
            return pool.charAt(Math.floor(Math.random() * pool.length));
        }

        function frame() {
            if (!footerCaptionIntroRunning) {
                cap.classList.remove("footer-caption--glitch");
                return;
            }
            step += 1;
            var t = footerCaptionGlitchEase(Math.min(1, step / FOOTER_CAPTION_GLITCH_STEPS));
            var fromLen = from.length;
            var toLen = to.length;
            var len = Math.max(1, Math.round(fromLen + (toLen - fromLen) * t));
            var reveal = Math.floor(t * (toLen + 8));
            var out = "";
            var j;
            for (j = 0; j < len; j++) {
                if (j < reveal && j < toLen) {
                    out += to.charAt(j);
                } else if (j < toLen && Math.random() < t * 0.72) {
                    out += to.charAt(j);
                } else {
                    out += glitchChar();
                }
            }
            textEl.textContent = out;
            if (step >= FOOTER_CAPTION_GLITCH_STEPS) {
                cap.classList.remove("footer-caption--glitch");
                textEl.textContent = to;
                onDone();
                return;
            }
            footerCaptionTypeTick = window.setTimeout(frame, stepMs);
        }

        frame();
    }

    function transitionFooterCaptionIntroToLive(skipGlitch) {
        var cap = document.getElementById("footer-caption");
        if (!cap) {
            markFooterCaptionIntroDismissed();
            footerCaptionIntroRunning = false;
            updateFooterCaption(clockHourFloat());
            return;
        }
        window.clearTimeout(footerCaptionIntroTimer);
        footerCaptionIntroTimer = null;
        window.clearTimeout(footerCaptionTypeTick);
        footerCaptionTypeTick = 0;

        var target = buildFooterCaptionText(clockHourFloat());
        var nodes = ensureFooterCaptionTypeNodes(cap);
        var textEl = nodes.textEl;
        var caretEl = nodes.caretEl;
        var from = textEl.textContent || FOOTER_INTRO_LINE;
        caretEl.classList.add("sky-cursor-type__caret--done");

        if (skipGlitch || footerCaptionIntroReducedMotion()) {
            if (footerCaptionIntroReducedMotion() && !skipGlitch) {
                cap.classList.add("footer-caption--fade-to-live");
                footerCaptionIntroTimer = window.setTimeout(function () {
                    cap.classList.remove("footer-caption--fade-to-live");
                    markFooterCaptionIntroDismissed();
                    footerCaptionIntroRunning = false;
                    updateFooterCaption(clockHourFloat());
                }, 360);
                return;
            }
            markFooterCaptionIntroDismissed();
            footerCaptionIntroRunning = false;
            updateFooterCaption(clockHourFloat());
            return;
        }

        footerCaptionIntroRunning = true;
        runFooterCaptionGlitch(cap, textEl, from, target, function () {
            markFooterCaptionIntroDismissed();
            footerCaptionIntroRunning = false;
            updateFooterCaption(clockHourFloat());
        });
    }

    function dismissFooterCaptionIntro(skipGlitch) {
        transitionFooterCaptionIntroToLive(!!skipGlitch);
    }

    function runFooterCaptionIntroSequence() {
        var cap = document.getElementById("footer-caption");
        if (!cap || !shouldShowFooterCaptionIntro()) {
            return;
        }
        cancelFooterCaptionIntroAnimations();
        footerCaptionIntroRunning = true;
        cap.replaceChildren();
        var nodes = ensureFooterCaptionTypeNodes(cap);
        var textEl = nodes.textEl;
        var caretEl = nodes.caretEl;
        textEl.textContent = "";
        caretEl.classList.remove("sky-cursor-type__caret--done");

        function holdThenGlitch() {
            if (!footerCaptionIntroRunning) {
                return;
            }
            caretEl.classList.add("sky-cursor-type__caret--done");
            var holdMs = footerCaptionIntroReducedMotion()
                ? Math.min(FOOTER_CAPTION_INTRO_HOLD_MS, 4200)
                : FOOTER_CAPTION_INTRO_HOLD_MS;
            footerCaptionIntroTimer = window.setTimeout(function () {
                transitionFooterCaptionIntroToLive(false);
            }, holdMs);
        }

        if (footerCaptionIntroReducedMotion()) {
            textEl.textContent = FOOTER_INTRO_LINE;
            holdThenGlitch();
            return;
        }

        var idx = 0;
        function typeStep() {
            if (!footerCaptionIntroRunning) {
                return;
            }
            if (idx >= FOOTER_INTRO_LINE.length) {
                holdThenGlitch();
                return;
            }
            textEl.textContent += FOOTER_INTRO_LINE.charAt(idx);
            idx += 1;
            caretEl.classList.remove("sky-cursor-type__caret--done");
            footerCaptionTypeTick = window.setTimeout(typeStep, FOOTER_CAPTION_TYPE_CHAR_MS);
        }
        typeStep();
    }

    function scheduleFooterCaptionIntro() {
        if (!shouldShowFooterCaptionIntro() || footerCaptionIntroStarted) {
            return;
        }
        footerCaptionIntroStarted = true;
        runFooterCaptionIntroSequence();
    }

    function syncFooterSkyTooltip(trackingOverride, customMessage) {
        var tips = document.querySelectorAll(".frost-tooltip.sky-ui-chip .frost-tooltip__text");
        if (!tips.length) {
            return;
        }
        var hereOn = readFooterAnchorMode() === "here" && !!readStoredGeoCoords();
        var full;
        if (customMessage) {
            full = customMessage;
        } else if (hereOn || trackingOverride) {
            var slug =
                trackingOverride != null && String(trackingOverride).trim()
                    ? String(trackingOverride).trim()
                    : trackingPlaceSlug();
            full = "tracking " + slug + "...";
        } else {
            full = FOOTER_SKY_TOOLTIP_DEFAULT;
        }
        document.querySelectorAll(".frost-tooltip.sky-ui-chip").forEach(function (tipRoot) {
            tipRoot.dataset.tipText = full;
            var textEl = tipRoot.querySelector(".frost-tooltip__text");
            if (textEl) {
                textEl.textContent = full;
            }
        });
    }

    function showFooterSkyDenyFeedback() {
        window.clearTimeout(footerSkyDenyResetId);
        syncFooterSkyTooltip(null, FOOTER_SKY_TOOLTIP_DENIED);
        footerSkyDenyResetId = window.setTimeout(function () {
            footerSkyDenyResetId = 0;
            syncFooterSkyTooltip();
        }, 5200);
    }

    function updateFooterCaption(clockH) {
        updateStationReadings(clockH);
        updateStationDayBar();
        var cap = document.getElementById("footer-caption");
        var labEl = document.getElementById("footer-lab");
        if (!cap) {
            return;
        }
        if (shouldShowFooterCaptionIntro() || footerCaptionIntroRunning) {
            if (shouldShowFooterCaptionIntro() && !footerCaptionIntroStarted) {
                scheduleFooterCaptionIntro();
            }
            if (labEl) {
                labEl.setAttribute("hidden", "");
                labEl.textContent = "";
                labEl.setAttribute("aria-hidden", "true");
            }
            return;
        }
        var core = buildFooterCaptionText(clockH);
        cap.replaceChildren();
        cap.appendChild(document.createTextNode(core));
        footerCaptionIntroStarted = false;

        if (labEl) {
            if (labPlaygroundEnabled()) {
                var ll = readAnchorLatLon();
                labEl.textContent = formatLatLonLine(ll.lat, ll.lon) + " · lab";
                labEl.removeAttribute("hidden");
                labEl.setAttribute("aria-hidden", "false");
            } else {
                labEl.setAttribute("hidden", "");
                labEl.textContent = "";
                labEl.setAttribute("aria-hidden", "true");
            }
        }
        ensureFooterGeoDebugWired();
        syncFooterGeoDebugPanel();
    }

    function syncFooterSkyToggle() {
        var btn = document.getElementById("footer-sky-toggle");
        if (!btn) {
            syncFooterSkyTooltip();
            return;
        }
        var hereOn = readFooterAnchorMode() === "here" && !!readStoredGeoCoords();
        btn.setAttribute("aria-pressed", hereOn ? "true" : "false");
        if (hereOn) {
            btn.setAttribute("aria-label", "Use St. Louis (home sky)");
        } else {
            btn.setAttribute(
                "aria-label",
                "Use your location for the hourly palette instead of St. Louis",
            );
        }
        btn.removeAttribute("title");
        syncFooterSkyTooltip();
    }

    function clearGeoPlaceCache() {
        try {
            window.localStorage.removeItem(FOOTER_GEO_PLACE_KEY);
        } catch (eClr) {
            /* ignore */
        }
    }

    function trackingPlaceSlug() {
        var c = readDisplayPlaceLower();
        if (!c || c === "here") {
            return "your location";
        }
        return String(c).replace(/,/g, " ").replace(/\s+/g, " ").trim();
    }

    function initFooterSkyToggle() {
        normalizeFooterAnchorState();
        var btn = document.getElementById("footer-sky-toggle");
        syncFooterSkyToggle();
        if (!btn) {
            return;
        }
        btn.addEventListener("click", function () {
            dismissFooterCaptionIntro(true);
            var hereOn = readFooterAnchorMode() === "here" && !!readStoredGeoCoords();
            if (hereOn) {
                writeFooterAnchorMode("stl");
                syncFooterSkyToggle();
                lastWeatherAttempt = 0;
                lastWeatherTempF = null;
                tick();
                return;
            }
            var cached = readStoredGeoCoords();
            if (cached) {
                writeFooterAnchorMode("here");
                syncFooterSkyToggle();
                lastWeatherAttempt = 0;
                lastWeatherTempF = null;
                tick();
                return;
            }
            if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[footer geo] Geolocation API not available (needs HTTPS in most browsers).");
                }
                return;
            }
            if (
                window.isSecureContext === false &&
                typeof console !== "undefined" &&
                console.warn
            ) {
                console.warn(
                    "[footer geo] Page is not a secure context; geolocation may be blocked. Serve over HTTPS.",
                );
            }
            btn.disabled = true;
            syncFooterSkyTooltip("your location");
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    clearGeoPlaceCache();
                    writeStoredGeoCoords(pos.coords.latitude, pos.coords.longitude);
                    writeFooterAnchorMode("here");
                    btn.disabled = false;
                    lastWeatherAttempt = 0;
                    lastWeatherTempF = null;
                    syncFooterSkyTooltip();
                    tick();
                },
                function (err) {
                    btn.disabled = false;
                    var why = "unknown";
                    if (err && typeof err.code === "number") {
                        if (err.code === 1) {
                            why = "permission denied";
                        } else if (err.code === 2) {
                            why = "position unavailable";
                        } else if (err.code === 3) {
                            why = "timeout";
                        } else {
                            why = "code " + err.code;
                        }
                    }
                    if (err && err.code === 1) {
                        showFooterSkyDenyFeedback();
                    } else {
                        syncFooterSkyTooltip();
                    }
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[footer geo] " + why);
                    }
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 },
            );
        });
    }

    function tick() {
        hero = document.querySelector(".hero");
        var hour = clockHourFloat();
        applyScene(hour);
        updateSceneLegibility(hour);
        if (followReal && followReal.checked && simSlider) {
            simSlider.value = String(Math.min(100, Math.max(0, Math.round((hour % 24) * (100 / 24)))));
        }
        maybeRefreshPlaceName();
        updateFooterCaption(hour);
        updateStationDayBar();
        syncFooterSkyToggle();
        maybeRefreshWeather();
    }

    function bindDomDependentChrome() {
        hero = document.querySelector(".hero");
        initFooterSkyToggle();
        ensureFooterGeoDebugWired();
        syncFooterGeoDebugPanel();
        refreshGeoDebugInputsFromStorage();
        scheduleFooterCaptionIntro();
        tick();
    }

    function startPeriodicTimers() {
        var SCENE_TICK_MS = 5000;
        window.setInterval(tick, SCENE_TICK_MS);

        /** Footer clock + greeting: own timer so time still advances when the scene interval is throttled (background tab). */
        var FOOTER_CLOCK_MS = 1000;
        window.setInterval(function () {
            updateFooterCaption(clockHourFloat());
        }, FOOTER_CLOCK_MS);

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                tick();
            }
        });
    }

    if (document.readyState === "loading") {
        tick();
        document.addEventListener(
            "DOMContentLoaded",
            function () {
                bindDomDependentChrome();
                startPeriodicTimers();
            },
            { once: true },
        );
    } else {
        bindDomDependentChrome();
        startPeriodicTimers();
    }

    window.pandjiSky = {
        updateStationReadings: function () {
            updateStationReadings(clockHourFloat());
        },
        updateStationDayBar: function () {
            updateStationDayBar();
        },
        getStationReadingsText: function () {
            return buildStationReadingsText(clockHourFloat());
        },
        getSceneClockHour: function () {
            return sceneClockHourFloat();
        },
        buildDayBarTip: buildDayBarTip,
        formatDayBarHint: formatDayBarHint,
    };
})();
