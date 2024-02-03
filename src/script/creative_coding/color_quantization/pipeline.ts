import { softargmax, softmax } from "@/script/utils/math";
import * as color from "@thi.ng/color";

function getPalette_(buffer: ImageData, n = 16) {
  const getDist = (a: color.Oklab, b: color.Oklab) => {
    const weight = [1, 1, 1, 0];
    const sum = weight.reduce((acc, w) => acc + w * w, 0);
    const s2 = weight.reduce(
      (acc, w, i) => acc + w * w * Math.pow(a[i] - b[i], 2),
      0,
    );
    const d2 = s2 / sum;
    return Math.sqrt(d2);
  };
  const original_colors = new Array(buffer.width * buffer.height)
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
  const centroids: color.Oklab[] = [];
  // K-means++ initialization
  for (let _ = 0; _ < n; _++) {
    const weight = original_colors.map((v) =>
      Math.min(10000, ...centroids.map((c) => Math.pow(getDist(v, c), 2))),
    );
    const sum = weight.reduce((acc, w) => acc + w, 0);
    const r = Math.random() * sum;
    let s = 0;
    for (let j = 0; j < weight.length; j++) {
      s += weight[j];
      if (s >= r) {
        centroids.push(original_colors[j].copy());
        break;
      }
    }
  }
  // K-means clustering
  for (let _ = 0; _ < 1000; _++) {
    const acc = new Array(centroids.length).fill(0).map(() => [0, 0, 0, 0]);
    for (let k = 0; k < original_colors.length; k++) {
      let min_dist = Infinity;
      let min_index = -1;
      for (let j = 0; j < centroids.length; j++) {
        const dist = getDist(original_colors[k], centroids[j]);
        if (dist < min_dist) {
          min_dist = dist;
          min_index = j;
        }
      }
      acc[min_index][0] += original_colors[k].l;
      acc[min_index][1] += original_colors[k].a;
      acc[min_index][2] += original_colors[k].b;
      acc[min_index][3]++;
    }
    let converged = true;
    for (let j = 0; j < centroids.length; j++) {
      if (acc[j][3] === 0) {
        const weight = original_colors.map((v) =>
          Math.min(...centroids.map((c) => Math.pow(getDist(v, c), 2))),
        );
        const sum = weight.reduce((acc, w) => acc + w, 0);
        const r = Math.random() * sum;
        let s = 0;
        for (let j = 0; j < weight.length; j++) {
          s += weight[j];
          if (s >= r) {
            centroids[j] = original_colors[j].copy();
            break;
          }
        }
        converged = false;
      } else {
        acc[j][0] /= acc[j][3];
        acc[j][1] /= acc[j][3];
        acc[j][2] /= acc[j][3];
        const c_ = color.oklab(acc[j][0], acc[j][1], acc[j][2]);
        if (getDist(c_, centroids[j]) > 1e-6) converged = false;
        centroids[j] = c_;
      }
    }
    if (converged) break;
  }
  const ind = original_colors.map((v) => {
    let min_dist = Infinity,
      min_ind = -1;
    for (let j = 0; j < centroids.length; j++) {
      const dist = getDist(v, centroids[j]);
      if (dist < min_dist) {
        min_dist = dist;
        min_ind = j;
      }
    }
    return min_ind;
  });
  const cls = new Array(centroids.length)
    .fill(0)
    .map((_, i) =>
      original_colors.map((c, i) => ({ c, i })).filter((_, j) => ind[j] === i),
    );
  // Silhouette score
  const a = original_colors.map((v, i) => {
    if (cls[ind[i]].length <= 1) return Infinity;
    return (
      cls[ind[i]].reduce((acc, { c: o }) => acc + getDist(v, o), 0) /
      (cls[ind[i]].length - 1)
    );
  });
  const b = original_colors.map((v, i) => {
    let min_dist = Infinity;
    for (let j = 0; j < centroids.length; j++) {
      if (cls[j].length <= 0) continue;
      const dist =
        cls[j].reduce((acc, { c: o }) => acc + getDist(v, o), 0) /
        cls[ind[i]].length;
      if (dist < min_dist) {
        min_dist = dist;
      }
    }
    return min_dist;
  });
  const s = original_colors.map((_, i) => {
    return Number.isNaN(a[i]) || Number.isNaN(b[i])
      ? 0
      : !Number.isFinite(a[i])
      ? -1
      : !Number.isFinite(b[i])
      ? 1
      : softmax(a[i], b[i]) === 0
      ? 0
      : (b[i] - a[i]) / softmax(a[i], b[i]);
  });
  const score = softmax(
    ...cls.map((v) =>
      v.length === 0 ? -1 : v.reduce((acc, { i }) => acc + s[i], 0) / v.length,
    ),
  );
  return { centroids, score };
}

export function getPalette(buffer: ImageData, n: number | null = null) {
  const auto_palette: [number, number, number][] = [];
  if (n !== null) {
    const { centroids } = getPalette_(buffer, n);
    auto_palette.push(...centroids.map((v) => color.srgb(v).xyz));
    return auto_palette;
  }
  const scores: { score: number; centroids: color.Oklab[] }[] = [];
  for (let n = 2; n <= 64; n *= 2) {
    const { score, centroids } = getPalette_(buffer, n);
    console.log(n, score);
    scores.push({ score, centroids });
  }
  const seed = Math.random();
  const centroids =
    softargmax(...scores.map((v) => v.score)).reduce<{
      s: number;
      centroids: color.Oklab[] | null;
    }>(
      ({ s, centroids }, v, i) => {
        if (centroids !== null || s + v < seed) return { s: s + v, centroids };
        return {
          s: s + v,
          centroids: scores[i].centroids,
        };
      },
      { s: 0, centroids: null },
    ).centroids ?? getPalette_(buffer, 16).centroids;
  auto_palette.push(...centroids.map((v) => color.srgb(v).xyz));
  return auto_palette;
}
