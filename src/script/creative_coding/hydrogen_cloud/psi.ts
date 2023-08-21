import {
  combination,
  factorial,
  permutation,
  product,
} from "@/script/utils/math";
import type { TComplex } from "@/script/utils/math/complex";
import {
  complex_conj,
  complex_exp,
  complex_mult,
  complex_scale,
} from "@/script/utils/math/complex";
import {
  TVector,
  vector_alzimuth,
  vector_inclination,
} from "@/script/utils/math/vector";
export const RADIUS_REDUCED = 1.0;
export const MASS_REDUCED = 9.109e-31;
export const H_BAR = 1.054e-34;
export const Z = 1.0;

export function laguerre(n: number, k: number, x: number) {
  let y = 0.0;
  for (let i = 0; i <= n; i++) {
    y *= -x;
    y += combination(n + k, i) / factorial(n - i);
  }
  return y;
}
export function legendre(m: number, l: number, x: number) {
  const f1 = 1.0;
  if (Math.abs(m) > l) return 0;
  if (l < 0) l = -l - 1;
  let factor = 1.0;
  if (m < 0) {
    factor *= Math.pow(-1, m) * product(l - m + 1, l + m);
    m = -m;
  }
  factor *= Math.pow(-1, m) * Math.pow(2, l);
  let y = 0.0;
  for (let i = 0; i <= l - m; i++) {
    y *= x;
    y +=
      combination(f1 * l, l - i) *
      combination((f1 * 2 * l - i - 1) / 2, l) *
      permutation(l - i, m);
  }
  return y * factor * Math.pow(1 - x * x, (f1 * m) / 2);
}
export function sph_harm(m: number, l: number, theta: number, phi: number) {
  const f1 = 1.0;
  let factor = 1.0;
  let reflected = false;
  if (m < 0) {
    reflected = true;
    factor *= Math.pow(-1, m);
    m = -m;
  }
  factor *=
    Math.pow(-1, m) *
    Math.sqrt((f1 * 2 * l + 1) / (4 * Math.PI * product(l - m + 1, l + m)));
  const c = legendre(m, l, Math.cos(theta));
  const result = complex_scale(complex_exp([0, phi * m]), factor * c);
  return reflected ? complex_conj(result) : result;
}
export function psi_orbital(
  n: number,
  l: number,
  m: number,
  x: TVector,
  t: number,
) {
  const RADIUS_REDUCED = 1.0;
  const MASS_REDUCED = 9.109e-31;
  const H_BAR = 1.054e-34;
  const Z = 1.0;
  const normalize_r = Math.sqrt(
    Math.pow((2 * Z) / (n * RADIUS_REDUCED), 3.0) /
      (product(n - l, n + l) * 2 * n),
  );
  const r = Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]); // vector_mag(x);
  const theta = vector_inclination(x);
  const phi = vector_alzimuth(x);
  const rho = ((2 * Z) / (n * RADIUS_REDUCED)) * r;
  const tau =
    (-(Z * Z * H_BAR * H_BAR) /
      (2 * MASS_REDUCED * RADIUS_REDUCED * RADIUS_REDUCED * n * n) /
      H_BAR) *
    t;
  const _radial: TComplex = [
    normalize_r *
      Math.exp(-rho / 2) *
      Math.pow(rho, l) *
      laguerre(n - l - 1, 2 * l + 1, rho),
    0,
  ];
  const _angular = sph_harm(m, l, theta, phi);
  const _spatial = complex_mult(_radial, _angular);
  const _temporal = complex_exp([-tau, 0]);
  return complex_mult(_spatial, _temporal);
}
