import {
  softargmax,
  vector_magSq,
  vector_sub,
  sample,
} from "@/script/utils/math";
import { kMeans } from "./kmeans";
import * as color from "@thi.ng/color";

export function getPalette(buffer: ImageData, n_colors: number) {
  return kMeans(
    new Array(buffer.width * buffer.height).fill(0).map((_, i) => {
      return color.xyzD65(
        color.srgb(
          buffer.data[i * 4 + 0] / 255,
          buffer.data[i * 4 + 1] / 255,
          buffer.data[i * 4 + 2] / 255,
        ),
      );
    }),
    Infinity,
    n_colors,
    1000,
    [],
    (v) => v.copy(),
    (a, b) => {
      return color.distEucledian3(a, b);
    },
    (a, w) => {
      const v = [0, 0, 0, 0];
      a.forEach((_, i) => {
        v[0] += a[i][0] * w[i];
        v[1] += a[i][1] * w[i];
        v[2] += a[i][2] * w[i];
        v[3] += w[i];
      });
      return color.xyzD65(v[0] / v[3], v[1] / v[3], v[2] / v[3]);
    },
  ).map((c) => color.css(c));
}

export function applyQuantization(
  buffer: ImageData,
  color_palette: [r: number, g: number, b: number][],
  temperature = 0,
) {
  const embed = (c: [r: number, g: number, b: number]) => {
    const c_ = color.xyzD65(color.srgb(...c));
    return [c_.x, c_.y, c_.z] as [number, number, number];
  };
  const color_palette_ = color_palette.map(embed);
  for (let j = 0; j < buffer.height; j++) {
    for (let i = 0; i < buffer.width; i++) {
      const index = (j * buffer.width + i) * 4;
      const target_color = embed([
        buffer.data[index + 0] / 255,
        buffer.data[index + 1] / 255,
        buffer.data[index + 2] / 255,
      ]);
      const current_color = sample(
        color_palette,
        softargmax(
          color_palette_.map(
            (color) => -vector_magSq(vector_sub(color, target_color)),
          ),
          temperature,
        ),
      );
      buffer.data[index + 0] = current_color[0] * 255;
      buffer.data[index + 1] = current_color[1] * 255;
      buffer.data[index + 2] = current_color[2] * 255;
    }
  }
}
