import "p5";
import { TuringMachine } from "./turing.js";
import { getParentSize } from "../utils/dom.js";
export default function execute() {
  let parent = null;
  let canvas = null;
  let resizeObserver = null;

  const sketch = (p) => {
    // Display
    const min_resolution = 10, max_resolution = 20; //px
    const _fr = 5; //fps
    const _viewrange = 50; //blocks
    let resolution = (min_resolution + max_resolution) / 2, viewrange = _viewrange;

    // Turing's example
    // const notation = {
    //   states: ["#FF0000", "#00FF00", "#0000FF","#FFFFFF"],
    //   symbols: ["#808080","#000000", "#FFFFFF"],
    //   null_symbol: "#808080",
    //   operation_table: {
    //     "#FF0000": {
    //       "#808080": {
    //         state: "#00FF00",
    //         symbol: "#000000",
    //         direction: "R",
    //       },
    //     },
    //     "#00FF00": {
    //       "#808080": {
    //         state: "#0000FF",
    //         symbol: "#808080",
    //         direction: "R",
    //       },
    //     },
    //     "#0000FF": {
    //       "#808080": {
    //         state: "#FFFFFF",
    //         symbol: "#FFFFFF",
    //         direction: "R",
    //       },
    //     },
    //     "#FFFFFF": {
    //       "#808080": {
    //         state: "#FF0000",
    //         symbol: "#808080",
    //         direction: "R",
    //       },
    //     },
    //   },
    //   initial_state: "#FF0000",
    // };

    // 3state busy beaver
    // const notation = {
    //   states: ["#FF0000", "#00FF00","#0000FF","#000000"],
    //   symbols: ["#000000", "#FFFFFF"],
    //   null_symbol: "#000000",
    //   operation_table: {
    //     "#FF0000": {
    //       "#000000": {
    //         state: "#00FF00",
    //         symbol: "#FFFFFF",
    //         direction: "R",
    //       },
    //       "#FFFFFF": {
    //         state: "#0000FF",
    //         symbol: "#FFFFFF",
    //         direction: "L",
    //       },
    //     },
    //     "#00FF00": {
    //       "#000000": {
    //         state: "#FF0000",
    //         symbol: "#FFFFFF",
    //         direction: "L",
    //       },
    //       "#FFFFFF": {
    //         state: "#00FF00",
    //         symbol: "#FFFFFF",
    //         direction: "R",
    //       },
    //     },
    //     "#0000FF": {
    //       "#000000": {
    //         state: "#00FF00",
    //         symbol: "#FFFFFF",
    //         direction: "L",
    //       },
    //       "#FFFFFF": {
    //         state: "#000000",
    //         symbol: "#FFFFFF",
    //         direction: "N",
    //       },
    //     },
    //   },
    //   initial_state: "#FF0000",
    // };

    // Wolfram's (2,3) Turing machine
    const notation = {
      states: ["#000000", "#FFFFFF"],
      symbols: ["#FF0000", "#00FF00", "#0000FF"],
      null_symbol: "#FF0000",
      operation_table: {
        "#000000": {
          "#FF0000": {
            state: "#FFFFFF",
            symbol: "#00FF00",
            direction: "L",
          },
          "#00FF00": {
            state: "#000000",
            symbol: "#0000FF",
            direction: "R",
          },
          "#0000FF": {
            state: "#000000",
            symbol: "#00FF00",
            direction: "R",
          },
        },
        "#FFFFFF": {
          "#FF0000": {
            state: "#000000",
            symbol: "#0000FF",
            direction: "R",
          },
          "#00FF00": {
            state: "#FFFFFF",
            symbol: "#0000FF",
            direction: "L",
          },
          "#0000FF": {
            state: "#000000",
            symbol: "#FF0000",
            direction: "L",
          },
        },
      },
      initial_state: "#000000",
    };

    // Declare
    const inp = [];
    const tm = new TuringMachine(notation);

    function parentResized() {
      const { width, height } = getParentSize(parent, canvas);
      viewrange = p.constrain(viewrange, Math.floor(width / min_resolution), Math.ceil(width / max_resolution));
      resolution = width / viewrange;
      p.resizeCanvas(width, resolution * 3);
    }
    p.setup = function () {
      tm.init(inp);
      const { width, height } = getParentSize(parent, canvas);
      viewrange = p.constrain(viewrange, Math.floor(width / min_resolution), Math.ceil(width / max_resolution));
      resolution = width / viewrange;
      p.createCanvas(width, resolution * 3);
      if (_fr != 0) {
        p.frameRate(_fr);
      }
      resizeObserver = new ResizeObserver(parentResized).observe(parent);
    }

    p.draw = function () {
      p.background(128);
      p.stroke(64);
      p.fill(tm.state);
      p.rect(
        Math.floor(viewrange / 2) * resolution,
        resolution * 2,
        resolution,
        resolution
      );
      for (let i = 0; i < viewrange; i++) {
        p.fill(tm.read(i + tm.pointer - Math.floor(viewrange / 2)));
        p.rect(i * resolution, resolution * 0, resolution, resolution);
      }
      if (!tm.calculate()) p.noLoop();
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
