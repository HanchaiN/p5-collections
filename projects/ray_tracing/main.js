export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker;

    function setup() {
        canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.canvas.width = 500;
        ctx.canvas.height = 500;
        parent.appendChild(canvas);
        worker.addEventListener("message", function draw(e) {
            worker?.postMessage?.(null);
            const buffer = e.data;
            const image = new ImageData(buffer, ctx.canvas.width, ctx.canvas.height);
            ctx.putImageData(image, 0, 0);
        });
        worker.postMessage({ size: { width: ctx.canvas.width, height: ctx.canvas.height } });
    }

    return {
        start: (node) => {
            parent = node;
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            setup();
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect(); worker =
                worker = parent = canvas = resizeObserver = null;
        },
    };
}
