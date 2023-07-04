import { getColor } from "../utils/dom.js";
import { lim } from "./boid.js";
export default function execute() {
    let canvas = null;
    let worker = null;
    let background = null;
    let isActive = false;

    function setup() {
        if (!canvas) return;
        background = getColor('--color-surface-container-3', "#000");
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.lineWidth = 0;
        ctx.fillStyle = background.formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        worker?.postMessage({ width: canvas.width, height: canvas.height });
        background.opacity = .375;
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
        ctx.lineWidth = 0;
        ctx.fillStyle = background.formatHex8();
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
        start: (node = document.querySelector("article>canvas.sketch")) => {
            canvas = node;
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            worker.postMessage({ count: 250 });
            setup();
            isActive = true;
            requestAnimationFrame(draw);
        },
        stop: () => {
            isActive = false;
            canvas?.remove();
            worker?.terminate();
            background = worker = canvas = null;
        },
    };
}
