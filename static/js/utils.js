export function loadWebComponent(id) {
    const element = class extends HTMLElement {
        constructor() {
            super();
            const content = document.querySelector(`template#${id}`).content;
            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(content.cloneNode(true));
        }
    }
    customElements.define(id, element);
}
export function importHtml(elem) {
    const url = elem.getAttribute("import-html");
    const xhttp = new XMLHttpRequest();
    const loaded = new Event("htmlLoaded");
    xhttp.open("GET", url, false);
    xhttp.send();
    if (xhttp.readyState === 4) {
        switch (xhttp.status) {
            case 200:
                elem.innerHTML += xhttp.responseText;
                break;
            case 404:
                elem.innerHTML = "Not Found";
                break;
        }
        elem.removeAttribute("import-html");
        elem.dispatchEvent(loaded);
    }
}
export function importHtmlAll() {
    document.querySelectorAll("*[import-html]").forEach(importHtml);
}