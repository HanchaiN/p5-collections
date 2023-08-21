import { rgb2srgb } from "@/script/utils/color";
import { constrain, constrainLerp, lerp } from "@/script/utils/math";
import type { TColorRGB } from "./colors";

type IToneMapper = (ref: TColorRGB) => (col: TColorRGB) => TColorRGB;

// https://64.github.io/tonemapping/
export const luminance = ([r, g, b]: TColorRGB) =>
  0.299 * r + 0.587 * g + 0.114 * b;
const exposture =
  (exposture: number) =>
  ([r, g, b]: TColorRGB): TColorRGB => [
    r * exposture,
    g * exposture,
    b * exposture,
  ];
const white_balance = ([ref_r, ref_g, ref_b]: TColorRGB) => {
  const x0 = 0.49 * ref_r + 0.31 * ref_g + 0.2 * ref_b;
  const y0 = 0.19697 * ref_r + 0.8124 * ref_g + 0.01063 * ref_b;
  const z0 = 0.0 * ref_r + 0.01 * ref_g + 0.99 * ref_b;
  return ([r, g, b]: TColorRGB): TColorRGB => {
    const x = ((0.49 * r + 0.31 * g + 0.2 * b) * 0.95047) / x0;
    const y = ((0.19697 * r + 0.8124 * g + 0.01063 * b) * 1.0) / y0;
    const z = ((0.0 * r + 0.01 * g + 0.99 * b) * 1.088883) / z0;
    return [
      (8041697 * x - 3049000 * y - 1591847 * z) / 3400850,
      (-1752003 * x + 4851000 * y + 301853 * z) / 3400850,
      (17697 * x - 49000 * y + 3432153 * z) / 3400850,
    ];
  };
};
const contrast =
  (contrast: number) =>
  ([r, g, b]: TColorRGB): TColorRGB => [
    contrast * (r - 0.5) + 0.5,
    contrast * (g - 0.5) + 0.5,
    contrast * (b - 0.5) + 0.5,
  ];
const brightness =
  (brightness: number) =>
  ([r, g, b]: TColorRGB): TColorRGB => [
    r + brightness,
    g + brightness,
    b + brightness,
  ];
const saturation =
  (saturation: number) =>
  ([r, g, b]: TColorRGB): TColorRGB => {
    const l = luminance([r, g, b]);
    return [
      lerp(saturation, l, r),
      lerp(saturation, l, g),
      lerp(saturation, l, b),
    ];
  };
const clamp = ([r, g, b]: TColorRGB): TColorRGB => [
  constrain(r, 0, 1),
  constrain(g, 0, 1),
  constrain(b, 0, 1),
];
export const reinhard: IToneMapper =
  () =>
  ([r, g, b]: TColorRGB): TColorRGB => [r / (1 + r), g / (1 + g), b / (1 + b)];
export const reinhard_lum: IToneMapper =
  () =>
  ([r, g, b]: TColorRGB): TColorRGB => {
    const l = luminance([r, g, b]);
    return [r / (1 + l), g / (1 + l), b / (1 + l)];
  };
export const reinhard_jodie: IToneMapper = ([
  ref_r,
  ref_g,
  ref_b,
]: TColorRGB) => {
  const reinhard_lum_ = reinhard_lum([ref_r, ref_g, ref_b]);
  const reinhard_ = reinhard([ref_r, ref_g, ref_b]);
  return ([r, g, b]: TColorRGB): TColorRGB => {
    const l = reinhard_lum_([r, g, b]);
    const h = reinhard_([r, g, b]);
    const i = h;
    return [
      constrainLerp(i[0], l[0], h[0]),
      constrainLerp(i[1], l[1], h[1]),
      constrainLerp(i[2], l[2], h[2]),
    ];
  };
};
export const reinhard_jodie_lum: IToneMapper = ([
  ref_r,
  ref_g,
  ref_b,
]: TColorRGB) => {
  const reinhard_lum_ = reinhard_lum([ref_r, ref_g, ref_b]);
  const reinhard_ = reinhard([ref_r, ref_g, ref_b]);
  return ([r, g, b]: TColorRGB): TColorRGB => {
    const l = reinhard_lum_([r, g, b]);
    const h = reinhard_([r, g, b]);
    const i = l;
    return [
      constrainLerp(i[0], l[0], h[0]),
      constrainLerp(i[1], l[1], h[1]),
      constrainLerp(i[2], l[2], h[2]),
    ];
  };
};
export const scaler: IToneMapper =
  ([ref_r, ref_g, ref_b]: TColorRGB) =>
  ([r, g, b]: TColorRGB): TColorRGB => [r / ref_r, g / ref_g, b / ref_b];
export const scaler_lum: IToneMapper = ([ref_r, ref_g, ref_b]: TColorRGB) => {
  const ref = luminance([ref_r, ref_g, ref_b]);
  return ([r, g, b]: TColorRGB): TColorRGB => [r / ref, g / ref, b / ref];
};
export const reinhard_ext: IToneMapper = ([ref_r, ref_g, ref_b]: TColorRGB) => {
  const r2 = ref_r * ref_r,
    g2 = ref_g * ref_g,
    b2 = ref_b * ref_b;
  const reinhard_ = reinhard([ref_r, ref_g, ref_b]);
  return ([r, g, b]: TColorRGB): TColorRGB => {
    const c = reinhard_([r, g, b]);
    return [(1 + r / r2) * c[0], (1 + g / g2) * c[1], (1 + b / b2) * c[2]];
  };
};
export const reinhard_lum_ext: IToneMapper = ([
  ref_r,
  ref_g,
  ref_b,
]: TColorRGB) => {
  const l = luminance([ref_r, ref_g, ref_b]);
  const l2 = l * l;
  return ([r, g, b]: TColorRGB): TColorRGB => {
    const li = luminance([r, g, b]);
    const lo = ((1 + li / l2) * li) / (1 + li);
    return [(r * lo) / li, (g * lo) / li, (b * lo) / li];
  };
};
export const reinhard_jodie_ext: IToneMapper = ([
  ref_r,
  ref_g,
  ref_b,
]: TColorRGB) => {
  const reinhard = reinhard_ext([ref_r, ref_g, ref_b]);
  const reinhard_lum = reinhard_lum_ext([ref_r, ref_g, ref_b]);
  return ([r, g, b]: TColorRGB): TColorRGB => {
    const l = reinhard_lum([r, g, b]);
    const h = reinhard([r, g, b]);
    const i = h;
    return [
      constrainLerp(i[0], l[0], h[0]),
      constrainLerp(i[1], l[1], h[1]),
      constrainLerp(i[2], l[2], h[2]),
    ];
  };
};
export const reinhard_jodie_lum_ext: IToneMapper = ([
  ref_r,
  ref_g,
  ref_b,
]: TColorRGB) => {
  const reinhard = reinhard_ext([ref_r, ref_g, ref_b]);
  const reinhard_lum = reinhard_lum_ext([ref_r, ref_g, ref_b]);
  return ([r, g, b]: TColorRGB): TColorRGB => {
    const l = reinhard_lum([r, g, b]);
    const h = reinhard([r, g, b]);
    const i = l;
    return [
      constrainLerp(i[0], l[0], h[0]),
      constrainLerp(i[1], l[1], h[1]),
      constrainLerp(i[2], l[2], h[2]),
    ];
  };
};

const gamma =
  (y: number) =>
  ([r, g, b]: TColorRGB): TColorRGB => {
    const lum = luminance([r, g, b]);
    const factor = Math.pow(lum, y) / lum;
    return [r * factor, g * factor, b * factor];
  };

export const postProcessorGen =
  (
    TONEMAPPER: IToneMapper = () => (col) => col,
    GAMMA = 1,
    EXPOSTURE = 1,
    BRIGHTNESS = 0,
    CONTRAST = 1,
    SATURATION = 1,
  ) =>
  (bright: TColorRGB = [1, 1, 1], white: TColorRGB = [1, 1, 1]) => {
    const exposture_ = exposture(EXPOSTURE);
    const white_balance_ = white_balance(exposture_(white));
    const contrast_ = contrast(CONTRAST);
    const brightness_ = brightness(BRIGHTNESS);
    const saturate_ = saturation(SATURATION);
    const tonemapper_ = TONEMAPPER(
      saturate_(brightness_(contrast_(white_balance_(exposture_(bright))))),
    );
    const gamma_ = gamma(GAMMA);
    return ([r, g, b]: TColorRGB): TColorRGB =>
      rgb2srgb(
        gamma_(
          clamp(
            tonemapper_(
              saturate_(
                brightness_(contrast_(white_balance_(exposture_([r, g, b])))),
              ),
            ),
          ),
        ),
      );
  };
