import { kMeans, getSilhouetteScore } from "./kmeans";
import {
  softargmax,
  constrain,
  vector_magSq,
  vector_sub,
  sample,
} from "@/script/utils/math";
import * as color from "@thi.ng/color";

export function getPalette(
  buffer: ImageData,
  n?: number,
  with_score?: false,
  max_iter?: number,
  n_sample?: number,
  seed?: color.XYZD65[],
): color.XYZD65[];
export function getPalette(
  buffer: ImageData,
  n: number,
  with_score: true,
  max_iter?: number,
  n_sample?: number,
  seed?: color.XYZD65[],
): [color.XYZD65[], number];
export function getPalette(
  buffer: ImageData,
  n = 16,
  with_score = false,
  max_iter = 1000,
  n_sample = 0,
  seed: color.XYZD65[] = [],
) {
  const samples = new Array(buffer.width * buffer.height)
    .fill(0)
    .map((_, i) => {
      return color.xyzD65(
        color.srgb(
          buffer.data[i * 4 + 0] / 255,
          buffer.data[i * 4 + 1] / 255,
          buffer.data[i * 4 + 2] / 255,
        ),
      );
    });
  const N_SAMPLE = constrain(
    n_sample,
    (100 * samples.length) / max_iter,
    samples.length,
  );
  const dist = (a: color.XYZD65, b: color.XYZD65) => {
    return color.distEucledian3(a, b);
  };
  const average = (a: color.XYZD65[], w: number[]) => {
    const v = [0, 0, 0, 0];
    a.forEach((_, i) => {
      v[0] += a[i][0] * w[i];
      v[1] += a[i][1] * w[i];
      v[2] += a[i][2] * w[i];
      v[3] += w[i];
    });
    return color.xyzD65(v[0] / v[3], v[1] / v[3], v[2] / v[3]);
  };
  const centroids = kMeans(
    samples,
    N_SAMPLE,
    n,
    max_iter,
    seed,
    (v) => v.copy(),
    dist,
    average,
  );
  if (!with_score) return centroids;
  const getSample = (n = N_SAMPLE) =>
    samples
      .filter(() => Math.random() < n / samples.length)
      .sort(() => Math.random() - 0.5);
  const N_EVAL = 3;
  const score: number =
    new Array(N_EVAL)
      .fill(0)
      .reduce(
        (acc) => acc + getSilhouetteScore(getSample(N_SAMPLE), centroids, dist),
        0,
      ) / N_EVAL;
  return [centroids, score];
}

export function getPalette_Auto(
  buffer: ImageData,
  return_full: false,
  max_iter?: number,
  n_sample?: number,
): color.XYZD65[];
export function getPalette_Auto(
  buffer: ImageData,
  return_full: true,
  max_iter?: number,
  n_sample?: number,
): { n: number; score: number; centroids: color.XYZD65[] }[];
export function getPalette_Auto(
  buffer: ImageData,
  return_full: boolean = false,
  max_iter = 1000,
  n_sample = 0,
) {
  const palettes: { n: number; score: number; centroids: color.XYZD65[] }[] =
    [];
  {
    let seed: color.XYZD65[] = [];
    for (let n = 2; n <= 64; n *= 2) {
      const [centroids, score] = getPalette(
        buffer,
        n,
        true,
        max_iter,
        n_sample,
        seed,
      );
      seed = centroids;
      palettes.push({ n, score, centroids });
    }
  }
  if (return_full) return palettes;
  const seed = Math.random();
  return (
    softargmax(palettes.map((v) => v.score)).reduce<{
      s: number;
      centroids: color.XYZD65[] | null;
    }>(
      ({ s, centroids }, v, i) => {
        if (centroids !== null || s + v < seed) return { s: s + v, centroids };
        return {
          s: s + v,
          centroids: palettes[i].centroids,
        };
      },
      { s: 0, centroids: null },
    ).centroids ?? getPalette(buffer, 16)
  );
}

export function getPalette_Generator(
  buffer: ImageData,
  with_score?: false,
  max_iter?: number,
  n_sample?: number,
): Generator<color.XYZD65[], never, number | void>;
export function getPalette_Generator(
  buffer: ImageData,
  with_score: true,
  max_iter?: number,
  n_sample?: number,
): Generator<[color.XYZD65[], number], never, number | void>;
export function* getPalette_Generator(
  buffer: ImageData,
  with_score: boolean = false,
  max_iter = 1000,
  n_sample = 0,
): Generator<color.XYZD65[] | [color.XYZD65[], number], never, number | void> {
  let n = 1;
  let seed: color.XYZD65[] = [];
  while (true) {
    const [centroids, score] = getPalette(
      buffer,
      n,
      true,
      max_iter,
      n_sample,
      seed,
    );
    seed = centroids;
    const n_ = yield with_score ? [centroids, score] : centroids;
    if (typeof n_ === "number" && Number.isInteger(n_) && n_ > 0) n = n_;
    else n++;
  }
}

export function applyQuantization(
  buffer: ImageData,
  color_palette: [r: number, g: number, b: number][],
  temperature = 0,
) {
  for (let j = 0; j < buffer.height; j++) {
    for (let i = 0; i < buffer.width; i++) {
      const index = (j * buffer.width + i) * 4;
      const target_color: [r: number, g: number, b: number] = [
        buffer.data[index + 0] / 255,
        buffer.data[index + 1] / 255,
        buffer.data[index + 2] / 255,
      ];
      const current_color = sample(
        color_palette,
        softargmax(
          color_palette.map(
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
