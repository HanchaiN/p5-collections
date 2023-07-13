import { arctan2, combination, permutation, product } from "../utils/math.js";
export const RADIUS_REDUCED = 1.0;
export const MASS_REDUCED = 9.109e-31;
export const H_BAR = 1.054e-34;
export const Z = 1.0;

export function laguerre(n, k, x) {
    let y = 0.0;
    for (let i = 0; i <= n; i++) {
        y *= -x;
        y += combination(n + k, i) / factorial(n - i);
    }
    return y;
}
export function legendre(m, l, x) {
    const f1 = 1.0;
    if (Math.abs(m) > l)
        return 0;
    if (l < 0)
        l = -l - 1;
    let factor = 1.0;
    if (m < 0) {
        factor *= Math.pow(-1, m) * product(l - m + 1, l + m);
        m = -m;
    }
    factor *= Math.pow(-1, m) * Math.pow(2, l);
    let y = 0.0;
    for (let i = 0; i <= l - m; i++) {
        y *= x;
        y += combination(f1 * l, l - i) * combination((f1 * 2 * l - i - 1) / 2, l) * permutation(l - i, m);
    }
    return y * factor * Math.pow(1 - x * x, f1 * m / 2);
}
export function sph_harm(m, l, theta, phi) {
    const f1 = 1.0;
    let factor = [1.0, 1.0];
    if (m < 0) {
        factor[0] *= Math.pow(-1, m);
        factor[1] *= -Math.pow(-1, m);
        m = -m;
    }
    factor[0] *= Math.pow(-1, m) * Math.sqrt((f1 * 2 * l + 1) / (4 * Math.PI * product(l - m + 1, l + m)));
    factor[1] *= Math.pow(-1, m) * Math.sqrt((f1 * 2 * l + 1) / (4 * Math.PI * product(l - m + 1, l + m)));
    const c = legendre(m, l, Math.cos(theta));
    return [factor[0] * Math.cos(f1 * m * phi) * c, factor[1] * Math.sin(f1 * m * phi) * c];
}
export function psi_orbital(n, l, m, x, y, z, time) {
    const RADIUS_REDUCED = 1.0;
    const MASS_REDUCED = 9.109e-31;
    const H_BAR = 1.054e-34;
    const Z = 1.0;
    const f1 = 1.0;
    const normalize_r = Math.sqrt(
        Math.pow(2 * Z / (n * RADIUS_REDUCED), 3.0)
        / (f1 * 2 * n * product(n - l, n + l))
    );
    const t = (- (Z * Z * H_BAR * H_BAR) / (2 * MASS_REDUCED * RADIUS_REDUCED * RADIUS_REDUCED * n * n)) / H_BAR * time;
    const r = Math.sqrt(x * x + y * y + z * z);
    const theta = r === 0 ? 0 : Math.acos(z / r);
    const phi = arctan2(y, x);
    const rho = (2 * Z) / (n * RADIUS_REDUCED) * r;
    const _radial = [normalize_r * Math.exp(-rho / 2) * Math.pow(rho, l) * laguerre(n - l - 1, 2 * l + 1, rho), 0];
    const _angular = sph_harm(m, l, theta, phi);
    const _spatial = [_radial[0] * _angular[0] - _radial[1] * _angular[1], _radial[0] * _angular[1] + _radial[1] * _angular[0]];
    const _temporal = [Math.cos(-t), Math.sin(-t)];
    return [_spatial[0] * _temporal[0] - _spatial[1] * _temporal[1], _spatial[0] * _temporal[1] + _spatial[1] * _temporal[0]];
}
