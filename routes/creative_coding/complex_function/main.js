/// <reference path="../utils/types/gpu.d.ts" />
import "gpu";
import { cubehelix2rgb, rgb2srgb } from "../utils/color.js";
import { arctan2, complex_absSq, complex_zeta, constrain, fpart, map } from "../utils/math.js";

export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**
     * @type {import("../utils/types/gpu.d.ts").GPU}
     */
    let gpu = null;
    /**
     * @type {import("../utils/types/gpu.d.ts").IKernelRunShortcut}
     */
    let kernel = null;

    return {
        start: () => {
            canvas = document.querySelector("article canvas.sketch");
            gpu = new GPU.GPU({ canvas, mode: 'cpu' });
            constrain.add(gpu);
            fpart.add(gpu);
            map.add(gpu);
            arctan2.add(gpu)
            complex_zeta.add(gpu);
            complex_absSq.add(gpu);
            cubehelix2rgb.add(gpu);
            rgb2srgb.add(gpu);
            kernel = gpu.createKernel(function () {
                const re = map(this.thread.x / this.output.x, 0, 1, -this.constants.R, +this.constants.R);
                const im = map(this.thread.y / this.output.y, 0, 1, -this.constants.R, +this.constants.R);
                const z = f([re, im]);
                const r = Math.sqrt(complex_absSq(z));
                const theta = arctan2(z[1], z[0]);
                const hue = (theta < 0.0 ? theta + 2 * Math.PI : theta) / (Math.PI * 2);
                const sat = map(
                    fpart(Math.log2(r)) * fpart(-theta * 12 / (Math.PI * 2)),
                    0, 1, .5, 1
                );
                const lum = map(
                    (1 - 1 / (Math.pow(r, Math.log10(3)) + 1)),
                    0, 1,
                    this.constants.l0, this.constants.l1
                );
                const c = rgb2srgb(cubehelix2rgb([hue, sat * 2, lum]));
                this.color(c[0], c[1], c[2], 1);
            })
                .addFunction(function f(z) {
                    return complex_zeta(z);
                }, {
                    argumentTypes: ['Array(2)'],
                    returnType: 'Array(2)',
                })
                .setConstants({
                    R: 20.0,
                    l0: Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-surface-dim')) / 100,
                    l1: Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-surface-bright')) / 100,
                })
                .setConstantTypes({
                    R: 'Float',
                    l0: 'Float', l1: 'Float'
                })
                .setOutput([canvas.width, canvas.height])
                .setGraphical(true);
            kernel();
        },
        stop: () => {
            canvas = null;
            kernel.destroy();
            gpu.destroy();
            gpu = kernel = null;
        },
    };
}
