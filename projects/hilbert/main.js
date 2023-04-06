import "p5";
import { getParentSize } from "../utils/dom.js";
import { Vector } from "../utils/math.js";
export default function execute() {
  let parent = null;
  let canvas = null;
  let resizeObserver = null;
  let worker;

  const sketch = (p) => {
    let foreground, background;
    let order = 0, maxOrder;
    let dimension = 0;


    p.setup = function () {
      const { width, height } = getParentSize(parent, canvas);
      const sketch = p.createCanvas(width, height);
      dimension = Math.max(p.width, p.height);
      maxOrder = Math.ceil(Math.log2(dimension));
      background = p.createImage(1, 1);
      foreground = p.createGraphics(p.width, p.height);
      p.colorMode(p.HSB, 1, 1, 1, 1);
      foreground.colorMode(p.HSB, 1, 1, 1, 1);
      foreground.stroke(0);
      worker.postMessage({ maxOrder, d: true, buffer: true });
      resizeObserver = new ResizeObserver(parentResized).observe(parent);
      sketch.mouseClicked(() => {
        order++;
        if (order > maxOrder) {
          order = 0;
          drawBackground(0, maxOrder);
        }
        drawForeground();
      });
      worker.addEventListener("message", (e) => {
        if (e.data.id !== "f") return;
        const resolution = e.data.resolution;
        const size = new Vector(foreground.width, foreground.height);
        const loc = e.data.d.map((loc) => {
          return new Vector(...loc)
            .sub(.5 * (resolution - 1))
            .mult(1 / resolution)
            .mult(size);
        });
        foreground.clear();
        foreground.strokeWeight(dimension / (resolution + 1) / 10);
        foreground.push();
        foreground.translate(size.x / 2, size.y / 2);
        foreground.beginShape();
        for (let i = 0; i < e.data.length; i++) {
          foreground.vertex(loc[i].x, loc[i].y);
          foreground.point(loc[i].x, loc[i].y);
        }
        foreground.noFill();
        foreground.endShape();
        foreground.pop();
        p.redraw();
      });
      worker.addEventListener("message", (e) => {
        if (e.data.id !== "b") return;
        const resolution = e.data.resolution;
        background = p.createImage(resolution, resolution);
        const buffer = e.data.buffer;
        background.loadPixels();
        background.imageData = new ImageData(buffer, resolution, resolution);
        background.updatePixels();
        p.redraw();
      });
      drawBackground(0, maxOrder);
      p.noLoop();
    }

    function parentResized() {
      const { width, height } = getParentSize(parent, canvas);
      p.resizeCanvas(width, height);
      dimension = Math.max(p.width, p.height);
      drawBackground(maxOrder, Math.ceil(Math.log2(dimension)));
      maxOrder = Math.ceil(Math.log2(dimension));
      foreground = p.createGraphics(p.width, p.height);
      drawForeground();
    }

    function drawBackground(from, to, time = 2000) {
      for (let order = from; order < to; order++) {
        setTimeout(() => worker?.postMessage?.({
          order,
          buffer: true,
          id: "b"
        }), time * (1 - 1 / Math.pow(2, order - from)));
      }
      setTimeout(() => worker?.postMessage?.({
        order: to,
        buffer: true,
        id: "b"
      }), time);
    }
    function drawForeground() {
      worker?.postMessage?.({ order, d: true, id: "f" });
    }

    p.draw = function () {
      p.background(0, 0, 1, 100);
      p.image(background, 0, 0, p.width, p.height);
      p.image(foreground, 0, 0, p.width, p.height);
    }
  }

  let instance;
  return {
    start: (node) => {
      parent = node;
      worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
      instance = new p5(sketch, node);
      canvas ??= instance.canvas;
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
