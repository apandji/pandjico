/**
 * Contact form: show thanks on return from FormSubmit (?thanks=1).
 */
(function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get("thanks") !== "1") {
        return;
    }
    var thanks = document.getElementById("contact-thanks");
    var form = document.getElementById("contact-form");
    if (thanks) {
        thanks.hidden = false;
    }
    if (form) {
        form.hidden = true;
    }
})();
