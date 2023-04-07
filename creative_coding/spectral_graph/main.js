import "p5";
import { Graph } from "./graph.js";
import { getParentSize } from "../utils/dom.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;

    const sketch = (p) => {
        const mainelem = new Graph();
        function parentResized() {
            const { width, height } = getParentSize(parent, canvas);
            p.resizeCanvas(width, height);
        }
        p.setup = function () {
            const { width, height } = getParentSize(parent, canvas);
            p.createCanvas(width, height, p.WEBGL);
            mainelem.addNode(1);
            mainelem.addNode(2);
            mainelem.addNode(3);
            mainelem.addEdge(1, 2);
            mainelem.addEdge(2, 3);
            mainelem.addEdge(3, 1);
            mainelem.simplify();
            // p.noLoop();
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
        }

        p.draw = function () {
            p.background(220);
            p.orbitControl();
            p.debugMode();
            let coord = mainelem.spectral();
            let x = 0;
            let y = coord.length - 1;
            let z = p.floor(coord.length / 2) + 1;
            let xmax = coord.reduce((acc, elem) => p.max(acc, p.abs(elem[x])), 0);
            let ymax = coord.reduce((acc, elem) => p.max(acc, p.abs(elem[y])), 0);
            let zmax = coord.reduce((acc, elem) => p.max(acc, p.abs(elem[z])), 0);
            let max_ = p.max(xmax, ymax, zmax);
            for (let i in coord) {
                p.push();
                p.translate(
                    p.map(coord[i][x], -max_, +max_, -100, +100),
                    p.map(coord[i][y], -max_, +max_, -100, +100),
                    p.map(coord[i][z], -max_, +max_, -100, +100),
                );
                p.sphere(10);
                p.translate(
                    -p.map(coord[i][x], -max_, +max_, -100, +100),
                    -p.map(coord[i][y], -max_, +max_, -100, +100),
                    -p.map(coord[i][z], -max_, +max_, -100, +100),
                );
                p.strokeWeight(1);
                for (let j in coord) {
                    if (mainelem.adj[i][j]) {
                        p.line(
                            p.map(coord[i][x], -max_, +max_, -100, +100),
                            p.map(coord[i][y], -max_, +max_, -100, +100),
                            p.map(coord[i][z], -max_, +max_, -100, +100),

                            p.map(coord[j][x], -max_, +max_, -100, +100),
                            p.map(coord[j][y], -max_, +max_, -100, +100),
                            p.map(coord[j][z], -max_, +max_, -100, +100),
                        );
                    }
                }
                p.pop();
            }
        }
    }


    let instance;
    return {
        start: (node) => {
            parent = node;
            instance = new p5(sketch, node);
            canvas ??= instance.canvas;
        },
        stop: () => {
            instance?.remove();
            canvas?.remove();
            resizeObserver?.disconnect();
            parent = canvas = instance = resizeObserver = null;
        },
    };
}
