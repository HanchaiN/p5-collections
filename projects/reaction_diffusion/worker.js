import { constrain } from "../utils/index.js";
const DIFFUSION_RATE = [1, 0.5];
const ADDER = 0.0545;
const REMOVER = 0.0620;
const REACTION = ([a, b]) => {
    return [
        -a * b * b + ADDER * (1 - a),
        +a * b * b - (ADDER + REMOVER) * b,
    ];
}
let grid = null, buffer = null, size = { width: null, height: null };
self.addEventListener("message", function (e) {
    if (e.data?.size) {
        size = {
            width: e.data.size.width,
            height: e.data.size.height,
        }
        grid = new Array(size.width).fill(0).map(_ => new Array(size.height).fill(0).map(_ => [1, 0]));
        const s = 10;
        for (let i = -s; i < s; i++) {
            for (let j = -s; j < s; j++) {
                if (i * i + j * j < s * s) {
                    grid[i + Math.round(size.width / 2)][j + Math.round(size.height / 2)][1] = 1;
                }
            }
        }
        buffer = new Uint8ClampedArray(size.height * size.width * 4);
        buffer.fill(0);
    }
    if (e.data?.dt) {
        const dt = e.data.dt;
        grid = grid.map((_, i, grid) => _.map((_, j) => {
            if (dt && i >= 1 && j >= 1 && i < size.width - 1 && j < size.height - 1) {
                const reaction = REACTION(grid[i][j]);
                const div_grad = _.map((_, k) =>
                    grid[i][j][k] * -1
                    + grid[i - 1][j][k] * 0.2
                    + grid[i + 1][j][k] * 0.2
                    + grid[i][j + 1][k] * 0.2
                    + grid[i][j - 1][k] * 0.2
                    + grid[i - 1][j - 1][k] * 0.05
                    + grid[i + 1][j - 1][k] * 0.05
                    + grid[i + 1][j + 1][k] * 0.05
                    + grid[i - 1][j + 1][k] * 0.05
                );
                _ = _.map((_, k) => constrain(
                    _ + dt * (DIFFUSION_RATE[k] * div_grad[k] + reaction[k]),
                    0, 1,
                ));
            }
            const color = 255 - constrain(_[0] - _[1], 0, 1) * 255;
            buffer[j * (size.width * 4) + i * 4 + 3] = color;
            return _;
        }));
    }
    this.postMessage({ buffer });
})