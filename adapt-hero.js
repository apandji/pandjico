/**
 * Adaptive scene: hourly cyclical palette → `--bg-*`, type, hero title.
 *
 * — Background: 24 knots H/S/L, eased blend within the hour; 23:00 → 00:00 wraps to midnight blue.
 * — Light/dark: always from civil twilight at the chosen “sky anchor” (no manual theme).
 * — Anchor: St. Louis (America/Chicago) by default, or “your sky” after geolocation (cached in localStorage).
 * — Hourly palette + greetings follow the same anchor’s clock.
 * — Hero + CTAs: `--accent-*` on `:root` — hue is bg + 180° (complement) on bright panels; bg + ~28° (analogous) when the panel reads dim (same luminance band as inverted client marks) or in full night (`data-appearance="dark"`). S/L are contrast-picked for WCAG; light-on-dark picks favor saturated high-80s L so hue stays visible.
 * — Client logos: tinted monochrome via CSS `filter` (`--logo-hue-rotate` from accent hue); no image libs.
 * — Hover on hero name + scene-arrow links: text shifts to the other accent family (complement ↔ analogous), not a chroma wash (`styles.css`).
 * — `.hero` still stores `--hero-h` (= scene bg hue) for legacy hooks; cursor follows computed `.hero` color (accent).
 * — Footer: caption (greeting, date, time, temp, place) + pin toggle; Open-Meteo weather + reverse geocode for place.
 * — Playground readout: ?lab=1 | localStorage.lab=1 — extra coordinates line + optional lat/lon override
 *   (footerGeoDebugLat / footerGeoDebugLon) so sun + Open-Meteo use test coords; caption clock still uses anchor TZ.
 * — Scene scrubber (debug): ?sceneDebug=1 | localStorage.sceneDebug=1
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
    applyLabDataset();
    var hero = document.querySelector(".hero");
    var pageSplit = document.querySelector(".page-split");
    var workRail = document.querySelector(".work-rail");

    var FOOTER_ANCHOR_KEY = "footerAnchor";
    var FOOTER_GEO_LAT_KEY = "footerGeoLat";
    var FOOTER_GEO_LON_KEY = "footerGeoLon";
    var FOOTER_GEO_PLACE_KEY = "footerGeoPlace";
    var FOOTER_GEO_DEBUG_LAT_KEY = "footerGeoDebugLat";
    var FOOTER_GEO_DEBUG_LON_KEY = "footerGeoDebugLon";
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

    /** Lab-only: overrides readAnchorLatLon for sun + weather; does not change anchor mode or device TZ. */
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
                "Override on — sun + weather use these coordinates. Greeting clock still uses the anchor timezone (stl vs here), not the spoofed meridian.";
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
            clearGeoPlaceCache();
            writeDebugGeoOverride(la, lo);
            lastWeatherAttempt = 0;
            tick();
            refreshGeoDebugInputsFromStorage();
            syncFooterGeoDebugHint();
        });
        btnRand.addEventListener("click", function () {
            var p = pickRandomDebugPreset();
            clearGeoPlaceCache();
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
        return zonedClockHourFloat(new Date(), anchorTimeZone());
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

    function readDisplayPlaceLower() {
        if (readFooterAnchorMode() !== "here" || !readStoredGeoCoords()) {
            return "st louis";
        }
        return readCachedPlaceLower() || "here";
    }

    function fetchReversePlaceName(lat, lon) {
        if (placeNameFetchInFlight) {
            return;
        }
        placeNameFetchInFlight = true;
        var url =
            "https://geocoding-api.open-meteo.com/v1/reverse?latitude=" +
            encodeURIComponent(String(lat)) +
            "&longitude=" +
            encodeURIComponent(String(lon)) +
            "&language=en";
        try {
            window
                .fetch(url)
                .then(function (r) {
                    return r.ok ? r.json() : null;
                })
                .then(function (j) {
                    placeNameFetchInFlight = false;
                    if (!j || !j.results || !j.results.length) {
                        tick();
                        return;
                    }
                    var r0 = j.results[0];
                    var label = r0.name || r0.admin1 || r0.country || "";
                    label = String(label).trim().toLowerCase();
                    if (label) {
                        writeCachedPlaceLower(label);
                    }
                    tick();
                })
                .catch(function () {
                    placeNameFetchInFlight = false;
                });
        } catch (eRev) {
            placeNameFetchInFlight = false;
        }
    }

    function maybeRefreshPlaceName() {
        if (readFooterAnchorMode() !== "here" || !readStoredGeoCoords()) {
            return;
        }
        if (readCachedPlaceLower()) {
            return;
        }
        if (placeNameFetchInFlight) {
            return;
        }
        var g = readStoredGeoCoords();
        if (g) {
            fetchReversePlaceName(g.lat, g.lon);
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
            if (q.get("sceneDebug") === "1" || q.get("debug") === "scene") {
                return true;
            }
            return window.localStorage.getItem("sceneDebug") === "1";
        } catch (e) {
            return false;
        }
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
        panel.appendChild(bumpRow);
        document.body.appendChild(panel);

        accentBumpSlider.addEventListener("input", function () {
            liveAccentInkBump = parseInt(accentBumpSlider.value, 10);
            if (isNaN(liveAccentInkBump)) {
                liveAccentInkBump = 0;
            }
            tick();
        });
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
        var tz = anchorTimeZone();
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

    var lastFaviconKey = "";

    /** Tab icon: circle filled with scene background (same H/S/L as `--bg-*`). */
    function syncFaviconFromBg(h, sRound, lPct) {
        var key = String(h) + "-" + String(sRound) + "-" + String(lPct);
        if (key === lastFaviconKey) {
            return;
        }
        lastFaviconKey = key;
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
    }

    function applyScene(clockH) {
        var paletteHour = sceneClockHourFloat();
        var sunCtx = sunContextForScene(clockH);
        var darkScheme = sunCtx.darkSchemeAuto;
        root.dataset.appearance = darkScheme ? "dark" : "light";

        var sampled = sampleScene(paletteHour);
        sampled = applyGoldenTint(sampled, sunCtx.golden, sunCtx.goldenMorning);
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

    function updateFooterCaption(clockH) {
        void clockH;
        var cap = document.getElementById("footer-caption");
        var labEl = document.getElementById("footer-lab");
        if (!cap) {
            return;
        }
        var now = new Date();
        var tz = anchorTimeZone();
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
        var hFloat = zonedClockHourFloat(now, tz);
        var greet = greetingFromHour(hFloat);
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

        var place = readDisplayPlaceLower();
        var core =
            greet +
            ", it's " +
            wd +
            " " +
            day +
            " " +
            month +
            " " +
            year +
            ", " +
            hh +
            ":" +
            mm;
        if (lastWeatherTempF != null && !isNaN(lastWeatherTempF)) {
            core += " and " + lastWeatherTempF + "\u00b0 in " + place;
        } else {
            core += " in " + place;
        }
        cap.replaceChildren();
        cap.appendChild(document.createTextNode(core));

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
    }

    function clearGeoPlaceCache() {
        try {
            window.localStorage.removeItem(FOOTER_GEO_PLACE_KEY);
        } catch (eClr) {
            /* ignore */
        }
    }

    function trackingPlaceSlug() {
        var c = readCachedPlaceLower();
        if (!c) {
            return "your location";
        }
        return String(c).replace(/,/g, " ").replace(/\s+/g, " ").trim();
    }

    function fireTrackingChip(clientX, clientY, slugOverride) {
        if (typeof window.showCursorTypewriterChip !== "function") {
            return;
        }
        var slug = slugOverride != null ? String(slugOverride).trim() : trackingPlaceSlug();
        window.showCursorTypewriterChip("tracking " + slug, clientX, clientY);
    }

    function initFooterSkyToggle() {
        normalizeFooterAnchorState();
        var btn = document.getElementById("footer-sky-toggle");
        syncFooterSkyToggle();
        if (!btn) {
            return;
        }
        btn.addEventListener("click", function (ev) {
            var ax = ev.clientX;
            var ay = ev.clientY;
            var hereOn = readFooterAnchorMode() === "here" && !!readStoredGeoCoords();
            if (hereOn) {
                writeFooterAnchorMode("stl");
                syncFooterSkyToggle();
                lastWeatherAttempt = 0;
                lastWeatherTempF = null;
                tick();
                fireTrackingChip(ax, ay, "stl");
                return;
            }
            var cached = readStoredGeoCoords();
            if (cached) {
                writeFooterAnchorMode("here");
                syncFooterSkyToggle();
                lastWeatherAttempt = 0;
                lastWeatherTempF = null;
                tick();
                fireTrackingChip(ax, ay, null);
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
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    clearGeoPlaceCache();
                    writeStoredGeoCoords(pos.coords.latitude, pos.coords.longitude);
                    writeFooterAnchorMode("here");
                    btn.disabled = false;
                    lastWeatherAttempt = 0;
                    lastWeatherTempF = null;
                    tick();
                    window.setTimeout(function () {
                        fireTrackingChip(ax, ay, null);
                    }, 1000);
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
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[footer geo] " + why);
                    }
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 },
            );
        });
    }

    function tick() {
        var hour = clockHourFloat();
        applyScene(hour);
        updateSceneLegibility(hour);
        if (followReal && followReal.checked && simSlider) {
            simSlider.value = String(Math.min(100, Math.max(0, Math.round((hour % 24) * (100 / 24)))));
        }
        maybeRefreshPlaceName();
        updateFooterCaption(hour);
        syncFooterSkyToggle();
        maybeRefreshWeather();
    }

    if (followReal && simSlider) {
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
    }

    initFooterSkyToggle();
    ensureFooterGeoDebugWired();
    syncFooterGeoDebugPanel();
    refreshGeoDebugInputsFromStorage();
    tick();

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

    if (!hero || reduceMotion) {
        return;
    }

    var scheduled = false;
    var x = 0;
    var y = 0;

    var TILT_MAX_X = 3.8;
    var TILT_MAX_Y = 5.2;

    function applyPointerSpatial() {
        scheduled = false;
        var w = window.innerWidth || 1;
        var h = window.innerHeight || 1;
        var nx = x / w;
        var ny = y / h;
        var rdx = (0.5 - ny) * 2 * TILT_MAX_X;
        var rdy = (nx - 0.5) * 2 * TILT_MAX_Y;
        if (workRail) {
            workRail.style.setProperty("--rail-tilt-x", rdx.toFixed(2) + "deg");
            workRail.style.setProperty("--rail-tilt-y", rdy.toFixed(2) + "deg");
        }
    }

    function scheduleSpatialFromClient(cx, cy) {
        x = cx;
        y = cy;
        if (scheduled) {
            return;
        }
        scheduled = true;
        requestAnimationFrame(applyPointerSpatial);
    }

    function onFinePointerMove(event) {
        scheduleSpatialFromClient(event.clientX, event.clientY);
    }

    if (finePointer) {
        window.addEventListener("pointermove", onFinePointerMove, { passive: true });
        return;
    }

    var COARSE_MOVE_PX = 14;
    var VERTICAL_DOMINANCE = 1.15;
    var tracking = null;

    function endCoarseTracking(ev) {
        if (!tracking || ev.pointerId !== tracking.pointerId) {
            return;
        }
        if (tracking.captured) {
            try {
                hero.releasePointerCapture(tracking.pointerId);
            } catch (err) {
                /* ignore */
            }
        }
        tracking = null;
    }

    function onHeroPointerDown(ev) {
        if (tracking || ev.isPrimary === false) {
            return;
        }
        if (ev.pointerType === "mouse") {
            return;
        }
        tracking = {
            pointerId: ev.pointerId,
            sx: ev.clientX,
            sy: ev.clientY,
            mode: "undecided",
            captured: false,
        };
    }

    function onCoarsePointerMove(ev) {
        if (!tracking || ev.pointerId !== tracking.pointerId) {
            return;
        }
        var dx = ev.clientX - tracking.sx;
        var dy = ev.clientY - tracking.sy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (tracking.mode === "undecided") {
            if (dist < COARSE_MOVE_PX) {
                return;
            }
            if (Math.abs(dy) > Math.abs(dx) * VERTICAL_DOMINANCE) {
                tracking = null;
                return;
            }
            tracking.mode = "tilt";
            try {
                hero.setPointerCapture(ev.pointerId);
                tracking.captured = true;
            } catch (err) {
                /* ignore */
            }
        }
        if (tracking && tracking.mode === "tilt") {
            scheduleSpatialFromClient(ev.clientX, ev.clientY);
        }
    }

    hero.addEventListener("pointerdown", onHeroPointerDown, { passive: true });
    window.addEventListener("pointermove", onCoarsePointerMove, { passive: true });
    window.addEventListener("pointerup", endCoarseTracking, { passive: true });
    window.addEventListener("pointercancel", endCoarseTracking, { passive: true });
})();
