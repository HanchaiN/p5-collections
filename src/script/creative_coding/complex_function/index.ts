import { cubehelix2rgb, rgb2srgb } from "@/script/utils/color";
import { getColor } from "@/script/utils/dom";
import type { complex } from "@/script/utils/math";
import {
  arctan2,
  complex_absSq,
  complex_zeta,
  fpart,
  map,
} from "@/script/utils/math";

export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let buffer: ImageData;
  const R = 20;
  const l0 =
    Number.parseInt(
      getComputedStyle(document.body).getPropertyValue("--tone-surface-dim"),
    ) / 100;
  const l1 =
    Number.parseInt(
      getComputedStyle(document.body).getPropertyValue("--tone-surface-bright"),
    ) / 100;
  let i = 0;
  let j = 0;
  function f(z: complex) {
    return complex_zeta(z);
  }

  function setup() {
    if (!canvas) return;
    i = 0;
    j = 0;
    ctx.fillStyle = getColor(
      "--color-surface-container-3",
      "#000",
    ).formatHex8();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
  }
  function draw() {
    if (!canvas) return;
    for (let _ = 0; _ < 512; _++) {
      j++;
      if (j >= canvas.height) {
        j = 0;
        i++;
      }
      if (i >= canvas.width) return;
      const re = map(i / canvas.width, 0, 1, -R, +R);
      const im = map(1 - j / canvas.height, 0, 1, -R, +R);
      const z = f([re, im]);
      const r = Math.sqrt(complex_absSq(z));
      const theta = arctan2(z[1], z[0]);
      const hue = (theta < 0.0 ? theta + 2 * Math.PI : theta) / (Math.PI * 2);
      const sat = map(
        fpart(Math.log2(r)) * fpart((-theta * 12) / (Math.PI * 2)),
        0,
        1,
        0.5,
        1,
      );
      const lum = map(1 - 1 / (Math.pow(r, Math.log10(3)) + 1), 0, 1, l0, l1);
      const c = rgb2srgb(cubehelix2rgb([hue, sat * 2, lum]));
      buffer.data[j * (canvas.width * 4) + i * 4 + 0] = c[0] * 255;
      buffer.data[j * (canvas.width * 4) + i * 4 + 1] = c[1] * 255;
      buffer.data[j * (canvas.width * 4) + i * 4 + 2] = c[2] * 255;
      buffer.data[j * (canvas.width * 4) + i * 4 + 3] = 255;
    }
    ctx.putImageData(buffer, 0, 0);
    requestAnimationFrame(draw);
  }

  return {
    start: (sketch: HTMLCanvasElement) => {
      canvas = sketch;
      ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
      setup();
    },
    stop: () => {
      canvas?.remove();
      // buffer = canvas = null;
    },
  };
}
