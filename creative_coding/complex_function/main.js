import { getParentSize, maxWorkers } from "../utils/dom.js";

export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let workers = null;

    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        canvas.width = width;
        canvas.height = height;
        draw(canvas.width, canvas.height);
    }
    function draw(width, height) {
        const draw_batch = (worker) => (e) => {
            if (!e.data.buffer) return;
            const { buffer, size } = e.data;
            const width = canvas.width, height = canvas.height;
            if (size.sx === width && size.sy === height) {
                const ctx = canvas.getContext("2d", { alpha: false });
                const image = new ImageData(buffer, size.w, size.h);
                ctx.putImageData(image, size.dx, size.dy);
            } else {
                worker?.terminate();
            }
            if (e.data.done) worker?.terminate();
        }
        workers?.forEach(worker => worker.terminate());
        const aspect = height / width;
        const subdivide = [
            Math.floor(Math.sqrt(maxWorkers / aspect)),
            Math.floor(Math.sqrt(maxWorkers / aspect) * aspect),
        ];
        workers = new Array(subdivide[0] * subdivide[1]).fill(0).map(_ =>
            new Worker(import.meta.resolve("./worker.js"), { type: "module" })
        );
        workers.forEach(worker => worker.addEventListener("message", draw_batch(worker)));
        for (let i = 0; i < subdivide[0]; i++)
            for (let j = 0; j < subdivide[1]; j++)
                workers[i * subdivide[1] + j].postMessage({
                    size: {
                        width: Math.ceil(width / subdivide[0]),
                        height: Math.ceil(height / subdivide[1]),
                        dx: Math.floor(i * width / subdivide[0]),
                        dy: Math.floor(j * height / subdivide[1]),
                        sx: width,
                        sy: height,
                        y: 20,
                    },
                    render: true,
                });
    }

    return {
        start: (node) => {
            parent = node;
            canvas = document.createElement("canvas");
            parent.appendChild(canvas);
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            workers?.forEach(worker => worker.terminate());
            workers = parent = canvas = resizeObserver = null;
        },
    };
}
