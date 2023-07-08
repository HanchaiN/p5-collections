import * as d3 from "../utils/color.js";
import { getColor } from "../utils/dom.js";
import { Complex, fract, map, randomGaussian, zeta } from "../utils/math.js";

export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**@type {CanvasRenderingContext2D} */
    let ctx = null;
    /**@type {ImageData} */
    let buffer = null;
    const background = getColor('--color-surface-container-3', "#000");
    const f = (z) => zeta(z);
    let i = 0;
    let j = 0;

    function setup() {
        if (!canvas) return;
        i = 0;
        j = 0;
        ctx.fillStyle = background.formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
        requestAnimationFrame(draw);
    }
    function draw() {
        if (!canvas)
            return;
        for (let _ = 0; _ < 512; _++) {
            j++;
            if (j >= canvas.height) {
                j = 0;
                i++;
            }
            if (i >= canvas.width)
                return;
            const re = map(i + randomGaussian(0, .3), 0, canvas.width, -20, +20);
            const im = map(j + randomGaussian(0, .3), canvas.height, 0, -20, +20);
            const z = f(Complex.fromCartesian(re, im));
            const hue = map(z.theta, -Math.PI, +Math.PI, -180, 180);
            const sat = map(
                fract(Math.log2(z.r)) * fract(-z.theta * 12 / (2 * Math.PI)),
                0, 1, .5, 1
            );
            const lum = map(
                (1 - 1 / (Math.pow(z.r, Math.log10(3)) + 1)),
                0, 1,
                Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-surface-dim')) / 100,
                Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-surface-bright')) / 100,
            );
            const color = d3.cubehelix(hue, sat * 2, lum).rgb();
            buffer.data[j * (canvas.width * 4) + i * 4 + 0] = color.r;
            buffer.data[j * (canvas.width * 4) + i * 4 + 1] = color.g;
            buffer.data[j * (canvas.width * 4) + i * 4 + 2] = color.b;
        }
        ctx.putImageData(buffer, 0, 0);
        requestAnimationFrame(draw);
    }

    return {
        start: () => {
            canvas = document.querySelector("article canvas.sketch");
            ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
            setup();
        },
        stop: () => {
            canvas?.remove();
            buffer = canvas = null;
        },
    };
}
