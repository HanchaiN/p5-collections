document.querySelector("nav").addEventListener("htmlLoaded", () => {
    const navbar = document.querySelector('nav');

    const parents = navbar.querySelectorAll("#menu_toggle~ul li:has(.scroll)");

    parents.forEach(parent => {
        const submenu = parent.querySelector(".scroll");
        const toggle = parent.querySelector(".submenu_toggle");
        const content = submenu.querySelector("ul");
        toggle.addEventListener("change", () => {
            if (toggle.checked) {
                parents.forEach(parent => parent.querySelector(".submenu_toggle").checked = false);
                toggle.checked = true;
            }
        })
        const maxHeight = Number.parseFloat(
            getComputedStyle(submenu)
                .getPropertyValue('--max-height')
                .replace(/([\d\.]*)px/, "$1")
        );
        const height = content.getBoundingClientRect().height;
        let contents = [content]
        if (maxHeight < height)
            contents = contents.concat(
                new Array(Math.ceil(maxHeight / height) + 1).fill(0).map(_ => content.cloneNode(true))
            );
        submenu.append(...contents);
        const options = {
            root: submenu,
            rootMargin: '0px',
            threshold: 0.0
        };
        if (maxHeight < height) {
            const observer = new IntersectionObserver((entries) => {
                if (!entries.some(_ => _.isIntersecting)) {
                    submenu.scroll(0, 0)
                }
            }, options);
            observer.observe(content);
        }
        for (let i = 0; i < content.childElementCount; i++) {
            let state = contents.map(_ => false);
            contents.forEach((c, j) => {
                const li = c.children.item(i);
                const observer = new IntersectionObserver((entries) => {
                    state[j] = entries.some(e => e.isIntersecting);
                    if (state.some(_ => _)) {
                        contents.forEach(c => c.children.item(i).classList.add("active"));
                    } else {
                        contents.forEach(c => c.children.item(i).classList.remove("active"));
                    }
                }, options);
                observer.observe(li);
            })
        }
    });
});