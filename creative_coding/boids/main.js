import { lim } from "./boid.js";
import { getParentSize } from "../utils/dom.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker = null;

    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.lineWidth = 0; ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        worker?.postMessage({ width, height });
    }

    return {
        start: (node) => {
            parent = node;
            canvas = document.createElement("canvas");
            parent.appendChild(canvas);
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            worker.postMessage({ count: 250 });
            function draw(time) {
                worker.postMessage({ time });
            }
            worker.addEventListener("message", (e) => {
                if (!e.data.boid) return;
                requestAnimationFrame(draw);
                const ctx = canvas.getContext("2d", { alpha: false });
                ctx.lineWidth = 0; ctx.fillStyle = "#0002"
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                e.data.boid.forEach(({ c, p }) => {
                    ctx.fillStyle = c;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, lim.size, 0, 2 * Math.PI);
                    ctx.fill();
                });
            });
            requestAnimationFrame(draw);
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            worker?.terminate();
            worker = parent = canvas = resizeObserver = null;
        },
    };
}
