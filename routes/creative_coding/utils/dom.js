import * as d3 from "./color.js";

export function getParentSize(parent, canvas) {
    if (canvas) canvas.hidden = true;
    const rect = parent?.getBoundingClientRect();
    const width = Math.floor(rect?.width
        || window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth);
    const height = Math.floor(rect?.height
        || window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight);
    if (canvas) canvas.hidden = false;
    return { width, height }
}

export function getColor(name, fallback="#0000") {
    return d3.color(getComputedStyle(document.body).getPropertyValue(name) || fallback);
}

export const maxWorkers = window.navigator.hardwareConcurrency ? Math.floor(window.navigator.hardwareConcurrency * 3 / 4) : 1;