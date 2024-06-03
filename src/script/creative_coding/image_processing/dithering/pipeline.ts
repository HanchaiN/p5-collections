import {
  vector_magSq,
  vector_sub,
  softargmax,
  sample,
} from "@/script/utils/math";
import * as color from "@thi.ng/color";

export function applyDithering(
  buffer: ImageData,
  color_palette: [r: number, g: number, b: number][],
  temperature = 0,
) {
  const embed = (c: [r: number, g: number, b: number]) => {
      const c_ = color.xyzD65(color.srgb(...c));
      return [c_.x, c_.y, c_.z] as [number, number, number];
    },
    unembed = (c: [x: number, y: number, z: number]) => {
      const c_ = color.srgb(color.xyzD65(...c));
      return [c_.r, c_.g, c_.b] as [number, number, number];
    };
  const color_palette_ = color_palette.map(embed);
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

  for (let j = 0; j < buffer.height; j++) {
    for (let i = 0; i < buffer.width; i++) {
      const index = (j * buffer.width + i) * 4;
      const target_color = embed([
        buffer.data[index + 0] / 255,
        buffer.data[index + 1] / 255,
        buffer.data[index + 2] / 255,
      ]);
      const color_index = sample(
        color_palette.map((_, i) => i),
        softargmax(
          color_palette_.map(
            (color) => -vector_magSq(vector_sub(color, target_color)),
          ),
          temperature,
        ),
      );
      const err = vector_sub(target_color, color_palette_[color_index]);
      err_diffusion.forEach(([ind, w]) => {
        const i_ = i + ind[0];
        const j_ = j + ind[1];
        if (0 > i_ || i_ >= buffer.width || 0 > j_ || j_ >= buffer.height)
          return;
        const diff = unembed(err.map((v) => v * w) as [number, number, number]);
        for (let k = 0; k < 3; k++)
          buffer.data[(j_ * buffer.width + i_) * 4 + k] += diff[k] * 255;
      });
      buffer.data[index + 0] = color_palette[color_index][0] * 255;
      buffer.data[index + 1] = color_palette[color_index][1] * 255;
      buffer.data[index + 2] = color_palette[color_index][2] * 255;
    }
  }
}
