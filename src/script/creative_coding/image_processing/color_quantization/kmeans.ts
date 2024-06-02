import { argmax, softmax, softargmax, sample } from "@/script/utils/math";

export function kMeans<T>(
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
  const centroids: T[] = seed.map((v) => copy(v));
  if (centroids.length > n) {
    centroids.splice(n);
  }
  const getSample = (n = N_SAMPLE) =>
    samples
      .filter(() => Math.random() < n / samples.length)
      .sort(() => Math.random() - 0.5);
  const getCentroid: () => T = () => {
    const samples = getSample();
    const weight = softargmax(
      samples.map((v) => Math.min(OMEGA, ...centroids.map((c) => dist(v, c)))),
      0.1,
    );
    return sample(samples, weight);
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

export function getSilhouetteScore<T>(
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
    const max = softmax([a[i], b[i]], 0);
    return Number.isNaN(a[i]) || Number.isNaN(b[i])
      ? 0
      : !Number.isFinite(a[i])
        ? -1
        : !Number.isFinite(b[i])
          ? 1
          : max === 0
            ? 0
            : (b[i] - a[i]) / max;
  });
  const score = softmax(
    cls.map((v) =>
      v.length === 0 ? -1 : v.reduce((acc, { i }) => acc + s[i], 0) / v.length,
    ),
    0,
  );
  return score;
}
