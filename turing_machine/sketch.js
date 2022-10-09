// Hanchai Nonprasart

// Display
var resolution = 10; //px
var fr = 5; //fps
var viewrange = 50; //blocks

// Turing's example
// let notation = {
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
// let notation = {
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
let notation = {
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
var inp = [];
var tm = new turingMachine(notation);

function setup() {
  tm.init(inp);
  createCanvas(viewrange * resolution, resolution * 3);
  if (fr != 0) {
    frameRate(fr);
  }
}

function draw() {
  background(128);
  stroke(64);
  fill(tm.state);
  rect(
    Math.floor(viewrange / 2) * resolution,
    resolution * 2,
    resolution,
    resolution
  );
  for (let i = 0; i < viewrange; i++) {
    fill(tm.read(i + tm.pointer - Math.floor(viewrange / 2)));
    rect(i * resolution, resolution * 0, resolution, resolution);
  }
  if (!tm.calculate()) noLoop();
}
