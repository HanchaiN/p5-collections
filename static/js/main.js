window.addEventListener("DOMContentLoaded", async () => {
    const importHtml = (await import("/static/js/utils.js")).importHtml;
    document.querySelectorAll("*[import-html]").forEach(importHtml);
});