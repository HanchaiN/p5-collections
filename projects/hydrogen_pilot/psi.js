import { combination, Complex, factorial, permutation, product, pow } from "../utils/index.js";
export const RADIUS_REDUCED = 1;
export const MASS_REDUCED = 9.109e-31;
export const H_BAR = 1.054e-34;
export const Z = 1;

function laguerre(n, k) {
    const coeff = new Array(n + 1).fill(0).map((_, i) => pow(-1, i) * combination(n + k, n - i) / factorial(i));
    return (x) => {
        return coeff.reduceRight((prev, curr) => prev * x + curr, 0);
    };
}
function legendre(m, l) {
    if (Math.abs(m) > l) {
        return (x) => {
            return 0;
        };
    }
    if (l < 0) {
        return legendre(m, -l - 1);
    }
    if (m < 0) {
        const legendre_ = legendre(-m, l);
        const factor = pow(-1, -m) * product(l - m + 1, l + m);
        return (x) => {
            return legendre_(x) * factor;
        };
    }
    const factor = pow(-1, m) * pow(2, l);
    const coeff = new Array(l - m + 1).fill(0).map((_, ind) =>
        factor * combination(l, ind + m) * combination((l + ind + m - 1) / 2, l) * permutation(ind + m, m)
    );
    return (x) =>
        coeff.reduceRight((prev, curr) => prev * x + curr, 0) * Math.sqrt(pow(1 - x * x, m));
}
function sph_harm(m, l) {
    if (m < 0) {
        const sph_harm_ = sph_harm(-m, l);
        const factor = pow(-1, -m);
        return (theta, phi) => {
            return sph_harm_(theta, phi).mult(factor).conj();
        }
    }
    const legendre_ = legendre(m, l);
    const factor = pow(-1, m) * Math.sqrt((2 * l + 1) / (4 * Math.PI) / product(l - m + 1, l + m));
    return (theta, phi) => {
        return Complex.fromCartesian(0, m * phi)
            .exp()
            .mult(factor * legendre_(Math.cos(theta)));
    };
}
export function superposition(states_) {
    const states = states_;
    const mag = Math.sqrt(states.reduce((mag, state) => mag + state.coeff.absSq(), 0));
    if (mag !== 0)
        states.forEach((state) => {
            state.coeff.div(mag);
        });
    return (...args) => states.reduce(
        (prev, { coeff, psi }) =>
            prev.add(psi(...args).mult(coeff)),
        Complex.fromCartesian()
    );
}
export function wave_function(n, l, m) {
    const Z = 1;
    const factor = - Math.sqrt(
        ((2 * Z / (n * RADIUS_REDUCED)) ** 3 * factorial(n - l - 1)) /
        (2 * n * product(n - l, n + l))
    );
    const laguerre_ = laguerre(n - l - 1, 2 * l + 1);
    const sph_harm_ = sph_harm(m, l);
    const factor_t = (- (Z ** 2 * H_BAR ** 2) / (2 * MASS_REDUCED * RADIUS_REDUCED ** 2) * (1 / n ** 2)) / H_BAR;
    const factor_r = (2 * Z) / (n * RADIUS_REDUCED);
    return (vec, time = 0) => {
        const { r, theta, phi } = vec.toSphere();
        const rho = factor_r * r;
        return sph_harm_(theta, phi)
            .mult(factor * Math.exp(-rho / 2) * pow(rho, l) * laguerre_(rho))
            .mult(Complex.fromCartesian(0, -factor_t * time).exp());
    };
}
export function wave_function_r(n, l, m) {
    if (m === 0)
        return wave_function(n, l, m);
    if (m > 0) {
        return superposition([
            { coeff: Complex.fromPolar(1, 0), psi: wave_function(n, l, -m) },
            { coeff: Complex.fromPolar(1, m * Math.PI), psi: wave_function(n, l, +m) },
        ]);
    }
    if (m < 0) {
        return superposition([
            { coeff: Complex.fromPolar(1, Math.PI / 2), psi: wave_function(n, l, +m) },
            { coeff: Complex.fromPolar(1, (m - 1 / 2) * Math.PI), psi: wave_function(n, l, -m) },
        ]);
    }
}