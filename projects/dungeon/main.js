import { getParentSize } from "../utils/dom.js";
import { drawDungeon } from "./generator.js";
export default function execute() {
    let parent = null;
    let canvas = document.createElement("canvas");
    let resizeObserver = null;
    const unit = { x: 4, y: 4 };
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
                        "#1C0B40",
                        "#142273",
                        "#0F71F2",
                        "#0F9BF2",
                        "#F222A9",
                    ],
                );
            });
        })
    }

    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        size = {
            x: Math.ceil(width / unit.x),
            y: Math.ceil(height / unit.y),
        };
        canvas.width = size.x * unit.x;
        canvas.height = size.y * unit.y;
        generate_and_draw(size, canvas.getContext("2d", { alpha: "false" }), unit);
    }

    return {
        start: (node) => {
            parent = node;
            parent.style.display = "flex";
            parent.style.justifyContent = "center";
            parent.style.alignItems = "center";
            canvas.style.display = "block";
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            canvas = document.createElement("canvas");
            parent.append(canvas);
            canvas.addEventListener("click", () => {
                generate_and_draw(size, canvas.getContext("2d", { alpha: "false" }), unit);
            });
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            parent = canvas = resizeObserver = null;
        },
    };
}
