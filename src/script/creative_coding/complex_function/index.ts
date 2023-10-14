import { cubehelix2rgb, rgb2srgb } from "@/script/utils/color";
import { getColor, kernelGenerator } from "@/script/utils/dom";
import type { TComplex } from "@/script/utils/math";
import { complex_absSq, complex_zeta, fpart, map } from "@/script/utils/math";
import type { IKernelFunctionThis } from "@/script/utils/types";

export default function execute() {
  const R = 20;
  const iter = 500;
  let isActive: boolean = false;
  const l0 =
    Number.parseInt(
      getComputedStyle(document.body).getPropertyValue("--tone-surface-dim"),
    ) / 100;
  const l1 =
    Number.parseInt(
      getComputedStyle(document.body).getPropertyValue("--tone-surface-bright"),
    ) / 100;
  const s0 =
    ((2 / 2) *
      Number.parseInt(
        getComputedStyle(document.body).getPropertyValue("--chroma-neutral"),
      )) /
    100;
  const s1 =
    (2 *
      Number.parseInt(
        getComputedStyle(document.body).getPropertyValue("--chroma-neutral"),
      )) /
    100;
  function f(z: TComplex) {
    return complex_zeta(z);
  }

  interface IConstants {
    R: number;
    s0: number;
    l0: number;
    s1: number;
    l1: number;
  }

  function main(this: IKernelFunctionThis<IConstants>) {
    const re = map(
      this.thread.x / this.output.x,
      0,
      1,
      -this.constants.R,
      +this.constants.R,
    );
    const im = map(
      this.thread.y / this.output.y,
      0,
      1,
      -this.constants.R,
      +this.constants.R,
    );
    const z = f([re, im]);
    const r = Math.sqrt(complex_absSq(z));
    const theta = Math.atan2(z[1], z[0]);
    const hue = (theta < 0.0 ? theta + 2 * Math.PI : theta) / (Math.PI * 2);
    const sat = map(
      fpart(Math.log2(r)) * fpart((-theta * 12) / (Math.PI * 2)),
      0,
      1,
      this.constants.s0,
      this.constants.s1,
    );
    const lum = map(
      1 - 1 / (Math.pow(r, Math.log10(3)) + 1),
      0,
      1,
      this.constants.l0,
      this.constants.l1,
    );
    const c = rgb2srgb(cubehelix2rgb([hue, sat * 2, lum]));
    this.color(c[0], c[1], c[2], 1);
  }
  return {
    start: (canvas: HTMLCanvasElement) => {
      isActive = true;
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      })!;
      ctx.fillStyle = getColor("--md-sys-color-surface", "#000").formatHex8();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const renderer = kernelGenerator(main, { R, l0, l1, s0, s1 }, buffer);
      const step = renderer();
      requestAnimationFrame(function draw() {
        if (!isActive) return;
        let done = false;
        for (let _ = 0; _ < iter; _++) {
          const res = step.next();
          if (res.done) {
            done = true;
            break;
          }
        }
        createImageBitmap(buffer).then((bmp) =>
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height),
        );
        if (!done) requestAnimationFrame(draw);
      });
    },
    stop: () => {
      isActive = false;
    },
  };
}
