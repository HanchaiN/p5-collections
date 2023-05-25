import { constrain } from "../utils/math.js";
const DIFFUSION_RATE = [1, 0.5];
const ADDER = 0.0545;
const REMOVER = 0.0620;
const REACTION = (a, b) => {
    return [
        -a * b * b + ADDER * (1 - a),
        +a * b * b - (ADDER + REMOVER) * b,
    ];
}
const COUNT = 2;
let grid = null, buffer = null, size = { width: null, height: null };
self.addEventListener("message", function (e) {
    if (e.data?.size) {
        size = {
            width: e.data.size.width,
            height: e.data.size.height,
        }
        grid = new Array(size.height).fill(0).map(_ => new Array(size.width).fill(0).map(_ => [1, 0]));
        const s = 10;
        for (let i = -s; i < s; i++) {
            for (let j = -s; j < s; j++) {
                if (i * i + j * j < s * s) {
                    grid[i + Math.round(size.height / 2)][j + Math.round(size.width / 2)][1] = 1;
                }
            }
        }
        grid = new Float64Array(grid.flat(2));
        buffer = new Uint8ClampedArray(size.height * size.width * 4);
        buffer.fill(0);
    }
    if (e.data?.dt) {
        const dt = e.data.dt;
        const grid_ = new Float64Array(grid.length);
        for (let i = 0; i < size.width; i++) {
            for (let j = 0; j < size.height; j++) {
                const reaction = REACTION(
                    grid[j * (size.width * COUNT) + i * COUNT + 0],
                    grid[j * (size.width * COUNT) + i * COUNT + 1],
                );
                for (let k = 0; k < COUNT; k++) {
                    let delta = 0;
                    if (dt && i >= 1 && j >= 1 && i < size.width - 1 && j < size.height - 1) {
                        const div_grad =
                            grid[j * (size.width * COUNT) + i * COUNT + k] * -1
                            + grid[j * (size.width * COUNT) + (i - 1) * COUNT + k] * 0.2
                            + grid[j * (size.width * COUNT) + (i + 1) * COUNT + k] * 0.2
                            + grid[(j - 1) * (size.width * COUNT) + i * COUNT + k] * 0.2
                            + grid[(j + 1) * (size.width * COUNT) + i * COUNT + k] * 0.2
                            + grid[(j - 1) * (size.width * COUNT) + (i - 1) * COUNT + k] * 0.05
                            + grid[(j - 1) * (size.width * COUNT) + (i + 1) * COUNT + k] * 0.05
                            + grid[(j + 1) * (size.width * COUNT) + (i - 1) * COUNT + k] * 0.05
                            + grid[(j + 1) * (size.width * COUNT) + (i + 1) * COUNT + k] * 0.05;
                        delta += DIFFUSION_RATE[k] * div_grad + reaction[k];
                    }
                    grid_[j * (size.width * COUNT) + i * COUNT + k] = constrain(
                        grid[j * (size.width * COUNT) + i * COUNT + k] + dt * delta,
                        0, 1,
                    );
                }
                const color = 255 - constrain(grid_[j * (size.width * COUNT) + i * COUNT + 0] - grid_[j * (size.width * COUNT) + i * COUNT + 1], 0, 1) * 255;
                buffer[j * (size.width * 4) + i * 4 + 3] = color;
            }
        }
        grid = grid_;
    }
    this.postMessage({ buffer });
})