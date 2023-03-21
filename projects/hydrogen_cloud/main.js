import { RADIUS_REDUCED } from "./psi.js";

export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker;

    function setup() {
        canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const width = ctx.canvas.width = 500;
        const height = ctx.canvas.height = 500;
        const states = [{
            coeff: { re: 1 }, psi: { n: 3, l: +1, m: -1 }
        }];
        const n_max = states.reduce(
            (n_max, { psi: { n } }) => Math.max(n_max, n),
            0
        ) + 2;
        const scale = Math.pow(n_max, 2) * RADIUS_REDUCED / width;
        parent.appendChild(canvas);
        worker.addEventListener("message", function draw(e) {
            if (!e.data.buffer) return;
            const buffer = e.data.buffer;
            const image = new ImageData(buffer, width, height);
            ctx.putImageData(image, 0, 0);
            ctx.strokeStyle = "blue"
            for (let i = 0; i <= n_max; i++) {
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, Math.pow(i, 2) / (2 * scale), 0, 2 * Math.PI)
                ctx.stroke();
            }
            if (e.data.z_depth > scale * width)
                worker?.postMessage?.({ render: true, z_depth: -scale * width });
            else
                worker?.postMessage?.({ render: true, z_depth: e.data.z_depth + .5 * scale * width / 10 });
        });
        worker.postMessage({ width, height, states, scale, z_depth: 0 });
        worker.postMessage({ render: true });
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
            worker = parent = canvas = resizeObserver = null;
        },
    };
}
