import "p5";
import { lim } from "./boid.js";
import { getParentSize } from "../utils/dom.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker = null;

    const sketch = (p) => {
        let boids, time;

        function parentResized() {
            const { width, height } = getParentSize(parent, canvas);
            p.resizeCanvas(width, height);
            boids = p.createGraphics(p.width, p.height);
            worker?.postMessage({ width, height });
            p.background(0);
        }
        p.setup = function () {
            const { width, height } = getParentSize(parent, canvas);
            p.createCanvas(width, height);
            boids = p.createGraphics(p.width, p.height);
            worker?.postMessage({ width, height, count: 250 });
            p.colorMode(p.RGB);
            p.background(0);
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            worker.addEventListener("message", (e) => {
                if (!e.data.boid) return;
                worker?.postMessage({ time });
                boids.clear();
                boids.noStroke();
                e.data.boid.forEach(({ c, p }) => {
                    boids.fill(c.r, c.g, c.b, c.a);
                    boids.circle(p.x, p.y, lim.size);
                });
            });
            time = 0;
        }

        p.draw = function () {
            p.background(0, 0, 0, 255 / 5);
            p.image(boids, 0, 0);
            time += p.deltaTime;
        }
    };

    let instance;
    return {
        start: (node) => {
            parent = node;
            worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
            instance = new p5(sketch, node);
            canvas = instance.canvas;
        },
        stop: () => {
            instance?.remove();
            canvas?.remove();
            resizeObserver?.disconnect();
            worker?.terminate();
            worker = parent = canvas = instance = resizeObserver = null;
        },
    };
}
