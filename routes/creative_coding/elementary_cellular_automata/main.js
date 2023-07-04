import "p5";
import { CA } from "./ca.js";
import "./ca.rule.js";
export default function execute() {
  let parent = null;
  let canvas = null;

  const sketch = (p) => {
    const forward = 1;
    const gen = 100;
    const bit = 64;
    const size = 5;
    const looped = false;
    let rule = 0;
    let ca = new CA(bit, gen, looped);

    CA.p = p;

    function nextRule() {
      ca.rule = ++rule;
      ca.filler = Math.floor(Math.random() * Math.pow(2, bit));
      p.background(100);
      p.loop();
    }

    p.setup = function () {
      const canvas = looped
        ? p.createCanvas(size * bit, size * gen * forward)
        : p.createCanvas(size * (bit + 2 * gen), size * gen * forward);
      canvas.mouseClicked(nextRule);
      p.background(100);
      ca.rule = rule;
      ca.filler = Math.floor(Math.random() * Math.pow(2, bit));
    };

    p.draw = function () {
      ca.display(p, forward);
      if (ca.generation < ca.h * forward) {
        ca.generate();
      } else {
        p.noLoop();
        nextRule();
      }
    };
  };

  let instance;
  return {
    start: (node = document.querySelector("main.sketch")) => {
      parent = node;
      instance = new p5(sketch, node);
      canvas = instance.canvas;
      parent.style.display = "flex";
      parent.style.justifyContent = "center";
      parent.style.alignItems = "center";
    },
    stop: () => {
      instance?.remove();
      canvas?.remove();
      parent = canvas = instance = null;
    },
  };
}
