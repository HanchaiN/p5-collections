export * from "./math.js"
export * from "./color.js"

export function getParentSize(parent, canvas) {
    if (canvas) canvas.hidden = true;
    const rect = parent?.getBoundingClientRect();
    const width = rect?.width
        || window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
    const height = rect?.height
        || window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    if (canvas) canvas.hidden = false;
    return { width, height }
}