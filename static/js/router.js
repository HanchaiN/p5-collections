config.reroute = (function () {
    let loaded = [];
    const defaultTitle = document.title;
    function clearDisplay() {
        loaded.forEach(({ preview, executable }) => {
            preview.remove();
            executable.stop();
        });
        loaded = [];
        document.querySelectorAll("project-preview").forEach((preview) => {
            preview.style.display = "none";
            const canvas = preview.querySelector("[slot=content]");
            canvas.innerHTML = "";
        });
        document.title = defaultTitle ?? "index";
    }
    function loadDisplay({ id, title, preview, loader }) {
        clearDisplay();
        document.title = defaultTitle ? `${title} - ${defaultTitle}` : title;
        document.body.appendChild(preview);
        const canvas = preview.querySelector("[slot=content]");
        const loading = canvas.appendChild(document.createTextNode("Loading"));
        loader().then((execute) => {
            canvas.removeChild(loading);
            const executable = execute();
            loaded.push({ executable, preview });
            executable.start(canvas);
        }).catch((reason) => {
            loading.replaceWith("Failed to load");
            console.warn(reason);
        });
    }
    function _reroute() {
        const hash = window.location.hash;
        const path = ((hash) => _reroute.routes.has(hash) ? hash : "404")(hash === "" ? "#" : hash);
        const route = _reroute.routes.get(path);
        if (route) loadDisplay(route);
        else clearDisplay();
    }
    _reroute.routes = new Map();
    return _reroute;
})();
window.addEventListener("hashchanged", (e) => {
    e.preventDefault();
    config.reroute();
});
window.addEventListener("popstate", (e) => {
    e.preventDefault();
    config.reroute();
});