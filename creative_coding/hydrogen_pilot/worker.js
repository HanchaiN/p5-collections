import { Complex, constrainMap } from "../utils/math.js";
import { d3 } from "../utils/color.js";
import { WaveFunction } from "./psi.js";

let psi;
let states;
let pretime, time_scale = 1;

function getColor(pos, t) {
    const p = psi.psi(pos, t);
    const prob = 1000 * p.absSq();
    const phase = p.theta;
    const brightness = Math.pow(prob / (prob + 1), 0.1);
    return d3.lch(
        constrainMap(brightness, 0, 1, 0, 100),
        constrainMap(brightness, 0, 1, 0, 100),
        constrainMap(phase, -Math.PI, +Math.PI, 0, 360),
    ).formatHex();
}
self.addEventListener("message", function (e) {
    const response = {};
    if (e.data.states) {
        psi = WaveFunction.superposition(e.data.states.map(({ coeff: { re, im }, psi: { n, l, m } }) => {
            return {
                coeff: Complex.fromCartesian(re ?? 0, im ?? 0),
                psi: WaveFunction.fromOrbital(n, l, m),
            };
        }));
    }
    if (e.data.counts) {
        states = (() => {
            const states = [];
            while (states.length < e.data.counts) {
                states.push(psi.sample());
            }
            return states;
        })();
    }
    if (e.data.time && pretime) {
        const deltaTime = e.data.time * time_scale - pretime;
        const time_subdivide = 10;
        states.forEach((position) => {
            for (let i = 0; i < time_subdivide; i++) {
                position.add(psi.getVel(
                    position,
                    pretime + (i / time_subdivide) * deltaTime
                ).mult(deltaTime / time_subdivide));
            }
        });
    }
    if (e.data.time_scale) time_scale = e.data.time_scale;
    if (e.data.time) pretime = e.data.time * time_scale;
    if (states) response.states = states.map(pos => ({
        x: pos.x,
        y: pos.y,
        z: pos.z,
        c: getColor(pos, pretime)
    }));
    this.postMessage(response);
});