
import { getParentSize } from "../utils/dom.js";
import { constrainMap } from "../utils/math.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker = null;

    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.lineWidth = 0; ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return {
        start: (node) => {
            parent = node;
            canvas = document.createElement("canvas");
            parent.appendChild(canvas);
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            worker.postMessage({ count: 2048, time_scale: 5e-4 });
            const ctx = canvas.getContext("2d", { alpha: false });
            ctx.lineWidth = 0; ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const min_x = 30;
            const min_y = 30;
            function draw(time) {
                const aspect = canvas.width / canvas.height;
                worker.postMessage({ time });
                function listener(e) {
                    const r = 1;
                    ctx.lineWidth = 0; ctx.fillStyle = "#0001";
                    if (e.data.subdivide)
                        for (let _ = 0; _ < e.data.subdivide; _++)
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                    e.data.states.forEach(({ state, color }) => {
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(
                            constrainMap(state[0] / min_x, -Math.max(1, aspect), +Math.max(1, aspect), 0, canvas.width),
                            constrainMap(state[1] / min_y, -Math.max(1, 1 / aspect), +Math.max(1, 1 / aspect), 0, canvas.height),
                            r,
                            0, 2 * Math.PI,
                        );
                        ctx.fill();
                    });
                    worker.removeEventListener("message", listener);
                    requestAnimationFrame(draw);
                }
                worker.addEventListener("message", listener);
            }
            requestAnimationFrame(draw);
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            worker?.terminate();
            parent = canvas = worker = resizeObserver = null;
        },
    };
}
