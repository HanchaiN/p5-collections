import { Complex, pow, fract, map, zeta } from "../utils/math.js";
import * as d3 from "../utils/color.js";

let size = {}, buffer;

const f = (z) => zeta(z);
self.addEventListener("message", function (e) {
    const response = {};
    if (e.data?.size) {
        size.w = e.data.size.width;
        size.h = e.data.size.height;
        size.dx = e.data.size.dx ?? 0;
        size.dy = e.data.size.dy ?? 0;
        size.sx = e.data.size.sx ?? size.w;
        size.sy = e.data.size.sy ?? size.h;
        size.x = e.data.size.x ?? e.data.size.y * size.sx / size.sy ?? size.sx;
        size.y = e.data.size.y ?? size.x * size.sy / size.sx;
        buffer = new Uint8ClampedArray(size.h * size.w * 4);
        buffer.fill(255);
    }
    response.size = size;
    if (e.data.render) {
        for (let i = 0; i < size.w; i++) {
            const re = size.x * 2 * (size.dx + i - size.sx / 2) / size.sx;
            for (let j = 0; j < size.h; j++) {
                const im = size.y * 2 * (size.dy + j - size.sy / 2) / size.sy;
                const z = f(Complex.fromCartesian(re, im));
                const hue = map(z.theta, -Math.PI, +Math.PI, 0, 360);
                const sat = map(
                    pow(2 * Math.abs(fract(z.theta * 20 / (2 * Math.PI)) - 0.5), 10),
                    0, 1, 75, 0
                );
                const lum = map(
                    fract(Math.log10(z.r)),
                    0, 1, 75, 70
                );
                const color = d3.hcl(hue, sat, lum).rgb();
                buffer[j * (size.w * 4) + i * 4 + 0] = color.r;
                buffer[j * (size.w * 4) + i * 4 + 1] = color.g;
                buffer[j * (size.w * 4) + i * 4 + 2] = color.b;
            }
            response.buffer = buffer;
            this.postMessage(response);
        }
        response.done = true;
    }
    this.postMessage(response);
});