import { generate } from "@/script/creative_coding/perlin_noise/pipeline";
import { getColor, kernelGenerator } from "@/script/utils/dom";
import {
  TVector2,
  TVector3,
  gaus,
  lerp,
  vector_dist,
} from "@/script/utils/math";
import { randomGaussian, randomUniform } from "@/script/utils/math/random";
import type { IKernelFunctionThis } from "@/script/utils/types";
import { flavors } from "@catppuccin/palette";
import * as color from "@thi.ng/color";

export default function execute() {
  let isActive = false;
  let isDrawing = false;
  const scale = 2;
  const choices = 3;

  interface IConstants {
    range: number;
    learning_rate: number;
    range_decay_rate: number;
    learning_decay_rate: number;
    weight_positions: number;
    weight_colors: number;
  }
  const constants: IConstants = {
    range: 0.25,
    learning_rate: 0.125,
    range_decay_rate: 1e-3,
    learning_decay_rate: 0,
    weight_positions: +10,
    weight_colors: -2,
  };
  const palette = [
    getColor("--cpt-rosewater", flavors["mocha"].colors.rosewater.hex),
    getColor("--cpt-flamingo", flavors["mocha"].colors.flamingo.hex),
    getColor("--cpt-pink", flavors["mocha"].colors.pink.hex),
    getColor("--cpt-mauve", flavors["mocha"].colors.mauve.hex),
    getColor("--cpt-red", flavors["mocha"].colors.red.hex),
    getColor("--cpt-maroon", flavors["mocha"].colors.maroon.hex),
    getColor("--cpt-peach", flavors["mocha"].colors.peach.hex),
    getColor("--cpt-yellow", flavors["mocha"].colors.yellow.hex),
    getColor("--cpt-green", flavors["mocha"].colors.green.hex),
    getColor("--cpt-teal", flavors["mocha"].colors.teal.hex),
    getColor("--cpt-sky", flavors["mocha"].colors.sky.hex),
    getColor("--cpt-sapphire", flavors["mocha"].colors.sapphire.hex),
    getColor("--cpt-blue", flavors["mocha"].colors.blue.hex),
    getColor("--cpt-lavender", flavors["mocha"].colors.lavender.hex),
    getColor("--cpt-text", flavors["mocha"].colors.text.hex),
    getColor("--cpt-base", flavors["mocha"].colors.base.hex),
    getColor("--cpt-crust", flavors["mocha"].colors.crust.hex),
    getColor("--cpt-mantle", flavors["mocha"].colors.mantle.hex),
  ].map((v) => {
    return color.srgb(color.css(v)).xyz;
  });

  function* elementGenerator(): Generator<TVector3, never, void> {
    const palette_lch = palette
      .slice(0, 15)
      .map((v) => color.oklch(color.srgb(...v)));
    const avg_l = palette_lch.reduce((acc, v) => acc + v.l, 0) / palette.length;
    const avg_c = palette_lch.reduce((acc, v) => acc + v.c, 0) / palette.length;
    const std_l = Math.sqrt(
      palette_lch.reduce((acc, v) => acc + (v.l - avg_l) ** 2, 0) /
      (palette.length - 1),
    );
    const std_c = Math.sqrt(
      palette_lch.reduce((acc, v) => acc + (v.c - avg_c) ** 2, 0) /
      (palette.length - 1),
    );
    while (true) {
      yield Math.random() < 0.0625
        ? [
          Math.round(Math.random()),
          Math.round(Math.random()),
          Math.round(Math.random()),
        ]
        : Math.random() < 0.25
          ? palette[Math.floor(Math.random() * palette.length)]
          : color.rgb(
            color.oklch([
              randomGaussian(avg_l, std_l),
              randomGaussian(avg_c, std_c),
              randomUniform(0, 1),
            ]),
          ).xyz;
    }
  }
  const generator: Generator<TVector3, never, void> | null = elementGenerator();

  function main(
    this: IKernelFunctionThis<IConstants>,
    best_matching: TVector2,
    element: TVector3,
    iter: number,
  ) {
    const ratio =
      this.constants.learning_rate *
      Math.exp(-this.constants.learning_decay_rate * iter) *
      gaus(
        vector_dist([this.thread.x, this.thread.y], best_matching) /
        (this.output.x *
          this.constants.range *
          Math.exp(-this.constants.range_decay_rate * iter)),
      );
    const current = color.srgb(color.srgb(...this.getColor())).xyz;
    const target = color.srgb(color.srgb(...element)).xyz;
    const val = new Array(3)
      .fill(0)
      .map((_, i) => lerp(ratio, current[i], target[i])) as [
        number,
        number,
        number,
      ];
    const [r, g, b] = color.srgb(color.srgb(...val)).xyz;
    this.color(r, g, b, 1);
  }

  return {
    start: (canvas: HTMLCanvasElement, config: HTMLFormElement) => {
      isActive = true;
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      })!;
      ctx.fillStyle = getColor("--color-surface-container-3", "#000");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const buffer = ctx.createImageData(
        canvas.width / scale,
        canvas.height / scale,
      );
      generate(buffer);
      const renderer = kernelGenerator(main, constants, buffer);
      let i = 0;
      isDrawing = true;
      requestAnimationFrame(function draw() {
        if (!isActive) return;
        if (!isDrawing) {
          requestAnimationFrame(draw);
          return;
        }
        isDrawing = false;
        createImageBitmap(buffer).then((bmp) =>
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height),
        );
        requestAnimationFrame(draw);
      });
      requestIdleCallback(function update() {
        if (!isActive) return;
        if (generator) {
          const values = new Array(choices)
            .fill(0)
            .map(() => generator.next().value);
          let x = -1,
            y = -1,
            c = 0;
          {
            let col = [];
            for (let k = 0; k < values.length; k++) {
              let pos = [];
              for (let i = 0; i < buffer.width; i++) {
                for (let j = 0; j < buffer.height; j++) {
                  const dist = color.distLch(
                    color.srgb(...values[k]),
                    color.srgb(
                      buffer.data[
                      4 * buffer.width * (buffer.height - y - 1) + 4 * x + 0
                      ] / 255,
                      buffer.data[
                      4 * buffer.width * (buffer.height - y - 1) + 4 * x + 1
                      ] / 255,
                      buffer.data[
                      4 * buffer.width * (buffer.height - y - 1) + 4 * x + 2
                      ] / 255,
                      buffer.data[
                      4 * buffer.width * (buffer.height - y - 1) + 4 * x + 3
                      ] / 255,
                    ),
                  );
                  pos.push({ x: i, y: j, d: dist });
                }
              }
              pos = pos.map(({ x, y, d }) => ({
                x,
                y,
                d,
                w: Math.exp(-d * constants.weight_positions),
              }));
              const sum = pos.reduce((acc, { w }) => acc + w, 0);
              const r = Math.random() * sum;
              let s = 0;
              for (let i = 0; i < pos.length; i++) {
                s += pos[i].w;
                if (s >= r) {
                  col.push(pos[i]);
                  break;
                }
              }
            }
            col = col.map(({ x, y, d }) => ({
              x,
              y,
              d,
              w: Math.exp(-d * constants.weight_colors),
            }));
            const sum = col.reduce((acc, { w }) => acc + w, 0);
            const r = Math.random() * sum;
            let s = 0;
            for (let i = 0; i < col.length; i++) {
              s += col[i].w;
              if (s >= r) {
                x = col[i].x;
                y = col[i].y;
                c = i;
                break;
              }
            }
          }
          const step = renderer([x, y], values[c], i++);
          while (!step.next().done) continue;
          isDrawing = true;
        }
        requestIdleCallback(update);
      });
      canvas.addEventListener("click", function () {
        generate(buffer);
        i = 0;
      });
      config
        .querySelector<HTMLInputElement>("#image")!
        .addEventListener("change", function () {
          const img = new Image();
          img.addEventListener("load", function onImageLoad() {
            this.removeEventListener("load", onImageLoad);
            const canvas = new OffscreenCanvas(buffer.width, buffer.height);
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, buffer.width, buffer.height);
            buffer.data.set(
              ctx.getImageData(0, 0, buffer.width, buffer.height).data,
            );
            i = 0;
          });
          img.src = URL.createObjectURL(this.files![0]);
        });
    },
    stop: () => {
      isActive = false;
    },
  };
}
