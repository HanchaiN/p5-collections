import { argmax, softargmax, softmax } from "@/script/utils/math";
import * as color from "@thi.ng/color";

function kMeans<T>(
  samples: T[],
  N_SAMPLE: number = 1000,
  n = 16,
  max_iter = 1000,
  seed: T[] = [],
  copy: (v: T) => T = (v) => v,
  dist: (a: T, b: T) => number = () => 0,
  average: (a: T[], w: number[]) => T = (a, w) => a[argmax(w)],
) {
  const OMEGA = 1e20;
  const centroids: T[] = seed.length === 0 ? [] : seed.map((v) => copy(v));
  if (centroids.length > n) {
    centroids.splice(n);
  }
  const getSample = (n = N_SAMPLE) =>
    samples
      .filter(() => Math.random() < n / samples.length)
      .sort(() => Math.random() - 0.5);
  const getCentroid: () => T = () => {
    const sample = getSample();
    const weight = sample.map((v) =>
      Math.min(OMEGA, ...centroids.map((c) => Math.pow(dist(v, c), 2))),
    );
    const sum = weight.reduce((acc, w) => acc + w, 0);
    const r = Math.random() * sum;
    let s = 0;
    for (let j = 0; j < weight.length; j++) {
      s += weight[j];
      if (s >= r) {
        return copy(sample[j]);
      }
    }
    return copy(sample[0]);
  };
  // K-means++ initialization
  while (centroids.length < n) {
    centroids.push(getCentroid());
  }
  // K-means clustering
  for (let _ = 0; _ < max_iter; _++) {
    const acc: T[][] = new Array(centroids.length).fill(0).map(() => []);
    const sample = getSample();
    for (let k = 0; k < sample.length; k++) {
      let min_dist = Infinity;
      let min_index = -1;
      for (let j = 0; j < centroids.length; j++) {
        const d = dist(sample[k], centroids[j]);
        if (d < min_dist) {
          min_dist = d;
          min_index = j;
        }
      }
      acc[min_index].push(sample[k]);
    }
    let converged = true;
    for (let j = 0; j < centroids.length; j++) {
      if (acc[j].length === 0) {
        centroids[j] = getCentroid();
        converged = false;
      } else {
        const c_ = average(
          acc[j],
          acc[j].map(() => 1 / acc[j].length),
        );
        if (dist(c_, centroids[j]) > 1e-6) converged = false;
        centroids[j] = c_;
      }
    }
    if (converged) break;
  }
  return centroids;
}

function getSilhouetteScore<T>(
  samples: T[],
  centroids: T[] = [],
  dist: (a: T, b: T) => number,
) {
  const ind = samples.map((v) => {
    let min_dist = Infinity,
      min_ind = -1;
    for (let j = 0; j < centroids.length; j++) {
      const d = dist(v, centroids[j]);
      if (d < min_dist) {
        min_dist = d;
        min_ind = j;
      }
    }
    return min_ind;
  });
  const cls = new Array(centroids.length)
    .fill(0)
    .map((_, i) =>
      samples.map((c, i) => ({ c, i })).filter((_, j) => ind[j] === i),
    );
  const a = samples.map((v, i) => {
    if (cls[ind[i]].length <= 1) return Infinity;
    return (
      cls[ind[i]].reduce((acc, { c: o }) => acc + dist(v, o), 0) /
      (cls[ind[i]].length - 1)
    );
  });
  const b = samples.map((v, i) => {
    let min_dist = Infinity;
    for (let j = 0; j < centroids.length; j++) {
      if (cls[j].length <= 0) continue;
      const d =
        cls[j].reduce((acc, { c: o }) => acc + dist(v, o), 0) /
        cls[ind[i]].length;
      if (d < min_dist) {
        min_dist = d;
      }
    }
    return min_dist;
  });
  const s = samples.map((_, i) => {
    return Number.isNaN(a[i]) || Number.isNaN(b[i])
      ? 0
      : !Number.isFinite(a[i])
        ? -1
        : !Number.isFinite(b[i])
          ? 1
          : softmax([a[i], b[i]]) === 0
            ? 0
            : (b[i] - a[i]) / softmax([a[i], b[i]]);
  });
  const score = softmax(
    cls.map((v) =>
      v.length === 0 ? -1 : v.reduce((acc, { i }) => acc + s[i], 0) / v.length,
    ),
  );
  return score;
}
export function getPalette(
  buffer: ImageData,
  n?: number,
  with_score?: false,
  max_iter?: number,
  seed?: color.Oklab[],
): color.Oklab[];
export function getPalette(
  buffer: ImageData,
  n: number,
  with_score: true,
  max_iter?: number,
  seed?: color.Oklab[],
): [color.Oklab[], number];
export function getPalette(
  buffer: ImageData,
  n = 16,
  with_score = false,
  max_iter = 1000,
  seed: color.Oklab[] = [],
) {
  const samples = new Array(buffer.width * buffer.height)
    .fill(0)
    .map((_, i) => {
      return color.oklab(
        color.srgb(
          buffer.data[i * 4 + 0] / 255,
          buffer.data[i * 4 + 1] / 255,
          buffer.data[i * 4 + 2] / 255,
        ),
      );
    });
  const N_SAMPLE = (100 * samples.length) / max_iter;
  const dist = (a: color.Oklab, b: color.Oklab) => {
    return color.distEucledian3(a, b);
  };
  const average = (a: color.Oklab[], w: number[]) => {
    const v = [0, 0, 0, 0];
    a.forEach((_, i) => {
      v[0] += a[i].l * w[i];
      v[1] += a[i].a * w[i];
      v[2] += a[i].b * w[i];
      v[3] += w[i];
    });
    return color.oklab(v[0] / v[3], v[1] / v[3], v[2] / v[3]);
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
): color.Oklab[];
export function getPalette_Auto(
  buffer: ImageData,
  return_full: true,
): { n: number; score: number; centroids: color.Oklab[] }[];
export function getPalette_Auto(
  buffer: ImageData,
  return_full: boolean = false,
) {
  const palettes: { n: number; score: number; centroids: color.Oklab[] }[] = [];
  {
    let seed: color.Oklab[] = [];
    for (let n = 2; n <= 64; n *= 2) {
      const [centroids, score] = getPalette(buffer, n, true, 1000, seed);
      seed = centroids;
      palettes.push({ n, score, centroids });
    }
  }
  if (return_full) return palettes;
  const seed = Math.random();
  return (
    softargmax(palettes.map((v) => v.score)).reduce<{
      s: number;
      centroids: color.Oklab[] | null;
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
): Generator<color.Oklab[], never, number | void>;
export function getPalette_Generator(
  buffer: ImageData,
  with_score: true,
): Generator<[color.Oklab[], number], never, number | void>;
export function* getPalette_Generator(
  buffer: ImageData,
  with_score: boolean = false,
): Generator<color.Oklab[] | [color.Oklab[], number], never, number | void> {
  let n = 1;
  let seed: color.Oklab[] = [];
  while (true) {
    const [centroids, score] = getPalette(buffer, n, true, 1000, seed);
    seed = centroids;
    const n_ = yield with_score ? [centroids, score] : centroids;
    if (typeof n_ === "number" && Number.isInteger(n_) && n_ > 0) n = n_;
    else n++;
  }
}
