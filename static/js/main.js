window.addEventListener("DOMContentLoaded", async (e) => {
    const projectsRoute = config.projectsRoute ?? "";
    const navbar = document.querySelector("nav");

    async function addScript(src) {
        const module = await import(src);
        return module.default;
    }
    async function addFrame(href) {
        const iframe = document.createElement("iframe");
        iframe.src = href;
        iframe.width = "100%";
        iframe.height = "100%";
        let execute = () => {
            let _canvas;
            return {
                start: (canvas) => {
                    _canvas = canvas;
                    _canvas.appendChild(iframe);
                },
                stop: () => {
                    _canvas?.removeChild(iframe);
                },
            };
        };
        return execute;
    }

    navbar.querySelectorAll("a").forEach((item_link) => {
        const path = item_link.getAttribute("href");
        const title = item_link.innerText;
        const id = path.replace(/^#/, "");
        item_link.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector("nav input#menu_toggle").checked = false;
            window.history.pushState({}, "", path);
            config.reroute();
        });
        const preview = document.createElement("project-preview");
        preview.id = id;
        const header = preview.appendChild(document.createElement("span"));
        header.setAttribute("slot", "title");
        header.appendChild(document.createTextNode(title));
        const canvas = preview.appendChild(document.createElement("span"));
        canvas.setAttribute("slot", "content");
        let loader;
        switch (item_link.dataset.mode ?? "module") {
            case "module":
                {
                    const src = `../../${projectsRoute}${id}/main.js`;
                    loader = () => addScript(src);
                } break;
            case "iframe":
                {
                    const src = projectsRoute + id;
                    loader = () => addFrame(src);
                } break;
        }
        config.reroute.routes.set(path, {
            id, title, preview, loader,
        });
    });
    config.reroute();
});