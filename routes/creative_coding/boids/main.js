import { getParentSize } from "../utils/dom.js";
import { lim } from "./boid.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker = null;
    let isActive = false;

    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.lineWidth = 0; ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        worker?.postMessage({ width, height });
    }

    async function draw(time) {
        if (!isActive) return;
        const result = await new Promise(resolve => {
            worker.postMessage({ time });
            function listener(e) {
                if (!e.data.boid) return;
                resolve(e.data.boid);
                worker.removeEventListener("message", listener);
            }
            worker.addEventListener("message", listener);
        });
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.lineWidth = 0; ctx.fillStyle = "#0002"
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        result.forEach(({ c, p }) => {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(p.x, p.y, lim.size, 0, 2 * Math.PI);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    return {
        start: (node = document.querySelector("main.sketch")) => {
            parent = node;
            canvas = document.createElement("canvas");
            parent.appendChild(canvas);
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            worker.postMessage({ count: 250 });
            isActive = true;
            requestAnimationFrame(draw);
        },
        stop: () => {
            isActive = false;
            canvas?.remove();
            resizeObserver?.disconnect();
            worker?.terminate();
            worker = parent = canvas = resizeObserver = null;
        },
    };
}
