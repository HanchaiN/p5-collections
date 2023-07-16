/// <reference path="../utils/types/gpu.d.ts" />
import "gpu";
import { hcl2rgb, rgb2srgb } from "../utils/color.js";
import { getColor } from "../utils/dom.js";
import { arctan2, constrain, fpart, map } from "../utils/math.js";
import { psi_orbital } from "./psi.js";

export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**@type {HTMLCanvasElement} */
    let foreground = null;
    /**@type {CanvasRenderingContext2D} */
    let ctx = null;
    /**
     * @type {import("../utils/types/gpu.d.ts").GPU}
     */
    let gpu = null;
    /**
     * @type {import("../utils/types/gpu.d.ts").IKernelRunShortcut}
     */
    let kernel = null;
    const T = 20_000;
    const n = 4,
        l = 2,
        m = -1,
        R = Math.pow(n + 2, 2);

    return {
        start: () => {
            foreground = document.querySelector("article .sketch#foreground");
            ctx = foreground.getContext("2d");
            canvas = document.querySelector("article .sketch#main");
            gpu = new GPU.GPU({ canvas });
            arctan2.add(gpu);
            psi_orbital.add(gpu);
            hcl2rgb.add(gpu);
            rgb2srgb.add(gpu);
            constrain.add(gpu);
            map.add(gpu);
            kernel = gpu.createKernel(function (z, t) {
                const x = map(this.thread.x / this.output.x, 0, 1, -this.constants.R, +this.constants.R);
                const y = map(this.thread.y / this.output.y, 0, 1, -this.constants.R, +this.constants.R);
                const v = psi(x, y, z, t);
                const prob = 1000 * (v[0] * v[0] + v[1] * v[1]);
                const phase = arctan2(v[1], v[0]);
                const brightness = Math.pow(prob / (prob + 1), 0.5);
                const c = rgb2srgb(hcl2rgb([
                    (phase < 0.0 ? phase + 2 * Math.PI : phase) / (2.0 * Math.PI),
                    constrain(brightness, 0, 1),
                    constrain(brightness, 0, 1)
                ]));
                this.color(c[0], c[1], c[2], 1);
            })
                .addFunction(function psi(x, y, z, t) {
                    return psi_orbital(this.constants.n, this.constants.l, this.constants.m, x, y, z, t);
                }, {
                    argumentTypes: { x: 'Float', y: 'Float', z: 'Float', t: 'Float' },
                    returnType: 'Array(2)',
                })
                .setConstants({
                    R, n, l, m
                })
                .setConstantTypes({
                    R: 'Float',
                    n: 'Integer', l: 'Integer', m: 'Integer'
                })
                .setOutput([canvas.width, canvas.height])
                .setArgumentTypes({ z: 'Float', t: 'Float' })
                .setGraphical(true);
            kernel(0, 0);
            requestAnimationFrame(function draw(t) {
                const z = map(fpart(t / T), 0, 1, -R, +R);
                kernel(z, 0.0);
                requestAnimationFrame(draw);
            });
            requestAnimationFrame(function draw(t) {
                const z = map(fpart(t / T), 0, 1, -R, +R);
                ctx.clearRect(0, 0, foreground.width, foreground.height)
                for (let i = 0; i <= R; i++) {
                    if (Number.isInteger(Math.sqrt(i)))
                        ctx.strokeStyle = getColor('--color-primary', "#00F");
                    else
                        ctx.strokeStyle = getColor('--color-on-primary', "#0FF");
                    ctx.beginPath();
                    ctx.arc(
                        foreground.width / 2, foreground.height / 2,
                        map(Math.sqrt(Math.max(Math.pow(i, 2) - Math.pow(z, 2), 0)), 0, R, 0, foreground.width / 2),
                        0, 2 * Math.PI,
                    )
                    ctx.stroke();
                }
                requestAnimationFrame(draw);
            });
        },
        stop: () => {
            isActive = false;
            ctx = canvas = null;
            kernel.destroy();
            gpu.destroy();
            gpu = kernel = null;
        },
    };
}
