import { Complex, constrainMap, d3, Vector } from "../utils/index.js";
import { superposition, wave_function, H_BAR, MASS_REDUCED } from "./psi.js";

let psi, point_gen;
let states;
let pretime, time_scale = 1;

const EPSILON = 1e-12;
const DELTA_R = .25;
function getVel(pos, t) {
    const val = psi(pos, t);
    if (val.absSq() === 0) return new Vector();
    const vel = new Vector(
        ...new Array(3).fill(0).map((_, i) => {
            const delta = new Vector(
                ...new Array(3).fill(0).map((_, j) => (j === i ? +EPSILON : 0))
            );
            const next = pos.copy().add(delta);
            const prev = pos.copy().sub(delta);
            const vel_ = Complex.sub(psi(next, t), psi(prev, t)).div(2 * EPSILON).div(val).im;
            return vel_;
        })
    );
    vel.mult(H_BAR / MASS_REDUCED);
    return vel;
}
function getColor(pos, t) {
    const p = psi(pos, t);
    const prob = 1000 * p.absSq();
    const phase = p.theta;
    const brightness = Math.pow(prob / (prob + 1), 0.25);
    return d3.lch(
        constrainMap(brightness, 0, 1, 0, 100),
        constrainMap(brightness, 0, 1, 0, 100),
        constrainMap(phase, -Math.PI, +Math.PI, 0, 360),
    ).formatHex();
}
self.addEventListener("message", function (e) {
    const response = {};
    if (e.data.states) {
        psi = superposition(e.data.states.map(({ coeff: { re, im }, psi: { n, l, m } }) => {
            return {
                coeff: Complex.fromCartesian(re ?? 0, im ?? 0),
                psi: wave_function(n, l, m),
            };
        }));
        const r_max = Math.pow(e.data.states.reduce(
            (n_max, { psi: { n } }) => Math.max(n_max, n),
            0
        ) + 1, 2);
        point_gen = (function* () {
            const lattice = (function () {
                const lattice = [];
                let total_prob = 0;
                const d_r = DELTA_R;
                for (let r = 0; r < r_max; r += d_r) {
                    const R = r + d_r / 2;
                    const d_theta = d_r / R;
                    for (let theta = 0; theta <= Math.PI; theta += d_theta) {
                        const Theta = theta + d_theta / 2;
                        const d_phi = d_r / (R * Math.abs(Math.cos(Theta)));
                        const volume = Math.pow(R, 2) * Math.sin(Theta) * d_r * d_theta * d_phi;
                        for (let phi = 0; phi < 2 * Math.PI; phi += d_phi) {
                            const Phi = phi + d_phi / 2;
                            const pos = Vector.fromSphere(R, Theta, Phi);
                            const density = psi(pos).absSq();
                            const probability = density * volume;
                            total_prob += probability;
                            if (1 + probability > 1) {
                                lattice.push({
                                    x: pos.x,
                                    y: pos.y,
                                    z: pos.z,
                                    cdf: total_prob,
                                });
                            }
                        }
                    }
                }
                // Use to update `normalizer` in case of error;
                console.log(
                    `Total probability of points in lattice is ${total_prob}.`
                );
                return lattice.map(({ x, y, z, cdf }) => ({ x, y, z, cdf: cdf / total_prob }));
            })();
            while (true) {
                const seed = Math.random();
                let start = 0, end = lattice.length - 1;
                let ind = -1;
                while (start <= end) {
                    let mid = Math.floor((start + end) / 2);

                    if (lattice[mid].cdf <= seed) {
                        start = mid + 1;
                    } else {
                        ind = mid;
                        end = mid - 1;
                    }
                }
                yield new Vector(lattice[ind].x, lattice[ind].y, lattice[ind].z);
            }
        })()
    }
    if (e.data.counts) {
        states = (() => {
            const states = [];
            while (states.length < e.data.counts) {
                states.push(point_gen.next().value);
            }
            return states;
        })();
    }
    if (e.data.time && pretime) {
        const deltaTime = e.data.time * time_scale - pretime;
        const time_subdivide = 10;
        states.forEach((position) => {
            for (let i = 0; i < time_subdivide; i++)
                position.add(
                    getVel(
                        position,
                        pretime + (i / time_subdivide) * deltaTime
                    ).mult(deltaTime / time_subdivide)
                );
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