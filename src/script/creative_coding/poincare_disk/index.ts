import { getColor, getParentSize } from "@/script/utils/dom";
import { Complex } from "@/script/utils/math/complex";
import p5 from "p5";
import { Draggable } from "./draggable";
import { Gyrovector } from "./gyrovector";
import type { p5Extension } from "@/script/utils/types";
export default function execute() {
  let parent: HTMLElement;
  let canvas: HTMLCanvasElement;
  let resizeObserver: ResizeObserver;

  const sketch = (p: p5) => {
    let r: number, Ox: number, Oy: number;
    const A = new Draggable(10);
    const B = new Draggable(10);

    Draggable.p = p;

    function setOffset() {
      Ox = p.width / 2;
      Oy = p.height / 2;
      r = Math.min(Ox, Oy);
      A.setOffset(Ox, Oy, r);
      B.setOffset(Ox, Oy, r);
    }
    function canvasposition(x: number, y: number): [number, number] {
      return [x * r + Ox, -y * r + Oy];
    }
    function calculateposition(x: number, y: number): [number, number] {
      return [(x - Ox) / r, (-y + Oy) / r];
    }
    function parentResized() {
      const { width, height } = getParentSize(parent, canvas);
      p.resizeCanvas(width, height);
      setOffset();
    }
    p.setup = function () {
      const { width, height } = getParentSize(parent, canvas);
      p.createCanvas(width, height);
      setOffset();
      A.setPosition(...canvasposition(0, 0.975));
      B.setPosition(...canvasposition(0.1, -0.99));
      resizeObserver = new ResizeObserver(parentResized);
      resizeObserver.observe(parent);
    };
    p.draw = function () {
      p.clear(0, 0, 0, 0);
      p.strokeWeight(1);
      p.stroke(getColor("--color-outline").formatHex8());
      p.fill(getColor("--color-surface-container-3").formatHex8());
      p.circle(Ox, Oy, 2 * r);
      p.strokeWeight(5);
      p.stroke(getColor("--color-outline").formatHex8());
      p.point(Ox, Oy);

      A.hover();
      A.update();
      B.hover();
      B.update();
      operate();
      A.show();
      B.show();
    };

    function operate() {
      p.push();
      const a = new Gyrovector(
        Complex.fromCartesian(...calculateposition(A.x, A.y)),
      );
      const b = new Gyrovector(
        Complex.fromCartesian(...calculateposition(B.x, B.y)),
      );
      p.strokeWeight(2.5);
      p.stroke(getColor("--color-on-surface").formatHex8());
      p.line(Ox, Oy, A.x, A.y);
      p.stroke(getColor("--color-on-surface-var").formatHex8());
      p.line(Ox, Oy, B.x, B.y);
      {
        p.strokeWeight(3.75);
        p.stroke(getColor("--color-tertiary").formatHex8());
        p.noFill();
        const l = Gyrovector.geodesic(a, a.add(b));
        switch (l[0]) {
          case "circle":
            p.circle(...canvasposition(l[1], l[2]), 2 * r * l[3]);
            break;
        }
      }
      {
        const sum = a.add(b);
        const pos = canvasposition(sum.z.re, sum.z.im);
        p.strokeWeight(7.5);
        p.stroke(getColor("--color-tertiary").formatHex8());
        p.point(pos[0], pos[1]);
      }
      {
        p.strokeWeight(3.75);
        p.stroke(getColor("--color-secondary").formatHex8());
        p.noFill();
        const l = Gyrovector.geodesic(a, b);
        switch (l[0]) {
          case "circle":
            p.circle(...canvasposition(l[1], l[2]), 2 * r * l[3]);
            break;
        }
      }
      p.pop();
    }

    p.mousePressed = function () {
      A.pressed();
      B.pressed();
    };
    p.mouseReleased = function () {
      A.released();
      B.released();
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
