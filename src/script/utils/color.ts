import type { GPUKernel } from "@/script/utils/types";
export * as d3 from "d3-color";

export function hcl2lab(hcl: number[]) {
  return [
    hcl[2],
    hcl[1] * Math.cos(hcl[0] * 2 * Math.PI),
    hcl[1] * Math.sin(hcl[0] * 2 * Math.PI),
  ];
}
hcl2lab.add = (gpu: GPUKernel) => {
  gpu.addFunction(hcl2lab, {
    argumentTypes: ["Array(3)"],
    returnType: "Array(3)",
  });
};
export function lab2xyz(lab: number[]) {
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
lab2xyz.add = (gpu: GPUKernel) => {
  gpu.addFunction(lab2xyz, {
    argumentTypes: ["Array(3)"],
    returnType: "Array(3)",
  });
};
export function xyz2rgb(xyz: number[]) {
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
xyz2rgb.add = (gpu: GPUKernel) => {
  gpu.addFunction(xyz2rgb, {
    argumentTypes: ["Array(3)"],
    returnType: "Array(3)",
  });
};
export function cubehelix2rgb(hsl: number[]) {
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
cubehelix2rgb.add = (gpu: GPUKernel) => {
  gpu.addFunction(cubehelix2rgb, {
    argumentTypes: ["Array(3)"],
    returnType: "Array(3)",
  });
};
export function rgb2srgb(rgb: number[]) {
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
rgb2srgb.add = (gpu: GPUKernel) => {
  gpu.addFunction(rgb2srgb, {
    argumentTypes: ["Array(3)"],
    returnType: "Array(3)",
  });
};
export function hcl2rgb(hcl: number[]) {
  return xyz2rgb(lab2xyz(hcl2lab(hcl)));
}
hcl2rgb.add = (gpu: GPUKernel) => {
  xyz2rgb.add(gpu);
  lab2xyz.add(gpu);
  hcl2lab.add(gpu);
  gpu.addFunction(hcl2rgb, {
    argumentTypes: ["Array(3)"],
    returnType: "Array(3)",
  });
};
