import { getParentSize } from "@/script/utils/dom";
import { p5Extension } from "@/script/utils/types";
import p5 from "p5";
import type { Rule } from "./turing";
import { TuringMachine } from "./turing";
export default function execute() {
  let parent: HTMLElement;
  let canvas: HTMLCanvasElement;
  let resizeObserver: ResizeObserver;

  const sketch = (p: p5) => {
    // Display
    const min_resolution = 10,
      max_resolution = 20; //px
    const _fr = 0; //fps
    const _viewrange = 50; //blocks
    let resolution = (min_resolution + max_resolution) / 2,
      viewrange = _viewrange;

    // Wolfram's (2,3) Turing machine
    type State = "#000000" | "#FFFFFF";
    type Entry = "#FF0000" | "#00FF00" | "#0000FF";
    const notation: Rule<State, Entry> = {
      states: ["#000000", "#FFFFFF"],
      entries: ["#FF0000", "#00FF00", "#0000FF"],
      null_symbol: "#FF0000",
      operation_table: new Map([
        [
          "#000000",
          new Map<
            Entry,
            {
              state: State;
              symbol: Entry;
              direction: "R" | "L" | "N";
            }
          >([
            [
              "#FF0000",
              {
                state: "#FFFFFF",
                symbol: "#00FF00",
                direction: "L",
              },
            ],
            [
              "#00FF00",
              {
                state: "#000000",
                symbol: "#0000FF",
                direction: "R",
              },
            ],
            [
              "#0000FF",
              {
                state: "#000000",
                symbol: "#00FF00",
                direction: "R",
              },
            ],
          ]),
        ],
        [
          "#FFFFFF",
          new Map<
            Entry,
            {
              state: State;
              symbol: Entry;
              direction: "R" | "L" | "N";
            }
          >([
            [
              "#FF0000",
              {
                state: "#000000",
                symbol: "#0000FF",
                direction: "R",
              },
            ],
            [
              "#00FF00",
              {
                state: "#FFFFFF",
                symbol: "#0000FF",
                direction: "L",
              },
            ],
            [
              "#0000FF",
              {
                state: "#000000",
                symbol: "#FF0000",
                direction: "L",
              },
            ],
          ]),
        ],
      ]),
      initial_state: "#000000",
    };

    // Declare
    const inp: Entry[] = [];
    const tm = new TuringMachine(notation);

    function parentResized() {
      const { width } = getParentSize(parent, canvas);
      viewrange = p.constrain(
        viewrange,
        Math.floor(width / min_resolution),
        Math.ceil(width / max_resolution),
      );
      resolution = width / viewrange;
      p.resizeCanvas(width, resolution * 3);
    }
    p.setup = function () {
      tm.init(inp);
      const { width } = getParentSize(parent, canvas);
      viewrange = p.constrain(
        viewrange,
        Math.floor(width / min_resolution),
        Math.ceil(width / max_resolution),
      );
      resolution = width / viewrange;
      p.createCanvas(width, resolution * 3);
      if (_fr > 0) {
        p.frameRate(_fr);
      }
      resizeObserver = new ResizeObserver(parentResized);
      resizeObserver.observe(parent);
    };

    p.draw = function () {
      p.background(128);
      p.stroke(64);
      p.fill(tm.state);
      p.rect(
        Math.floor(viewrange / 2) * resolution,
        resolution * 2,
        resolution,
        resolution,
      );
      for (let i = 0; i < viewrange; i++) {
        p.fill(tm.read(i + tm.pointer - Math.floor(viewrange / 2)));
        p.rect(i * resolution, resolution * 0, resolution, resolution);
      }
      if (!tm.calculate()) p.noLoop();
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
    },
  };
}
