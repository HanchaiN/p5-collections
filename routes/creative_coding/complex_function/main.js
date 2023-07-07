import * as d3 from "../utils/color.js";
import { getColor } from "../utils/dom.js";
import { Complex, fract, map, pow, randomGaussian, zeta } from "../utils/math.js";

export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**@type {CanvasRenderingContext2D} */
    let ctx = null;
    /**@type {Uint8ClampedArray} */
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
        buffer = new Uint8ClampedArray(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
        requestAnimationFrame(draw);
    }
    function draw() {
        if (!canvas)
            return ;
        for (let _ = 0; _ < 64; _++)
        {
            j++;
            if (j >= canvas.height)
            {
                j = 0;
                i++;
            }
            if (i >= canvas.width)
                return;
            const z = Complex.add(...new Array(4).fill(0).map(_ => {
                const re = map(i + randomGaussian(0, .3), 0, canvas.width, -10, +10);
                const im = map(j + randomGaussian(0, .3), canvas.height, 0, -10, +10);
                const z = f(Complex.fromCartesian(re, im));
                return (z);
            })).div(4);
            const hue = map(z.theta, -Math.PI, +Math.PI, 0, 360);
            const sat = map(
                pow(2 * Math.abs(fract(z.theta * 20 / (2 * Math.PI)) - 0.5), 10),
                0, 1, 75, 0
            );
            const lum = map(
                fract(Math.log10(z.r)),
                0, 1, 80, 70
            );
            const color = d3.hcl(hue, sat, lum).rgb();
            buffer[j * (canvas.width * 4) + i * 4 + 0] = color.r;
            buffer[j * (canvas.width * 4) + i * 4 + 1] = color.g;
            buffer[j * (canvas.width * 4) + i * 4 + 2] = color.b;
        }
        const image = new ImageData(buffer, canvas.width, canvas.height);
        ctx.putImageData(image, 0, 0);
        requestAnimationFrame(draw);
    }

    return {
        start: (node = document.querySelector("article>canvas.sketch")) => {
            canvas = node;
            ctx = canvas.getContext("2d", { alpha: false });
            setup();
        },
        stop: () => {
            canvas?.remove();
            buffer = canvas = null;
        },
    };
}
