import { hcl2rgb, rgb2srgb } from "@/script/utils/color";
import { getColor } from "@/script/utils/dom";
import { TVector, arctan2, constrain, fpart, map } from "@/script/utils/math";
import GPU from "gpu.js";
import { psi_orbital } from "./psi";

export default function execute() {
  let gpu: GPU.GPU;
  let main_kernel: GPU.IKernelRunShortcut;
  const T = 20_000;
  const n = 4,
    l = 2,
    m = -1,
    R = Math.pow(n + 2, 2);
  let isActive = false;

  interface IConstants {
    R: number;
    n: number;
    l: number;
    m: number;
  }
  function psi(
    this: GPU.IKernelFunctionThis<IConstants>,
    x: TVector,
    t: number,
  ) {
    return psi_orbital(
      this.constants.n,
      this.constants.l,
      this.constants.m,
      x,
      t,
    );
  }
  function main(
    this: GPU.IKernelFunctionThis<IConstants>,
    z: number,
    t: number,
  ) {
    const x = map(
      this.thread.x / this.output.x,
      0,
      1,
      -this.constants.R,
      +this.constants.R,
    );
    const y = map(
      this.thread.y / this.output.y,
      0,
      1,
      -this.constants.R,
      +this.constants.R,
    );
    const vec = [x, y, z];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const v = psi(vec, t);
    const prob = 1000 * (v[0] * v[0] + v[1] * v[1]);
    const phase = arctan2(v[1], v[0]);
    const brightness = Math.pow(prob / (prob + 1), 0.5);
    const c = rgb2srgb(
      hcl2rgb([
        (phase < 0.0 ? phase + 2 * Math.PI : phase) / (2.0 * Math.PI),
        constrain(brightness, 0, 1),
        constrain(brightness, 0, 1),
      ]),
    );
    this.color(c[0], c[1], c[2], 1);
  }

  return {
    start: (foreground: HTMLCanvasElement, canvas: HTMLCanvasElement) => {
      isActive = true;
      const ctx = foreground.getContext("2d")!;
      gpu = new GPU.GPU({ canvas });
      arctan2.add(gpu);
      psi_orbital.add(gpu);
      hcl2rgb.add(gpu);
      rgb2srgb.add(gpu);
      constrain.add(gpu);
      map.add(gpu);
      main_kernel = gpu
        .createKernel(main as GPU.KernelFunction)
        .addFunction(psi as GPU.GPUFunction, {
          argumentTypes: ["Array(3)", "Float"],
          returnType: "Array(2)",
        })
        .setArgumentTypes({ z: "Float", t: "Float" })
        .setConstants<IConstants>({ R, n, l, m })
        .setConstantTypes({
          R: "Float",
          n: "Integer",
          l: "Integer",
          m: "Integer",
        })
        .setOutput([canvas.width, canvas.height])
        .setGraphical(true);
      main_kernel(0, 0);
      requestAnimationFrame(function draw(t) {
        if (!isActive) return;
        const z = map(fpart(t / T), 0, 1, -R, +R);
        main_kernel(z, 0.0);
        requestAnimationFrame(draw);
      });
      requestAnimationFrame(function draw(t) {
        if (!isActive) return;
        const z = map(fpart(t / T), 0, 1, -R, +R);
        ctx.clearRect(0, 0, foreground.width, foreground.height);
        for (let i = 0; i <= R; i++) {
          if (Number.isInteger(Math.sqrt(i)))
            ctx.strokeStyle = getColor("--color-primary", "#00F").formatHex8();
          else
            ctx.strokeStyle = getColor(
              "--color-on-primary",
              "#0FF",
            ).formatHex8();
          ctx.beginPath();
          ctx.arc(
            foreground.width / 2,
            foreground.height / 2,
            map(
              Math.sqrt(Math.max(Math.pow(i, 2) - Math.pow(z, 2), 0)),
              0,
              R,
              0,
              foreground.width / 2,
            ),
            0,
            2 * Math.PI,
          );
          ctx.stroke();
        }
        requestAnimationFrame(draw);
      });
    },
    stop: () => {
      isActive = false;
      main_kernel?.destroy();
      gpu?.destroy();
      // gpu = kernel = null;
    },
  };
}
