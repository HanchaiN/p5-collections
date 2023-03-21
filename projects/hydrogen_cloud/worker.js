import { Complex, constrainMap, d3, Vector } from "../utils/index.js";
import { superposition, wave_function } from "./psi.js";

let width, height, buffer;
let psi;
let scale, z_depth;
self.addEventListener("message", function (e) {
    const response = {};
    response.width = width = e.data.width ?? width;
    response.height = height = e.data.height ?? height;
    if (e.data.width || e.data.height) {
        buffer = new Uint8ClampedArray(height * width * 4).fill(255);
    }
    if (e.data.states) {
        psi = superposition(e.data.states.map(({ coeff: { re, im }, psi: { n, l, m } }) => {
            return {
                coeff: Complex.fromCartesian(re ?? 0, im ?? 0),
                psi: wave_function(n, l, m),
            };
        }));
    }
    response.scale = scale = e.data.scale ?? scale;
    response.z_depth = z_depth = e.data.z_depth ?? z_depth;
    if (e.data.render) {
        let a = { r: 1, theta: 0, phi: 0 };
        for (let ix = 0; ix < width; ix++) {
            const x = width * scale * 2 * (ix / width - 1 / 2);
            for (let iy = 0; iy < height; iy++) {
                const y = height * scale * 2 * (iy / height - 1 / 2);
                const z = z_depth;
                const pos = new Vector(x, y, z);
                const p = psi(pos);
                const prob = 1000 * p.absSq();
                const phase = p.theta;
                const brightness = Math.pow(prob / (prob + 1), 0.5);
                const color = d3.lch(
                    constrainMap(brightness, 0, 1, 0, 100),
                    constrainMap(brightness, 0, 1, 0, 100),
                    constrainMap(phase, -Math.PI, +Math.PI, 0, 360),
                ).rgb();
                buffer[iy * (width * 4) + ix * 4 + 0] = color.r;
                buffer[iy * (width * 4) + ix * 4 + 1] = color.g;
                buffer[iy * (width * 4) + ix * 4 + 2] = color.b;
            }
        }
        response.buffer = buffer;
    }
    this.postMessage(response);
});