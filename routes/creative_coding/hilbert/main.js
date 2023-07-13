/// <reference path="../utils/types/gpu.d.ts" />
import "gpu";
import "p5";
import * as d3 from "../utils/color.js";
import { xy2d } from "./calc.js";

export default function execute() {
  /**@type {HTMLCanvasElement} */
  let canvas = null;
  /**@type {ImageBitmapRenderingContext} */
  let ctx = null;
  /**
   * @type {import("../utils/types/gpu.d.ts").GPU}
   */
  let gpu = null;
  /**
   * @type {import("../utils/types/gpu.d.ts").IKernelRunShortcut}
   */
  let kernel = null;

  return {
    start: () => {
      canvas = document.querySelector("article .sketch");
      ctx = canvas.getContext("bitmaprenderer", { alpha: false })
      const n = 512;
      gpu = new GPU.GPU();
      kernel = gpu.createKernel(function (n) {
        let d = xy2d(n, this.thread.x, this.thread.y);
        let v = (1.0 * d) / Math.pow(n, 2);
        return v;
      }).addFunction(
        xy2d,
        {
          argumentTypes: { n: 'Integer', x: 'Integer', y: 'Integer' },
          returnType: 'Integer',
        }
      ).setArgumentTypes({ n: 'Integer' }).setOutput([n, n]);
      const data = kernel(n);
      const image = new ImageData(canvas.width, canvas.height);
      image.data.fill(255);
      for (let i = 0; i < image.width; i++) {
        for (let j = 0; j < image.height; j++) {
          const c = d3.cubehelix(
            360 * data[Math.round(n * j / image.height)][Math.round(n * i / image.width)],
            .75 * 2,
            Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-base')) / 100,
          ).rgb();
          image.data[j * image.width * 4 + i * 4 + 0] = c.r;
          image.data[j * image.width * 4 + i * 4 + 1] = c.g;
          image.data[j * image.width * 4 + i * 4 + 2] = c.b;
          image.data[j * image.width * 4 + i * 4 + 3] = 255;
        }
      }
      createImageBitmap(image).then((imageBitmap) => {
        ctx.transferFromImageBitmap(imageBitmap);
      })
    },
    stop: () => {
      isActive = false;
      system = ctx = canvas = null;
      kernel.destroy();
      gpu.destroy();
      gpu = kernel = null;
    },
  };
}
