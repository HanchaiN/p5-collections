import { hcl2rgb, rgb2srgb } from "@/script/utils/color";
import { getColor, kernelGenerator } from "@/script/utils/dom";
import {
  TVector2,
  TVector3,
  gaus,
  map,
  vector_dist,
  vector_magSq,
  vector_sub,
} from "@/script/utils/math";
import { PerlinNoise } from "@/script/utils/math/noise";
import { randomUniform } from "@/script/utils/math/random";
import type { IKernelFunctionThis } from "@/script/utils/types";

export default function execute() {
  let isActive = false;
  const scale = 1;
  let dithering = false;

  interface IConstants {
    range: number;
    learning_rate: number;
    range_decay_rate: number;
    learning_decay_rate: number;
  }
  const constants: IConstants = {
    range: 0.25,
    learning_rate: 0.75,
    range_decay_rate: 1e-3,
    learning_decay_rate: 1e-5,
  };
  const color_palette: [number, number, number][] = [
    [1, 1, 1],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 0],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 0],
  ];
  const err_diffusion: [[number, number], number][] = [
    // [[+1, 0], 1 / 8],
    // [[+2, 0], 1 / 8],
    // [[-1, 1], 1 / 8],
    // [[+0, 1], 1 / 8],
    // [[+1, 1], 1 / 8],
    // [[+0, 2], 1 / 8],
    // [[+1, 0], 7 / 16],
    // [[-1, 1], 3 / 16],
    // [[+0, 1], 5 / 16],
    // [[+1, 1], 1 / 16],
    [[+1, 0], 7 / 48],
    [[+2, 0], 5 / 48],
    [[-2, 1], 3 / 48],
    [[-1, 1], 5 / 48],
    [[+0, 1], 7 / 48],
    [[+1, 1], 5 / 48],
    [[+2, 1], 3 / 48],
    [[-2, 2], 1 / 48],
    [[-1, 2], 3 / 48],
    [[+0, 2], 5 / 48],
    [[+1, 2], 3 / 48],
    [[+2, 2], 1 / 48],
  ];

  function* elementGenerator(): Generator<TVector3, never, void> {
    while (true) {
      yield Math.random() < 0.125
        ? color_palette[Math.floor(Math.random() * color_palette.length)]
        : hcl2rgb([
            randomUniform(0, 1),
            randomUniform(0.45, 0.55),
            randomUniform(0.75, 0.8),
          ]);
    }
  }
  const generator: Generator<TVector3, never, void> | null = elementGenerator();

  function main(
    this: IKernelFunctionThis<IConstants>,
    acc: TVector3[][],
    best_matching: TVector2,
    element: TVector3,
    iter: number,
  ): TVector3 {
    const val_ = acc[this.thread.x][this.thread.y].map(
      (v, i) =>
        v +
        this.constants.learning_rate *
          Math.exp(-this.constants.learning_decay_rate * iter) *
          gaus(
            vector_dist([this.thread.x, this.thread.y], best_matching) /
              (this.output.x *
                this.constants.range *
                Math.exp(-this.constants.range_decay_rate * iter)),
          ) *
          (element[i] - v),
    ) as TVector3;
    const [r, g, b] = rgb2srgb(val_);
    this.color(r, g, b, 1);
    return val_;
  }

  return {
    start: (canvas: HTMLCanvasElement) => {
      isActive = true;
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      })!;
      ctx.fillStyle = getColor(
        "--color-surface-container-3",
        "#000",
      ).formatHex8();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const buffer = ctx.createImageData(
        canvas.width / scale,
        canvas.height / scale,
      );
      {
        const noise = new PerlinNoise();
        buffer.data.fill(255);
        for (let j = 0; j < buffer.height; j++) {
          for (let i = 0; i < buffer.width; i++) {
            const index = (j * buffer.width + i) * 4;
            buffer.data[index + 0] = map(
              noise.noise(i / 100, j / 100, 0),
              -1,
              1,
              0,
              255,
            );
            buffer.data[index + 1] = map(
              noise.noise(i / 100, j / 100, 128),
              -1,
              1,
              0,
              255,
            );
            buffer.data[index + 2] = map(
              noise.noise(i / 100, j / 100, 255),
              -1,
              1,
              0,
              255,
            );
          }
        }
      }
      let acc: TVector3[][] = new Array(buffer.width)
        .fill(null)
        .map((_, i) =>
          new Array(buffer.height)
            .fill(null)
            .map((_, j) => [
              buffer.data[(j * buffer.width + i) * 4 + 0] / 255,
              buffer.data[(j * buffer.width + i) * 4 + 1] / 255,
              buffer.data[(j * buffer.width + i) * 4 + 2] / 255,
            ]),
        );
      const renderer = kernelGenerator(main, constants, buffer);
      let i = 0;
      requestAnimationFrame(function draw() {
        if (!isActive) return;
        if (generator) {
          const value = generator.next().value;
          const { x, y } = acc.reduce<{ x: number; y: number; d: number }>(
            ({ x, y, d }, row, i) =>
              row.reduce<{ x: number; y: number; d: number }>(
                ({ x, y, d }, val, j) =>
                  vector_dist(value, val) < d
                    ? { x: i, y: j, d: vector_dist(value, val) }
                    : { x, y, d },
                { x, y, d },
              ),
            { x: -1, y: -1, d: Infinity },
          );
          const bmu: TVector2 = [x, y];
          const step = renderer(acc, bmu, value, i++);
          let res;
          while (!(res = step.next()).done) continue;
          acc = res.value;
        }
        if (dithering) {
          for (let j = 0; j < buffer.height; j++) {
            for (let i = 0; i < buffer.width; i++) {
              const index = (j * buffer.width + i) * 4;
              let min_error = Infinity;
              const target_color: [number, number, number] = [
                buffer.data[index + 0] / 255,
                buffer.data[index + 1] / 255,
                buffer.data[index + 2] / 255,
              ];
              let current_color = color_palette[0];
              for (const color of color_palette) {
                const diff = vector_sub(color, target_color);
                const err = vector_magSq(diff);
                if (err < min_error) {
                  current_color = color;
                  min_error = err;
                }
              }
              const err: TVector3 = vector_sub(target_color, current_color);
              err_diffusion.forEach(([ind, w]) => {
                const i_ = i + ind[0];
                const j_ = j + ind[1];
                if (
                  0 > i_ ||
                  i_ >= buffer.width ||
                  0 > j_ ||
                  j_ >= buffer.height
                )
                  return;
                for (let k = 0; k < 3; k++)
                  buffer.data[(j_ * buffer.width + i_) * 4 + k] +=
                    err[k] * w * 255;
              });
              buffer.data[index + 0] = current_color[0] * 255;
              buffer.data[index + 1] = current_color[1] * 255;
              buffer.data[index + 2] = current_color[2] * 255;
            }
          }
        }
        createImageBitmap(buffer).then((bmp) =>
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height),
        );
        requestAnimationFrame(draw);
      });
      canvas.addEventListener("click", function onClick() {
        dithering = !dithering;
      });
    },
    stop: () => {
      isActive = false;
    },
  };
}
