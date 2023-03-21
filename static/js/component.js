window.addEventListener("DOMContentLoaded", async () => {
    async function loadWebComponent(id) {
        const element = class extends HTMLElement {
            constructor() {
                super();
                const content = document.querySelector("template").content;
                const shadowRoot = this.attachShadow({ mode: "open" });
                shadowRoot.appendChild(content.cloneNode(true));
            }
        }
        customElements.define(id, element);
    }
    loadWebComponent("project-preview");
});