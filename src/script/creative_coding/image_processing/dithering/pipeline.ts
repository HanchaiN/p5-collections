import { TVector3, vector_magSq, vector_sub } from "@/script/utils/math";

export function applyDithering(
  buffer: ImageData,
  color_palette: [r: number, g: number, b: number][],
) {
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
      let min_error = Infinity;
      const target_color: [r: number, g: number, b: number] = [
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
        if (0 > i_ || i_ >= buffer.width || 0 > j_ || j_ >= buffer.height)
          return;
        for (let k = 0; k < 3; k++)
          buffer.data[(j_ * buffer.width + i_) * 4 + k] += err[k] * w * 255;
      });
      buffer.data[index + 0] = current_color[0] * 255;
      buffer.data[index + 1] = current_color[1] * 255;
      buffer.data[index + 2] = current_color[2] * 255;
    }
  }
}
