{
    const reroute = (function () {
        let loaded = [];
        const defaultTitle = document.title;
        function clearDisplay() {
            loaded.forEach(({ preview, executable }) => {
                preview?.remove();
                executable?.stop();
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
        async function loadDisplay(path) {
            clearDisplay();
            const route = _reroute.routes.get(path);
            if (typeof route === "undefined") return;
            const { title, loader } = route;
            document.body.querySelector("main").style.display = "none";
            document.title = defaultTitle ? `${title} - ${defaultTitle}` : title;
            const preview = document.createElement("project-preview");
            preview.id = path;
            document.body.appendChild(preview);
            const header = preview.appendChild(document.createElement("div"));
            header.setAttribute("slot", "title");
            header.appendChild(document.createTextNode(title));
            const canvas = preview.appendChild(document.createElement("div"));
            canvas.setAttribute("slot", "content");
            const loading = canvas.appendChild(document.createTextNode("Loading"));
            let executable = null;
            try {
                const execute = await loader();
                canvas.removeChild(loading);
                executable = execute();
                executable.start(canvas);
            } catch (error) {
                loading.replaceWith("Failed to load");
                console.warn(error);
            } finally {
                loaded.push({ executable, preview });
            }
        }
        function _reroute() {
            const hash = window.location.hash.replace(/^#/, "");
            const path = ((hash) => _reroute.routes.has(hash) ? hash : "404")(hash === "" ? "#" : hash);
            loadDisplay(path);
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
    window.addEventListener("DOMContentLoaded", async (e) => {
        await (await import("/static/js/utils.js")).loadAll("project-preview");

        document.querySelector("nav .submenu_toggle#creative_coding~.scroll>ul")
            .querySelectorAll(":scope>li>a")
            .forEach((item_link) => {
                const path = item_link.getAttribute("href");
                const id = path.split("#").slice(-1)[0];
                item_link.setAttribute("href", `#${id}`);
                const title = item_link.innerText;
                reroute.routes.set(id, {
                    title,
                    loader: async () => (await import(import.meta.resolve(`../../${id}/main.js`))).default,
                });
            });
        reroute();
    });
}