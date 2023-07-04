
import * as d3 from "../utils/color.js";
import { getColor, maxWorkers } from "../utils/dom.js";
import { Vector, constrainMap } from "../utils/math.js";
export default function execute() {
    let canvas = null;
    let workers = null;
    let isActive = false;
    let background = null;
    const param = {
        rho: 28,
        sigma: 10,
        beta: 8 / 3,
    };

    function setup() {
        if (!canvas) return;
        background = getColor('--color-surface-container-3', "#000");
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.lineWidth = 0;
        ctx.fillStyle = background.formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    async function draw(time) {
        if (!isActive) return;
        const aspect = canvas.width / canvas.height;
        const center = new Vector(0, 0, param.rho - 1),
            limit = new Vector(
                3 * Math.sqrt(param.beta * (param.rho - 1)),
                3 * Math.sqrt(param.beta * (param.rho - 1)),
                3 * Math.sqrt(param.beta * (param.rho - 1)),
            );
        function project(x, y, z) {
            const p = v => new Vector(v.x, v.y);
            const pos = p(new Vector(x, y, z).sub(center));
            const lim = p(limit);
            return new Vector(
                constrainMap(pos.x, -Math.max(lim.x, lim.y * aspect), +Math.max(lim.x, lim.y * aspect), 0, canvas.width),
                constrainMap(pos.y, +Math.max(lim.y, lim.x / aspect), -Math.max(lim.y, lim.x / aspect), 0, canvas.height),
            );
        }
        const result = await Promise.all(workers.map(worker => new Promise(resolve => {
            worker.postMessage({ time });
            function listener(e) {
                resolve({ subdivide: e.data.subdivide, states: e.data.states });
                worker.removeEventListener("message", listener);
            }
            worker.addEventListener("message", listener);
        })));
        const r = 1;
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.lineWidth = 0;
        ctx.fillStyle = background.formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        result.forEach(({ states }) => {
            states.forEach(({ state, color }) => {
                const pos = project(...state);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
                ctx.fill();
            });
        });
        requestAnimationFrame(draw);
    }

    return {
        start: (node = document.querySelector("article>canvas.sketch")) => {
            canvas = node;
            setup();
            const err = 1e-5;
            const count = 2048;
            workers = new Array(maxWorkers).fill(null).map(_ => new Worker(import.meta.resolve("./worker.js"), { type: "module" }));
            workers.forEach((worker, i) => {
                const index = i * Math.floor(count / maxWorkers) + Math.min(i, count % maxWorkers),
                    counts = Math.floor(count / maxWorkers) + (i < count % maxWorkers);
                const states = new Array(counts).fill(null).map((_, i) => ({
                    state: [
                        [
                            constrainMap(index + i, 0, count, -err, +err),
                            2,
                            20,
                        ]
                    ],
                    color: d3.hcl(
                        constrainMap(index + i, 0, count, 0, 360),
                        75,
                        Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-base')),
                    ).formatHex8(),
                }));
                worker.postMessage?.({
                    states,
                    time_scale: 5e-4,
                    param
                });
            });
            const ctx = canvas.getContext("2d", { alpha: false });
            ctx.lineWidth = 0; ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            isActive = true;
            requestAnimationFrame(draw);
        },
        stop: () => {
            isActive = false;
            canvas?.remove();
            workers?.forEach(worker => worker.terminate());
            workers = canvas = null;
        },
    };
}
