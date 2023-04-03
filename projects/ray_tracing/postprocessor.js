import { constrain, constrainLerp, lerp } from "../utils/math.js";

// https://64.github.io/tonemapping/
export const luminance = ({ r, g, b }) => 0.299 * r + 0.587 * g + 0.114 * b;

const exposture = (exposture) => ({ r, g, b }) => ({
    r: r * exposture,
    g: g * exposture,
    b: b * exposture,
});
const white_balance = ({ r, g, b }) => {
    const x0 = 0.49000 * r + 0.31000 * g + 0.20000 * b;
    const y0 = 0.19697 * r + 0.81240 * g + 0.01063 * b;
    const z0 = 0.00000 * r + 0.01000 * g + 0.99000 * b;
    return ({ r, g, b }) => {
        const x = (0.49000 * r + 0.31000 * g + 0.20000 * b) * 0.95047 / x0;
        const y = (0.19697 * r + 0.81240 * g + 0.01063 * b) * 1.00 / y0;
        const z = (0.00000 * r + 0.01000 * g + 0.99000 * b) * 1.088883 / z0;
        return {
            r: (8041697 * x - 3049000 * y - 1591847 * z) / 3400850,
            g: (-1752003 * x + 4851000 * y + 301853 * z) / 3400850,
            b: (17697 * x - 49000 * y + 3432153 * z) / 3400850,
        }
    };
};
const contrast = (contrast) => ({ r, g, b }) => ({
    r: contrast * (r - 0.5) + 0.5,
    g: contrast * (g - 0.5) + 0.5,
    b: contrast * (b - 0.5) + 0.5,
});
const brightness = (brightness) => ({ r, g, b }) => ({
    r: r + brightness,
    g: g + brightness,
    b: b + brightness,
});
const saturation = (saturation) => ({ r, g, b }) => {
    const l = luminance({ r, g, b });
    return {
        r: lerp(saturation, l, r),
        g: lerp(saturation, l, g),
        b: lerp(saturation, l, b),
    };
};

const clamp = ({ r, g, b }) => ({
    r: constrain(r, 0, 1),
    g: constrain(g, 0, 1),
    b: constrain(b, 0, 1),
});

export const reinhard = ({ r, g, b }) => ({ r, g, b }) => ({
    r: r / (1 + r),
    g: g / (1 + g),
    b: b / (1 + b),
});
export const reinhard_lum = ({ r, g, b }) => ({ r, g, b }) => {
    const l = luminance({ r, g, b });
    return {
        r: r / (1 + l),
        g: g / (1 + l),
        b: b / (1 + l),
    };
};
export const reinhard_jodie = ({ r, g, b }) => {
    const reinhard_lum_ = reinhard_lum({ r, g, b });
    const reinhard_ = reinhard({ r, g, b });
    return ({ r, g, b }) => {
        const l = reinhard_lum_({ r, g, b });
        const h = reinhard_({ r, g, b });
        const i = h;
        return {
            r: constrainLerp(i.r, l.r, h.r),
            g: constrainLerp(i.g, l.g, h.g),
            b: constrainLerp(i.b, l.b, h.b),
        };
    }
};
export const reinhard_jodie_lum = ({ r, g, b }) => {
    const reinhard_lum_ = reinhard_lum({ r, g, b });
    const reinhard_ = reinhard({ r, g, b });
    return ({ r, g, b }) => {
        const l = reinhard_lum_({ r, g, b });
        const h = reinhard_({ r, g, b });
        const i = l;
        return {
            r: constrainLerp(i.r, l.r, h.r),
            g: constrainLerp(i.g, l.g, h.g),
            b: constrainLerp(i.b, l.b, h.b),
        };
    }
};
export const scaler = ({ r: ref_r, g: ref_g, b: ref_b }) => ({ r, g, b }) => ({
    r: r / ref_r,
    g: g / ref_g,
    b: b / ref_b,
});
export const scaler_lum = ({ r, g, b }) => {
    const ref = luminance({ r, g, b });
    return ({ r, g, b }) => ({
        r: r / ref,
        g: g / ref,
        b: b / ref,
    });
};
export const reinhard_ext = ({ r, g, b }) => {
    const r2 = r * r, g2 = g * g, b2 = b * b;
    const reinhard_ = reinhard({ r, g, b });
    return ({ r, g, b }) => {
        const c = reinhard_({ r, g, b });
        return {
            r: (1 + r / r2) * c.r,
            g: (1 + g / g2) * c.g,
            b: (1 + b / b2) * c.b,
        };
    }
};
export const reinhard_lum_ext = ({ r, g, b }) => {
    const l = luminance({ r, g, b });
    const l2 = l * l;
    return ({ r, g, b }) => {
        const li = luminance({ r, g, b });
        const lo = (1 + li / l2) * li / (1 + li);
        return {
            r: r * lo / li,
            g: g * lo / li,
            b: b * lo / li,
        };
    };
};
export const reinhard_jodie_ext = ({ r, g, b }) => {
    const reinhard = reinhard_ext({ r, g, b });
    const reinhard_lum = reinhard_lum_ext({ r, g, b });
    return ({ r, g, b }) => {
        const l = reinhard_lum({ r, g, b });
        const h = reinhard({ r, g, b });
        const i = h;
        return {
            r: constrainLerp(i.r, l.r, h.r),
            g: constrainLerp(i.g, l.g, h.g),
            b: constrainLerp(i.b, l.b, h.b),
        };
    };
};
export const reinhard_jodie_lum_ext = ({ r, g, b }) => {
    const reinhard = reinhard_ext({ r, g, b });
    const reinhard_lum = reinhard_lum_ext({ r, g, b });
    return ({ r, g, b }) => {
        const l = reinhard_lum({ r, g, b });
        const h = reinhard({ r, g, b });
        const i = l;
        return {
            r: constrainLerp(i.r, l.r, h.r),
            g: constrainLerp(i.g, l.g, h.g),
            b: constrainLerp(i.b, l.b, h.b),
        };
    };
};

const gamma = (y) => ({ r, g, b }) => {
    const lum = luminance({ r, g, b });
    const factor = Math.pow(lum, y) / lum;
    return { r: r * factor, g: g * factor, b: b * factor };
};

const linear2sRGB = ({ r, g, b }) => ({
    r: r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055,
    g: g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055,
    b: b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055,
});

export const postProcessorGen = (
    TONEMAPPER = (ref) => (col) => col,
    GAMMA = 1,
    EXPOSTURE = 1,
    BRIGHTNESS = 0,
    CONTRAST = 1,
    SATURATION = 1,
) =>
    ({ bright, white } = { bright: { r: 1, g: 1, b: 1 }, white: { r: 1, g: 1, b: 1 } }) => {
        const exposture_ = exposture(EXPOSTURE);
        const white_balance_ = white_balance(exposture_(white));
        const contrast_ = contrast(CONTRAST);
        const brightness_ = brightness(BRIGHTNESS);
        const saturate_ = saturation(SATURATION);
        const tonemapper_ = TONEMAPPER(saturate_(brightness_(contrast_(white_balance_(exposture_(bright))))));
        const gamma_ = gamma(GAMMA);
        return ({ r, g, b }) => {
            const c = linear2sRGB(
                gamma_(
                    clamp(
                        tonemapper_(
                            saturate_(
                                brightness_(
                                    contrast_(
                                        white_balance_(
                                            exposture_(
                                                { r, g, b }
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
            return c;
        };
    }
