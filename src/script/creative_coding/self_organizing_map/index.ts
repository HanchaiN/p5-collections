import { generate } from "@/script/creative_coding/perlin_noise/pipeline";
import { getColor, kernelGenerator, onImageChange } from "@/script/utils/dom";
import {
  TVector2,
  TVector3,
  constrainLerp,
  gaus,
  softargmax,
  vector_dist,
} from "@/script/utils/math";
import { randomGaussian, randomUniform } from "@/script/utils/math/random";
import type { IKernelFunctionThis } from "@/script/utils/types";
import { flavors } from "@catppuccin/palette";
import * as color from "@thi.ng/color";
import { getPalette } from "../color_quantization/pipeline";
import { dither } from "../dithering/pipeline";

export default function execute() {
  let isActive = false;
  const scale = 5;
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
    range: 0.125,
    learning_rate: 0.125,
    range_decay_rate: 1e-3,
    learning_decay_rate: 1e-6,
    color_choices: 3,
    weight_positions: +10,
    weight_colors: -1,
  };

  function* elementGenerator(
    image: CanvasImageSource,
  ): Generator<TVector3, never, void> {
    const offscreen = new OffscreenCanvas(100, 100);
    const offscreenCtx = offscreen.getContext("2d", { alpha: false })!;
    offscreenCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
    const buffer = offscreenCtx.getImageData(
      0,
      0,
      offscreen.width,
      offscreen.height,
    );
    const auto_palette = getPalette(buffer, false, 16);
    const auto_palette_weight = auto_palette.map(() => 1 / auto_palette.length);
    {
      dither(buffer, auto_palette);
      const ind = new Array(buffer.width * buffer.height)
        .fill(0)
        .map((_, i) => {
          return color.oklab(
            color.srgb(
              buffer.data[i * 4 + 0] / 255,
              buffer.data[i * 4 + 1] / 255,
              buffer.data[i * 4 + 2] / 255,
            ),
          );
        })
        .map((v) => {
          let min_dist = Infinity,
            min_ind = -1;
          for (let j = 0; j < auto_palette.length; j++) {
            const dist = color.distLch(v, color.srgb(...auto_palette[j]));
            if (dist < min_dist) {
              min_dist = dist;
              min_ind = j;
            }
          }
          return min_ind;
        });
      const freq = auto_palette.map(
        (_, i) =>
          ind.filter((j) => j === i).length / (buffer.width * buffer.height),
      );
      softargmax(freq).forEach((v, i) => (auto_palette_weight[i] = v));
    }
    console.log(auto_palette.map((v, i) => [v, auto_palette_weight[i]]));
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
    const palette_lch = new Array(buffer.width * buffer.height)
        .fill(0)
        .map((_, i) => {
          return color.oklch(
            color.srgb(
              buffer.data[i * 4 + 0] / 255,
              buffer.data[i * 4 + 1] / 255,
              buffer.data[i * 4 + 2] / 255,
            ),
          );
        }),
      avg_l = palette_lch.reduce((acc, v) => acc + v.l, 0) / palette_lch.length,
      avg_c = palette_lch.reduce((acc, v) => acc + v.c, 0) / palette_lch.length,
      cov_ll =
        palette_lch.reduce((acc, v) => acc + (v.l - avg_l) * (v.l - avg_l), 0) /
        palette_lch.length,
      cov_cc =
        palette_lch.reduce((acc, v) => acc + (v.c - avg_c) * (v.c - avg_c), 0) /
        palette_lch.length,
      cov_lc =
        palette_lch.reduce((acc, v) => acc + (v.l - avg_l) * (v.c - avg_c), 0) /
        palette_lch.length,
      fac_xl = Math.sqrt(cov_ll),
      fac_xc = cov_lc / fac_xl,
      fac_yc = Math.sqrt(cov_cc - fac_xc * fac_xc);
    while (true) {
      let c: TVector3;
      // eslint-disable-next-line no-dupe-else-if
      if (Math.random() < 0.0025)
        c = [
          Math.round(Math.random()),
          Math.round(Math.random()),
          Math.round(Math.random()),
        ];
      // eslint-disable-next-line no-dupe-else-if
      else if (Math.random() < 0.95) {
        c = auto_palette[Math.floor(Math.random() * auto_palette.length)];
        const seed = Math.random();
        let s = 0;
        for (let j = 0; j < auto_palette.length; j++) {
          s += auto_palette_weight[j];
          if (s >= seed) {
            c = auto_palette[j];
            break;
          }
        }
      }
      // eslint-disable-next-line no-dupe-else-if
      else if (Math.random() < 0.0125)
        c = palette[Math.floor(Math.random() * palette.length)];
      // eslint-disable-next-line no-dupe-else-if
      else if (Math.random() < 0.0125)
        c = color.srgb(
          color.oklch(
            randomGaussian(0.8, 0.125),
            randomUniform(0.05, 0.1),
            randomUniform(0, 1),
          ),
        ).xyz;
      // eslint-disable-next-line no-dupe-else-if
      else if (Math.random() < 0.5) {
        c = color.srgb(
          color.oklch(
            randomGaussian(avg_l, Math.sqrt(cov_ll)),
            randomUniform(
              avg_c - 1.5 * Math.sqrt(cov_cc),
              avg_c + 1.5 * Math.sqrt(cov_cc),
            ),
            randomUniform(0, 1),
          ),
        ).xyz;
      } else {
        const x = randomGaussian(),
          y = randomGaussian();
        c = color.srgb(
          color.oklch(
            avg_l + fac_xl * x,
            0,
            1,
            avg_c + fac_xc * x + fac_yc * y,
            0,
            1,
            randomUniform(0, 1),
          ),
        ).xyz;
      }
      if (
        c[0] >= 0 &&
        c[0] <= 1 &&
        c[1] >= 0 &&
        c[1] <= 1 &&
        c[2] >= 0 &&
        c[2] <= 1
      )
        yield c;
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
    const current = color.oklab(color.srgb(...this.getColor())).xyz;
    const target = color.oklab(color.srgb(...element)).xyz;
    const l_ = constrainLerp(ratio, current[0], target[0]),
      a_ = constrainLerp(ratio, current[1], target[1]),
      b_ = constrainLerp(ratio, current[2], target[2]);
    const [r, g, b] = color.srgb(color.oklab(l_, a_, b_)).xyz;
    this.color(r, g, b, 1);
  }

  function setup(config: HTMLFormElement, image: CanvasImageSource) {
    if (handlerId != null) cancelAnimationFrame(handlerId);
    generator = elementGenerator(image);
    constants.range =
      +config.querySelector<HTMLInputElement>("input#range")!.value;
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
    config.querySelector<HTMLInputElement>("input#iteration-count")!.value =
      "0";
    renderer = kernelGenerator(main, constants, buffer!);
    i = 0;
    handlerId = requestAnimationFrame(function draw() {
      if (!isActive) return;
      createImageBitmap(buffer).then((bmp) =>
        ctx.drawImage(bmp, 0, 0, ctx.canvas.width, ctx.canvas.height),
      );
      new Promise<void>((resolve) => resolve(render())).then(() => {
        config.querySelector<HTMLInputElement>("input#iteration-count")!.value =
          (
            1 +
            +config.querySelector<HTMLInputElement>("input#iteration-count")!
              .value
          ).toString();
        requestAnimationFrame(draw);
      });
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
                  4 * buffer.width * (buffer.height - j - 1) + 4 * i + 0
                ] / 255,
                buffer.data[
                  4 * buffer.width * (buffer.height - j - 1) + 4 * i + 1
                ] / 255,
                buffer.data[
                  4 * buffer.width * (buffer.height - j - 1) + 4 * i + 2
                ] / 255,
                buffer.data[
                  4 * buffer.width * (buffer.height - j - 1) + 4 * i + 3
                ] / 255,
              ),
            );
            pos.push({ x: i, y: j, d: dist });
          }
        }
        const w = softargmax(
          pos.map(({ d }) => -d * constants.weight_positions),
        );
        pos = pos.map(({ x, y, d }, i) => ({ x, y, d, w: w[i] }));
        const r = Math.random();
        let s = 0;
        for (let i = 0; i < pos.length; i++) {
          s += pos[i].w;
          if (s >= r) {
            col.push(pos[i]);
            break;
          }
        }
        if (col.length <= k) col.push(pos[w.indexOf(Math.max(...w))]);
      }
      const w = softargmax(col.map(({ d }) => -d * constants.weight_colors));
      c = w.indexOf(Math.max(...w));
      col = col.map(({ x, y, d }, i) => ({ x, y, d, w: w[i] }));
      const r = Math.random();
      let s = 0;
      for (let i = 0; i < col.length; i++) {
        s += col[i].w;
        if (s >= r) {
          c = i;
          break;
        }
      }
      x = col[c].x;
      y = col[c].y;
    }
    const step = renderer([x, y], values[c], i++);
    while (!step.next().done) continue;
  }

  return {
    start: (canvas: HTMLCanvasElement, config: HTMLFormElement) => {
      isActive = true;
      ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
      ctx.fillStyle = getColor("--color-surface-container-3", "#000");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      buffer = ctx.createImageData(canvas.width / scale, canvas.height / scale);
      config.querySelector<HTMLInputElement>("input#range")!.defaultValue =
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
      config
        .querySelector<HTMLInputElement>("input#range")!
        .addEventListener("change", function () {
          config.querySelector<HTMLInputElement>(
            "slot#range-value",
          )!.innerText = (+this.value).toFixed(3);
        });
      config
        .querySelector<HTMLInputElement>("input#learning-rate")!
        .addEventListener("change", function () {
          config.querySelector<HTMLInputElement>(
            "slot#learning-rate-value",
          )!.innerText = (+this.value).toFixed(3);
        });
      config
        .querySelector<HTMLInputElement>("input#color-choices")!
        .addEventListener("change", function () {
          config.querySelector<HTMLInputElement>(
            "slot#color-choices-value",
          )!.innerText = (+this.value).toFixed(3);
        });
      canvas.addEventListener("click", function () {
        generate(buffer);
        const ofs_canvas = new OffscreenCanvas(buffer.width, buffer.height);
        const ofs_ctx = ofs_canvas.getContext("2d")!;
        ofs_ctx.putImageData(buffer, 0, 0);
        ctx.drawImage(ofs_canvas, 0, 0, canvas.width, canvas.height);
        setup(config, canvas);
      });
      onImageChange(
        config.querySelector<HTMLInputElement>("#image")!,
        (img) => {
          const canvas = new OffscreenCanvas(buffer.width, buffer.height);
          const ctx = canvas.getContext("2d", { alpha: false })!;
          ctx.drawImage(img, 0, 0, buffer.width, buffer.height);
          buffer.data.set(
            ctx.getImageData(0, 0, buffer.width, buffer.height).data,
          );
          setup(config, canvas);
        },
      );
    },
    stop: () => {
      isActive = false;
    },
  };
}
