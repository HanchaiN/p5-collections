import { Route, Router } from "./router.js";

/**
 * 
 * @param {HTMLElement} navElem 
 */
export function generateNav(navElem) {
    /**
     * @typedef {Object} Directory
     * @property {string|null} name
     * @property {Route|null} value
     * @property {HTMLElement|null} parent
     * @property {HTMLElement|null} li
     * @property {HTMLElement|null} a
     * @property {HTMLElement|null} ul
     * @property {Directory[]} child
     */
    /**
     * @type {Map<string, Directory>}
     */
    const map = new Map();
    /**
     * @type {Directory}
     */
    const root = {
        name: null,
        value: null,
        parent: null,
        li: navElem,
        a: null,
        ul: null,
        child: [],
    };
    const parents = [];
    for (let route of Router.instance.routes.keys()) {
        let path = "";
        let parent = root;
        const value = Router.instance.routes.get(route);
        if (!value.isNav) continue;
        for (const name of route.split("/")) {
            path += "/" + name;
            let node = map.get(path);
            if (!node) {
                if (!parent.ul) {
                    parent.ul = parent.li.appendChild(document.createElement("ul"));
                    parent.ul.style.setProperty("--delay", "0.1s");
                    parents.push(parent);
                }
                map.set(path, node = {
                    name,
                    value: null,
                    li: document.createElement("li"),
                    a: document.createElement("a"),
                    ul: null,
                    parent: parent.ul,
                    child: [],
                });
                parent.child.push(node);
                node.a.innerHTML = name;
                node.li.appendChild(node.a);
                parent.ul.appendChild(node.li);
            }
            parent = node;
        }
        parent.value = value;
        if (parent.value) {
            parent.a.href = "#" + route;
            parent.a.innerHTML = parent.value.name;
        }
    }
    console.log(root)

    const scrollable = parents
        .filter(parent => parent.parent)
        .map(parent => {
            const toggle = document.createElement("input");
            toggle.id = parent.name;
            toggle.classList.add("submenu_toggle");
            toggle.type = "checkbox";
            const label = document.createElement("label");
            label.htmlFor = toggle.id;
            label.innerHTML += '<svg preserveAspectRatio="xMinYMin" viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path></svg>'
            label.innerHTML += '<svg preserveAspectRatio="xMinYMin" viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>'
            parent.li.append(toggle, label, parent.ul);
            const wrapper = document.createElement("div");
            wrapper.classList.add("submenu");
            parent.li.append(wrapper);
            wrapper.appendChild(parent.ul);
            return ({
                toggle: toggle,
                content: parent.ul,
                submenu: wrapper,
            });
        });

    parents.forEach(({ li, ul }) => {
        ul.querySelectorAll(":scope > li").forEach((li, i, siblings) => {
            li.style.setProperty("--color", `lch(75 75 ${360 * i / siblings.length})`);
            li.style.setProperty("--delay", `${0.5 * i / (siblings.length - 1)}s`);
        });
        (li.querySelector(":scope > .submenu") ?? ul).style.setProperty("--delay", `${0.5}s`);
    });

    scrollable.forEach(({ submenu, toggle, content }) => {
        toggle.addEventListener("change", () => {
            if (toggle.checked) {
                scrollable.forEach(({ toggle }) => toggle.checked = false);
                toggle.checked = true;
            }
        })
        let contents = [content]
        submenu.append(...contents);
        const options = {
            root: submenu,
            rootMargin: '0px',
            threshold: 0.0
        };
        for (let i = 0; i < content.childElementCount; i++) {
            const li = content.children.item(i);
            new IntersectionObserver((entries) => {
                if (entries.some(e => e.isIntersecting)) {
                    li.classList.add("active");
                } else {
                    li.classList.remove("active");
                }
            }, options).observe(li);
        }
    });
}