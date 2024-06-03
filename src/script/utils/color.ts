export function hcl2lab(
  hcl: [h: number, c: number, l: number],
): [l: number, a: number, b: number] {
  return [
    hcl[2],
    hcl[1] * Math.cos(hcl[0] * 2 * Math.PI),
    hcl[1] * Math.sin(hcl[0] * 2 * Math.PI),
  ];
}
export function lab2hcl(
  lab: [l: number, a: number, b: number],
): [h: number, c: number, l: number] {
  return [
    Math.atan2(lab[2], lab[1]) / (2 * Math.PI),
    Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]),
    lab[0],
  ];
}
export function lab2xyz(
  lab: [l: number, a: number, b: number],
): [x: number, y: number, z: number] {
  const CBRT_EPSILON = 6.0 / 29.0;
  const KAPPA = 243.89 / 27.0;
  const std = [0.9504492182750991, 1.0, 1.0889166484304715];
  const fy = (lab[0] + 0.16) / 1.16;
  const fx = fy + lab[1] / 5;
  const fz = fy - lab[2] / 2;
  return [
    std[0] * (fx > CBRT_EPSILON ? fx * fx * fx : (1.16 * fx - 0.16) / KAPPA),
    std[1] * (fy > CBRT_EPSILON ? fy * fy * fy : (1.16 * fy - 0.16) / KAPPA),
    std[2] * (fz > CBRT_EPSILON ? fz * fz * fz : (1.16 * fz - 0.16) / KAPPA),
  ];
}
export function xyz2lab(
  xyz: [x: number, y: number, z: number],
): [l: number, a: number, b: number] {
  const CBRT_EPSILON = 6.0 / 29.0;
  const EPSILON = CBRT_EPSILON * CBRT_EPSILON * CBRT_EPSILON;
  const std = [0.9504492182750991, 1.0, 1.0889166484304715];
  const t = [xyz[0] / std[0], xyz[1] / std[1], xyz[2] / std[2]];
  const fx =
    t[0] > EPSILON
      ? Math.cbrt(t[0])
      : t[0] / (3.0 * CBRT_EPSILON * CBRT_EPSILON) + 4.0 / 29.0;
  const fy =
    t[1] > EPSILON
      ? Math.cbrt(t[1])
      : t[1] / (3.0 * CBRT_EPSILON * CBRT_EPSILON) + 4.0 / 29.0;
  const fz =
    t[2] > EPSILON
      ? Math.cbrt(t[2])
      : t[2] / (3.0 * CBRT_EPSILON * CBRT_EPSILON) + 4.0 / 29.0;
  return [1.16 * fy - 0.16, 5.0 * (fx - fy), 2.0 * (fy - fz)];
}
export function xyz2rgb(
  xyz: [x: number, y: number, z: number],
): [r: number, g: number, b: number] {
  const xyz2rgb = [
    [+8041697 / 3400850, -3049000 / 3400850, -1591847 / 3400850],
    [-1752003 / 340085000, +4851000 / 3400850, +301853 / 3400850],
    [+17697 / 3400850, -49000 / 3400850, +3432153 / 3400850],
  ];
  return [
    xyz[0] * xyz2rgb[0][0] + xyz[1] * xyz2rgb[0][1] + xyz[2] * xyz2rgb[0][2],
    xyz[0] * xyz2rgb[1][0] + xyz[1] * xyz2rgb[1][1] + xyz[2] * xyz2rgb[1][2],
    xyz[0] * xyz2rgb[2][0] + xyz[1] * xyz2rgb[2][1] + xyz[2] * xyz2rgb[2][2],
  ];
}
export function rgb2xyz(
  rgb: [r: number, g: number, b: number],
): [x: number, y: number, z: number] {
  const rgb2xyz = [
    [0.49, 0.31, 0.2],
    [0.17697, 0.8124, 0.01063],
    [0.0, 0.01, 0.99],
  ];
  return [
    rgb[0] * rgb2xyz[0][0] + rgb[1] * rgb2xyz[0][1] + rgb[2] * rgb2xyz[0][2],
    rgb[0] * rgb2xyz[1][0] + rgb[1] * rgb2xyz[1][1] + rgb[2] * rgb2xyz[1][2],
    rgb[0] * rgb2xyz[2][0] + rgb[1] * rgb2xyz[2][1] + rgb[2] * rgb2xyz[2][2],
  ];
}
export function rgb2srgb(
  rgb: [r: number, g: number, b: number],
): [r: number, g: number, b: number] {
  return [
    rgb[0] < 0.0031308
      ? rgb[0] * 12.92
      : 1.055 * Math.pow(rgb[0], 1 / 2.4) - 0.055,
    rgb[1] < 0.0031308
      ? rgb[1] * 12.92
      : 1.055 * Math.pow(rgb[1], 1 / 2.4) - 0.055,
    rgb[2] < 0.0031308
      ? rgb[2] * 12.92
      : 1.055 * Math.pow(rgb[2], 1 / 2.4) - 0.055,
  ];
}
export function srgb2rgb(
  rgb: [r: number, g: number, b: number],
): [r: number, g: number, b: number] {
  return [
    rgb[0] < 0.04045 ? rgb[0] / 12.92 : Math.pow((rgb[0] + 0.055) / 1.055, 2.4),
    rgb[1] < 0.04045 ? rgb[1] / 12.92 : Math.pow((rgb[1] + 0.055) / 1.055, 2.4),
    rgb[2] < 0.04045 ? rgb[2] / 12.92 : Math.pow((rgb[2] + 0.055) / 1.055, 2.4),
  ];
}
export function cubehelix2rgb(
  hsl: [h: number, s: number, l: number],
): [r: number, g: number, b: number] {
  const A = -0.14861,
    B = +1.78277,
    C = -0.29227,
    D = -0.90649,
    E = +1.97294;
  const h = (hsl[0] + 1 / 3) * 2 * Math.PI,
    l = hsl[2],
    a = hsl[1] * l * (1 - l),
    c = Math.cos(h),
    s = Math.sin(h);
  return [l + a * (A * c + B * s), l + a * (C * c + D * s), l + a * (E * c)];
}
export function hcl2rgb(
  hcl: [h: number, c: number, l: number],
): [r: number, g: number, b: number] {
  return xyz2rgb(lab2xyz(hcl2lab(hcl)));
}
