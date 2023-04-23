{
    const reroute = (function () {
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
            document.body.querySelector("main").style.display = "block";
        }
        function loadDisplay({ title, preview, loader }) {
            clearDisplay();
            document.body.querySelector("main").style.display = "none";
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
            const hash = window.location.hash.replace(/^#/, "");
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
        reroute();
    });
    window.addEventListener("popstate", (e) => {
        e.preventDefault();
        reroute();
    });
    async function addScript(src) {
        const module = await import(src);
        return module.default;
    }
    window.addEventListener("DOMContentLoaded", async (e) => {
        (await import("/static/js/utils.js")).importHtmlAll();
        const loadWebComponent = (await import("/static/js/utils.js")).loadWebComponent;
        loadWebComponent("project-preview");

        document.querySelector("nav .submenu_toggle#creative_coding~.scroll>ul")
            .querySelectorAll(":scope>li>a")
            .forEach((item_link) => {
                const path = item_link.getAttribute("href");
                const id = path.split("#").slice(-1)[0];
                item_link.setAttribute("href", `#${id}`);
                const title = item_link.innerText;
                item_link.addEventListener("click", (e) => {
                    e.preventDefault();
                    document.querySelector("nav input#menu_toggle").checked = false;
                    window.history.pushState({}, "", path);
                    reroute();
                });
                const preview = document.createElement("project-preview");
                preview.id = id;
                const header = preview.appendChild(document.createElement("div"));
                header.setAttribute("slot", "title");
                header.appendChild(document.createTextNode(title));
                const canvas = preview.appendChild(document.createElement("div"));
                canvas.setAttribute("slot", "content");
                let loader;
                const src = import.meta.resolve(`../../${id}/main.js`);
                loader = () => addScript(src);
                reroute.routes.set(id, {
                    title, preview, loader,
                });
            });
        reroute();
    });
}