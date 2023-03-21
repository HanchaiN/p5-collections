import { constrain } from "../utils/index.js";
const DIFFUSION_RATE = [1, 0.5];
const ADDER = 0.055;
const REMOVER = 0.062;
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
        for (let i = -5; i < 5; i++) {
            for (let j = -5; j < 5; j++) {
                grid[i + Math.floor(size.width / 2)][j + Math.floor(size.height / 2)][1] = 1;
            }
        }
        buffer = new Uint8ClampedArray(size.height * size.width * 4);
        buffer.fill(0);
    }
    if (!buffer) {
        this.postMessage(null);
        return;
    }
    const dt = e.data.dt;
    grid = grid.map((_, i, grid) => _.map((_, j) => {
        if (dt && i >= 1 && j >= 1 && i < size.width - 1 && j < size.height - 1) {
            const reaction = REACTION(grid[i][j]);
            _ = _.map((_, k) => {
                const div_grad = grid[i][j][k] * -1
                    + grid[i - 1][j][k] * 0.2
                    + grid[i + 1][j][k] * 0.2
                    + grid[i][j + 1][k] * 0.2
                    + grid[i][j - 1][k] * 0.2
                    + grid[i - 1][j - 1][k] * 0.05
                    + grid[i + 1][j - 1][k] * 0.05
                    + grid[i + 1][j + 1][k] * 0.05
                    + grid[i - 1][j + 1][k] * 0.05;
                return constrain(
                    _ + dt * (DIFFUSION_RATE[k] * div_grad + reaction[k]),
                    0, 1,
                );
            });
        }
        const color = 255 - constrain(_[0] - _[1], 0, 1) * 255;
        buffer[j * (size.width * 4) + i * 4 + 3] = color;
        return _;
    }));
    this.postMessage(buffer);
})