import { getColor } from "@/script/utils/dom";
import { map } from "@/script/utils/math";
import * as color from "@thi.ng/color";

export function deepCopyImageData(imageData: ImageData): ImageData {
  const newImageData = new ImageData(imageData.width, imageData.height);
  newImageData.data.set(new Uint8ClampedArray(imageData.data));
  return newImageData;
}

export function interpolateAt(
  imageData: ImageData,
  x: number,
  y: number,
  inIndex: number = 3,
) {
  const x0 = Math.max(Math.floor(x), 0);
  const x1 = Math.min(Math.ceil(x), imageData.width - 1);
  const y0 = Math.max(Math.floor(y), 0);
  const y1 = Math.min(Math.ceil(y), imageData.height - 1);
  const p00 = imageData.data[(y0 * imageData.width + x0) * 4 + inIndex];
  const p01 = imageData.data[(y1 * imageData.width + x0) * 4 + inIndex];
  const p10 = imageData.data[(y0 * imageData.width + x1) * 4 + inIndex];
  const p11 = imageData.data[(y1 * imageData.width + x1) * 4 + inIndex];
  const p0 = x0 === x1 ? p00 : map(x, x0, x1, p00, p10);
  const p1 = x0 === x1 ? p01 : map(x, x0, x1, p01, p11);
  return y0 === y1 ? p0 : map(y, y0, y1, p0, p1);
}

export function getLuminance(imageData: ImageData, outIndex: number = 3) {
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      const l = color.oklch(color.srgb(imageData.data[index] / 255,
        imageData.data[index + 1] / 255,
        imageData.data[index + 2] / 255)).l;
      if (outIndex < 0) {
        imageData.data[index] = l * 255;
        imageData.data[index + 1] = l * 255;
        imageData.data[index + 2] = l * 255;
        imageData.data[index + 3] = 255;
      } else imageData.data[index + outIndex] = l * 255;
    }
  }
}

export function gaussianKernel(radius: number, sigma: number = radius / 3) {
  const kernel = [];
  let sum = 0;
  for (let y = -radius; y <= radius; y++) {
    const row = [];
    for (let x = -radius; x <= radius; x++) {
      const k = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      row.push(k);
      sum += k;
    }
    kernel.push(row);
  }
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      kernel[y + radius][x + radius] /= sum;
    }
  }
  return kernel;
}

export function applyConvolution(
  imageData: ImageData,
  kernel: number[][],
  kernelRadius: [number, number],
  inIndex: number = 3,
  outIndex: number = inIndex,
  baseline: number = 0,
) {
  const _imageData = deepCopyImageData(imageData);
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      let value = baseline;
      for (let ky = -kernelRadius[1]; ky <= kernelRadius[1]; ky++) {
        for (let kx = -kernelRadius[0]; kx <= kernelRadius[0]; kx++) {
          const k = kernel[ky + kernelRadius[1]][kx + kernelRadius[0]];
          value += interpolateAt(_imageData, x + kx, y + ky, inIndex) * k;
        }
      }
      imageData.data[index + outIndex] = value;
    }
  }
}

export function gaussianBlur(
  imageData: ImageData,
  radius: number,
  sigma: number = radius / 3,
) {
  applyConvolution(imageData, gaussianKernel(radius, sigma), [radius, radius]);
}

export function getGradient(
  imageData: ImageData,
  inIndex: number = 3,
  dxIndex: number = 0,
  dyIndex: number = 1,
  magIndex: number = 2,
) {
  applyConvolution(
    imageData,
    [[+1 / 4, 0, -1 / 4]],
    [1, 0],
    inIndex,
    dxIndex,
    128,
  );
  applyConvolution(
    imageData,
    [[+1 / 4], [0], [-1 / 4]],
    [0, 1],
    inIndex,
    dyIndex,
    128,
  );
  if (magIndex < 0) return;
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      const dx = 2 * (imageData.data[index + dxIndex] - 128);
      const dy = 2 * (imageData.data[index + dyIndex] - 128);
      imageData.data[index + magIndex] =
        Math.sqrt(dy * dy + dx * dx) / Math.SQRT2;
    }
  }
}

export function getOutlierMask(
  imageData: ImageData,
  inIndex: number = 2,
  threshold_l: number = 3,
  threshold_h: number = Infinity,
) {
  const mask = new Array<boolean>(imageData.width * imageData.height).fill(
    true,
  );
  const mag_arranged = imageData.data
    .filter((_, i) => i % 4 === inIndex)
    .sort((a, b) => a - b);
  const mag_q1 = mag_arranged[Math.round((mag_arranged.length - 1) * 0.25)];
  const mag_q3 = mag_arranged[Math.round((mag_arranged.length - 1) * 0.75)];
  const mag_l = mag_q1 - threshold_l * (mag_q3 - mag_q1);
  const mag_h = mag_q3 + threshold_h * (mag_q3 - mag_q1);
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      const mag = imageData.data[index + inIndex];
      if (mag_l > mag || mag > mag_h) mask[y * imageData.width + x] = false;
    }
  }
  return mask;
}

export function getMaximumMask(
  imageData: ImageData,
  mask: boolean[],
  dxIndex: number = 0,
  dyIndex: number = 1,
  magIndex: number = 2,
) {
  const radius = [0.5, 1, Math.SQRT2];
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      const dx = imageData.data[index + dxIndex] - 128;
      const dy = imageData.data[index + dyIndex] - 128;
      const mag =
        magIndex < 0
          ? Math.sqrt(dy * dy + dx * dx) / Math.SQRT2
          : imageData.data[index + magIndex];
      const dir = Math.atan2(dy, dx);
      if (
        radius.length > 0 &&
        radius.filter(
          (r) =>
            interpolateAt(
              imageData,
              x + r * Math.cos(dir),
              y + r * Math.sin(dir),
              magIndex,
            ) >= mag ||
            interpolateAt(
              imageData,
              x - r * Math.cos(dir),
              y - r * Math.sin(dir),
              magIndex,
            ) >= mag,
        ).length /
        radius.length >
        0.5
      )
        mask[y * imageData.width + x] &&= false;
    }
  }
  return mask;
}

export function filterConnectivity(
  imageData: ImageData,
  mask: boolean[],
  radius: number = 1,
  minNeighbors: number = 0,
  maxNeighbors: number = Infinity,
) {
  const _mask = mask.slice();
  const checker = [];
  for (let ky = -radius; ky <= radius; ky++) {
    for (let kx = -radius; kx <= radius; kx++) {
      if (kx === 0 && ky === 0) continue;
      checker.push([kx, ky]);
    }
  }
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const neighbors_count = checker.filter(([kx, ky]) => {
        if (
          y + ky < 0 ||
          y + ky >= imageData.height ||
          x + kx < 0 ||
          x + kx >= imageData.width
        )
          return;
        return _mask[(y + ky) * imageData.width + (x + kx)];
      }).length;
      if (minNeighbors > neighbors_count || neighbors_count > maxNeighbors)
        mask[y * imageData.width + x] = false;
    }
  }
  return _mask.some((v, i) => v !== mask[i]);
}

export function visualizeGradient(
  imageData: ImageData,
  dxIndex: number = 0,
  dyIndex: number = 1,
  magIndex: number = 2,
  maskIndex: number = 3,
) {
  const foreground = color.srgb(getColor("--md-sys-color-outline", "#FFF"));
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      const dx = 2 * (imageData.data[index + dxIndex] - 128);
      const dy = 2 * (imageData.data[index + dyIndex] - 128);
      const mag = imageData.data[index + magIndex];
      const mask = imageData.data[index + maskIndex];
      const dir = map(Math.atan2(dy, dx), -Math.PI, +Math.PI, 0, 1);
      if (mask === 255) {
        imageData.data[index] = foreground.r * 255;
        imageData.data[index + 1] = foreground.g * 255;
        imageData.data[index + 2] = foreground.b * 255;
      } else {
        const [r, g, b] = color.srgb(color.oklch([mag / 255, .25, dir]));
        imageData.data[index] = 255 * r;
        imageData.data[index + 1] = 255 * g;
        imageData.data[index + 2] = 255 * b;
      }
      imageData.data[index + 3] = 255;
    }
  }
}
