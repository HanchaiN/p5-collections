import { combination, Complex, factorial, permutation, pow, product, Vector, ComplexVector } from "../utils/index.js";
export const RADIUS_REDUCED = 1;
export const MASS_REDUCED = 9.109e-31;
export const H_BAR = 1.054e-34;
export const Z = 1;
const SAMPLE_RESOLUTION = .25;
const EPSILON = 1e-12;

function laguerre(n, k) {
    const coeff = new Array(n + 1).fill(0).map((_, i) => pow(-1, i) * combination(n + k, n - i) / factorial(i));
    return (x) => coeff.reduceRight((prev, curr) => prev * x + curr, 0);
}
function laguerre_der(n, k, order = 1) {
    if (order > n) return (x) => 0;
    const factor = pow(-1, order);
    const laguerre_ = laguerre(n - order, k + order);
    return (x) => factor * laguerre_(x);
}
function legendre(m, l) {
    if (Math.abs(m) > l) {
        return (x) => 0;
    }
    if (l < 0) {
        return legendre(m, -l - 1);
    }
    if (m < 0) {
        const legendre_ = legendre(-m, l);
        const factor = pow(-1, -m) * product(l - m + 1, l + m);
        return (x) => legendre_(x) * factor;
    }
    const factor = pow(-1, m) * pow(2, l);
    const coeff = new Array(l - m + 1).fill(0).map((_, ind) =>
        factor * combination(l, ind + m) * combination((l + ind + m - 1) / 2, l) * permutation(ind + m, m)
    );
    return (x) =>
        coeff.reduceRight((prev, curr) => prev * x + curr, 0) * Math.sqrt(pow(1 - x * x, m));
}
function legendre_der(m, l, order = 1) {
    if (order === 0) return legendre(m, l);
    if (order === 1) {
        const legendre_ = legendre(m, l);
        const legendre__ = legendre(m, l + 1);
        return (x) => (-(l + 1) * x * legendre_(x) + (l - m + 1) * legendre__(x)) / (pow(x, 2) - 1)
    }
    throw new Error();
}
function sph_harm(m, l) {
    if (m < 0) {
        const sph_harm_ = sph_harm(-m, l);
        const factor = pow(-1, -m);
        return (theta, phi) =>
            sph_harm_(theta, phi)
                .mult(factor)
                .conj();
    }
    const legendre_ = legendre(m, l);
    const factor = pow(-1, m) * Math.sqrt((2 * l + 1) / (4 * Math.PI) / product(l - m + 1, l + m));
    return (theta, phi) =>
        Complex.fromCartesian(0, m * phi)
            .exp()
            .mult(factor * legendre_(Math.cos(theta)));
}
function sph_harm_der(m, l, order_theta = 0, order_phi = 0) {
    if (m < 0) {
        const sph_harm_der_ = sph_harm_der(-m, l, order_theta, order_phi);
        const factor = pow(-1, -m);
        return (theta, phi) =>
            sph_harm_der_(theta, phi)
                .mult(factor)
                .conj();
    }
    if (order_phi !== 0) {
        const factor_phi = Complex.fromPolar(m, Math.PI / 2).pow(order_phi);
        const sph_harm_der_ = sph_harm_der(m, l, order_theta);
        return (theta, phi) => factor_phi.mult(sph_harm_der_(theta, phi));
    }
    if (order_theta === 0) return sph_harm(m, l);
    if (order_theta === 1) {
        const legendre_der_ = legendre_der(m, l, order_theta);
        const factor = pow(-1, m) * Math.sqrt((2 * l + 1) / (4 * Math.PI) / product(l - m + 1, l + m));
        return (theta, phi) =>
            Complex.fromCartesian(0, m * phi)
                .exp()
                .mult(- factor * legendre_der_(Math.cos(theta)) * Math.sin(theta));
    }
    throw new Error();
}

export class WaveFunction {
    constructor() { }
    psi(vec, time = 0) {
        throw new Error();
    }
    sample(time = 0) {
        throw new Error();
    }
    getVel(pos, time = 0) {
        const val = this.psi(pos, time);
        if (val.absSq() === 0) return new Vector();
        const der = this._der(pos, time);
        const vel = der.div(val).im.mult(H_BAR / MASS_REDUCED);
        return vel;
    }
    _der(pos, time = 0) {
        return new ComplexVector(
            ...new Array(3).fill(0).map((_, i) => {
                const delta = new Vector(
                    ...new Array(3).fill(0).map((_, j) => (j === i ? +EPSILON : 0))
                );
                const next = pos.copy().add(delta);
                const prev = pos.copy().sub(delta);
                const der = Complex.sub(this.psi(next, time), this.psi(prev, time)).div(2 * EPSILON);
                return der;
            })
        );
    }
    static superposition(states_) {
        const psi = new WaveFunction();
        const states = states_;
        const mag = Math.sqrt(states.reduce((mag, { coeff }) => mag + coeff.absSq(), 0));
        if (mag !== 0)
            states.forEach((state) => {
                state.coeff.div(mag);
            });
        psi.psi = (vec, time = 0) => {
            return states.reduce(
                (prev, { coeff, psi }) =>
                    prev.add(psi.psi(vec, time).mult(coeff)),
                Complex.fromCartesian(),
            );
        }
        psi.sample = (time = 0) => {
            const seed = Math.random();
            let total_prob = 0;
            for (let { coeff, psi } of states) {
                total_prob += coeff.absSq();
                if (total_prob > seed) {
                    return psi.sample(time);
                }
            }
        }
        psi._der = (pos, time = 0) => {
            const der = states.reduce(
                (prev, { coeff, psi }) => {
                    const v = prev.add(psi._der(pos, time).mult(coeff));
                    return v;
                }
                ,
                new ComplexVector(),
            );
            return der;
        }
        return psi;
    }
    static fromOrbital(n, l, m) {
        const psi = new WaveFunction();
        const normalize_r = - Math.sqrt(
            pow(2 * Z / (n * RADIUS_REDUCED), 3)
            / (2 * n * product(n - l, n + l))
        );
        const laguerre_ = laguerre(n - l - 1, 2 * l + 1);
        const laguerre_der_ = laguerre_der(n - l - 1, 2 * l + 1, 1);
        const _angular = sph_harm(m, l);
        const _angular_der_theta = sph_harm_der(m, l, 1, 0);
        const _angular_der_phi = sph_harm_der(m, l, 0, 1);
        const factor_t = (- (Z ** 2 * H_BAR ** 2) / (2 * MASS_REDUCED * RADIUS_REDUCED ** 2) * (1 / n ** 2)) / H_BAR;
        const factor_r = (2 * Z) / (n * RADIUS_REDUCED);
        const _radial = (r) => {
            const rho = factor_r * r;
            return Complex.fromCartesian(normalize_r * Math.exp(-rho / 2) * pow(rho, l) * laguerre_(rho), 0);
        }
        const _radial_der = (r) => {
            const rho = factor_r * r;
            const d = Complex.fromCartesian(
                factor_r * normalize_r * (
                    -1 / 2 * Math.exp(-rho / 2) * pow(rho, l) * laguerre_(rho)
                    + Math.exp(-rho / 2) * l * pow(rho, l - 1) * laguerre_(rho)
                    + Math.exp(-rho / 2) * pow(rho, l) * laguerre_der_(rho)
                ),
                0
            );
            return d;
        }
        const _temporal = (time) => {
            return Complex.fromCartesian(0, -factor_t * time).exp();
        }
        const _r_max = RADIUS_REDUCED * Math.pow(n + 5, 2);
        const _sampleAngular = (r) => {
            const MAX_SEED = 1;
            const seed = Math.random() * MAX_SEED;
            let total_prob = 0;
            const d_theta = Math.PI / 180; // SAMPLE_RESOLUTION / r;
            for (let theta = 0; theta <= Math.PI; theta += d_theta) {
                const d_phi = Math.PI / 180; // SAMPLE_RESOLUTION / (r * Math.abs(Math.cos(theta)));
                const factor = Math.sin(theta) * d_theta * d_phi;
                for (let phi = 0; phi < 2 * Math.PI; phi += d_phi) {
                    const psi = _angular(theta, phi);
                    const density = psi.absSq();
                    const probability = density * factor;
                    total_prob += probability;
                    if (total_prob > seed) {
                        return { theta, phi };
                    }
                }
            }
            console.warn(`Total angular probability is not 1. Please update max_seed to ${total_prob}.`);
        }
        const _sampleRadial = () => {
            const MAX_SEED = .99;
            const seed = Math.random() * MAX_SEED;
            let total_prob = 0;
            for (let r = SAMPLE_RESOLUTION / 2; r < _r_max; r += SAMPLE_RESOLUTION) {
                const psi = _radial(r);
                const density = psi.absSq();
                const probability = density * SAMPLE_RESOLUTION * r * r;
                total_prob += probability;
                if (total_prob > seed) {
                    return r;
                }
            }
            console.warn(`Total radial probability is not 1. Please update max_seed to ${total_prob}.`);
        }
        psi.psi = (vec, time = 0) => {
            const { r, theta, phi } = vec.toSphere();
            return _radial(r).mult(_angular(theta, phi)).mult(_temporal(time));
        }
        psi.sample = (time = 0) => {
            const r = _sampleRadial();
            const { theta, phi } = _sampleAngular(10);
            const v = Vector.fromSphere(r, theta, phi);
            return v;
        }
        // psi._der = (pos, time = 0) => {
        //     const { r, theta, phi } = pos.toSphere();
        //     const _dr = _radial_der(r).mult(_angular(theta, phi)).mult(_temporal(time));
        //     const _dtheta = _radial(r).mult(_angular_der_theta(theta, phi)).mult(_temporal(time));
        //     const _dphi = _radial(r).mult(_angular_der_phi(theta, phi)).mult(_temporal(time));
        //     const der = new ComplexVector(
        //         Complex.add(
        //             Complex.mult(_dr, Math.cos(phi) * Math.sin(theta)),
        //             Complex.mult(_dtheta, Math.cos(phi) * Math.cos(theta) / r),
        //             Complex.mult(_dphi, - Math.sin(phi) / (r * Math.sin(theta))),
        //         ),
        //         Complex.add(
        //             Complex.mult(_dr, Math.sin(phi) * Math.sin(theta)),
        //             Complex.mult(_dtheta, Math.sin(phi) * Math.cos(theta) / r),
        //             Complex.mult(_dphi, + Math.cos(phi) / (r * Math.sin(theta))),
        //         ),
        //         Complex.add(
        //             Complex.mult(_dr, Math.cos(theta)),
        //             Complex.mult(_dtheta, Math.sin(theta) / r),
        //         ),
        //     );
        //     return der;
        // }
        return psi;
    }
    static fromRealOrbital(n, l, m) {
        if (m === 0)
            return this.fromOrbital(n, l, m);
        if (m > 0) {
            return this.superposition([
                { coeff: Complex.fromPolar(1, 0), psi: this.fromOrbital(n, l, -m) },
                { coeff: Complex.fromPolar(1, m * Math.PI), psi: this.fromOrbital(n, l, +m) },
            ]);
        }
        if (m < 0) {
            return this.superposition([
                { coeff: Complex.fromPolar(1, Math.PI / 2), psi: this.fromOrbital(n, l, +m) },
                { coeff: Complex.fromPolar(1, (m - 1 / 2) * Math.PI), psi: this.fromOrbital(n, l, -m) },
            ]);
        }
        throw new Error();
    }
}