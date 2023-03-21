import "p5";
import { getParentSize } from "../utils/index.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker;

    function setup() {
        const { width, height } = getParentSize(parent, canvas);
        canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        parent.appendChild(canvas);
        worker.postMessage({ size: { width: ctx.canvas.width, height: ctx.canvas.height } });
        worker.addEventListener("message", function draw(e) {
            worker?.postMessage?.({ dt: 1 });
            const buffer = e.data;
            const image = new ImageData(buffer, ctx.canvas.width, ctx.canvas.height);
            ctx.putImageData(image, 0, 0);
        });
    }

    return {
        start: (node) => {
            parent = node;
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            setup();
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            worker?.terminate();
            parent = canvas = resizeObserver = null;
        },
    };
}
