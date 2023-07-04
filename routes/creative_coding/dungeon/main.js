import { getColor } from "../utils/dom.js";
import { drawDungeon } from "./generator.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    const unit = { x: 5, y: 5 };
    let size;

    function generate_and_draw(grid_size, ctx, unit) {
        const worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
        worker.postMessage({ grid_size });
        worker.addEventListener("message", e => {
            worker.terminate();
            requestAnimationFrame(() => {
                drawDungeon(
                    e.data, ctx, unit,
                    [
                        getColor('--color-surface-container-3', "#1C0B40").formatHex8(),
                        getColor('--color-primary-container', "#142273").formatHex8(),
                        getColor('--color-outline', "#0F71F2").formatHex8(),
                        getColor('--color-secondary-container', "#0F9BF2").formatHex8(),
                        getColor('--color-tertiary', "#F222A9").formatHex8(),
                    ],
                );
            });
        })
    }

    function redraw() {
        generate_and_draw(size, canvas.getContext("2d", { alpha: "false" }), unit);
    }
    function setup() {
        if (!canvas) return;
        size = {
            x: Math.ceil(canvas.width / unit.x),
            y: Math.ceil(canvas.height / unit.y),
        };
        redraw();
    }

    return {
        start: (node = document.querySelector("article>canvas.sketch")) => {
            canvas = node;
            canvas.addEventListener("click", redraw);
            setup();
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            parent = canvas = resizeObserver = null;
        },
    };
}
