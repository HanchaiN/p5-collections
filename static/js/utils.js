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
    return new Promise(resolve => {
        const url = elem.getAttribute("import-html");
        const xhttp = new XMLHttpRequest();
        const loaded = new Event("htmlLoaded");
        xhttp.open("GET", url, true);
        xhttp.send();
        xhttp.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                switch (this.status) {
                    case 200:
                        elem.innerHTML += this.responseText;
                        break;
                    case 404:
                        elem.innerHTML = "Not Found";
                        break;
                }
                elem.removeAttribute("import-html");
                elem.dispatchEvent(loaded);
                resolve(this.status);
            }
        });
    })
}
export async function loadAll(...webcomponent_id) {
    await Promise.all(Array.from(document.querySelectorAll("*[import-html]")).map(importHtml));
    webcomponent_id.forEach(loadWebComponent);
}