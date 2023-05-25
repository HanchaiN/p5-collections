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

export const maxWorkers = window.navigator.hardwareConcurrency ? Math.floor(window.navigator.hardwareConcurrency * 3 / 4) : 1;