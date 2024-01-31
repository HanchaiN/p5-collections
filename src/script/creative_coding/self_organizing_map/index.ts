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
  const scale = 2;
  let ctx: CanvasRenderingContext2D;
  let handlerId: number | null = null;
  let buffer: ImageData;
  let generator: Generator<TVector3, never, void>;
  let renderer: ReturnType<
    typeof kernelGenerator<
      IConstants,
      [best_matching: TVector2, element: TVector3, iter: number]
    >
  >;
  let i = 0;

  interface IConstants {
    range: number;
    learning_rate: number;
    range_decay_rate: number;
    learning_decay_rate: number;
    color_choices: number;
    weight_positions: number;
    weight_colors: number;
  }
  const constants: IConstants = {
    range: 0.25,
    learning_rate: 0.125,
    range_decay_rate: 1e-3,
    learning_decay_rate: 0,
    color_choices: 2,
    weight_positions: +50,
    weight_colors: -1,
  };

  function* elementGenerator(): Generator<TVector3, never, void> {
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
    const palette_lch = palette
        .slice(0, 14)
        .map((v) => color.oklch(color.srgb(...v))),
      avg_l = palette_lch.reduce((acc, v) => acc + v.l, 0) / palette.length,
      avg_c = palette_lch.reduce((acc, v) => acc + v.c, 0) / palette.length,
      cov_ll =
        palette_lch.reduce((acc, v) => acc + (v.l - avg_l) * (v.l - avg_l), 0) /
        palette.length,
      cov_cc =
        palette_lch.reduce((acc, v) => acc + (v.c - avg_c) * (v.c - avg_c), 0) /
        palette.length,
      cov_lc =
        palette_lch.reduce((acc, v) => acc + (v.l - avg_l) * (v.c - avg_c), 0) /
        palette.length,
      fac_xl = Math.sqrt(cov_ll),
      fac_xc = cov_lc / fac_xl,
      fac_yc = Math.sqrt(cov_cc - fac_xc * fac_xc);
    while (true) {
      if (Math.random() < 0.0125)
        yield [
          Math.round(Math.random()),
          Math.round(Math.random()),
          Math.round(Math.random()),
        ];
      else if (Math.random() < 0.25)
        yield palette[Math.floor(Math.random() * palette.length)];
      else {
        const x = randomGaussian(),
          y = randomGaussian();
        yield color.rgb(
          color.oklch([
            avg_l + fac_xl * x,
            avg_c + fac_xc * x + fac_yc * y,
            randomUniform(0, 1),
          ]),
        ).xyz;
      }
    }
  }

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

  function setup(config: HTMLFormElement) {
    if (handlerId != null) cancelAnimationFrame(handlerId);
    generator = elementGenerator();
    constants.range =
      +config.querySelector<HTMLInputElement>("input[id=range]")!.value;
    constants.learning_rate = +config.querySelector<HTMLInputElement>(
      "input#learning-rate",
    )!.value;
    constants.range_decay_rate = +config.querySelector<HTMLInputElement>(
      "input#range-decay-rate",
    )!.value;
    constants.learning_decay_rate = +config.querySelector<HTMLInputElement>(
      "input#learning-decay-rate",
    )!.value;
    constants.color_choices = +config.querySelector<HTMLInputElement>(
      "input#color-choices",
    )!.value;
    constants.weight_positions = +config.querySelector<HTMLInputElement>(
      "input#weight-positions",
    )!.value;
    constants.weight_colors = +config.querySelector<HTMLInputElement>(
      "input#weight-colors",
    )!.value;
    renderer = kernelGenerator(main, constants, buffer!);
    i = 0;
    handlerId = requestAnimationFrame(function draw() {
      if (!isActive) return;
      createImageBitmap(buffer).then((bmp) =>
        ctx.drawImage(bmp, 0, 0, ctx.canvas.width, ctx.canvas.height),
      );
      new Promise<void>((resolve) => resolve(render())).then(() =>
        requestAnimationFrame(draw),
      );
    });
  }
  function render() {
    const values = new Array(constants.color_choices)
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
  }

  return {
    start: (canvas: HTMLCanvasElement, config: HTMLFormElement) => {
      isActive = true;
      ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      })!;
      ctx.fillStyle = getColor("--color-surface-container-3", "#000");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      buffer = ctx.createImageData(canvas.width / scale, canvas.height / scale);
      config.querySelector<HTMLInputElement>("input[id=range]")!.defaultValue =
        constants.range.toString();
      config.querySelector<HTMLInputElement>(
        "input#learning-rate",
      )!.defaultValue = constants.learning_rate.toString();
      config.querySelector<HTMLInputElement>(
        "input#range-decay-rate",
      )!.defaultValue = constants.range_decay_rate.toString();
      config.querySelector<HTMLInputElement>(
        "input#learning-decay-rate",
      )!.defaultValue = constants.learning_decay_rate.toString();
      config.querySelector<HTMLInputElement>(
        "input#color-choices",
      )!.defaultValue = constants.color_choices.toString();
      config.querySelector<HTMLInputElement>(
        "input#weight-positions",
      )!.defaultValue = constants.weight_positions.toString();
      config.querySelector<HTMLInputElement>(
        "input#weight-colors",
      )!.defaultValue = constants.weight_colors.toString();
      generate(buffer);
      setup(config);
      canvas.addEventListener("click", function () {
        generate(buffer);
        setup(config);
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
            setup(config);
          });
          img.src = URL.createObjectURL(this.files![0]);
        });
    },
    stop: () => {
      isActive = false;
    },
  };
}
