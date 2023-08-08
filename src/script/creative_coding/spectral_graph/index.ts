import { getParentSize } from "@/script/utils/dom";
import p5 from "p5";
import { Graph } from "./graph";
import type { p5Extension } from "@/script/utils/types";
export default function execute() {
  let parent: HTMLElement;
  let canvas: HTMLCanvasElement;
  let resizeObserver: ResizeObserver;

  const sketch = (p: p5) => {
    const mainelem = new Graph<number>();
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
      resizeObserver = new ResizeObserver(parentResized);
      resizeObserver.observe(parent);
    };

    p.draw = function () {
      p.background(220);
      p.orbitControl();
      p.debugMode();
      const coord = mainelem.spectral();
      const x = 0;
      const y = coord.length - 1;
      const z = p.floor(coord.length / 2) + 1;
      const xmax = coord.reduce((acc, elem) => p.max(acc, p.abs(elem[x])), 0);
      const ymax = coord.reduce((acc, elem) => p.max(acc, p.abs(elem[y])), 0);
      const zmax = coord.reduce((acc, elem) => p.max(acc, p.abs(elem[z])), 0);
      const max_ = p.max([xmax, ymax, zmax]);
      for (const i in coord) {
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
        for (const j in coord) {
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
    };
  };

  let instance: p5Extension;
  return {
    start: (node: HTMLElement) => {
      parent = node;
      instance = new p5(sketch, node) as p5Extension;
      canvas ??= instance.canvas;
    },
    stop: () => {
      instance?.remove();
      canvas?.remove();
      resizeObserver?.disconnect();
      // parent = canvas = instance = resizeObserver = null;
    },
  };
}
