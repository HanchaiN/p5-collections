import { Vector } from "../utils/math.js";
import { Dye } from "./colors.js";

export function lambertianEmitter(color) {
    return (toViewer, norm) => color.clone();
}
export function phongEmitter(color, exponent) {
    return (toViewer, norm) => {
        const emit_rate = Math.pow(Math.max(-norm.dot(toViewer), 0), exponent);
        return color.clone().mult(emit_rate)
    };
}
function BDF(BRDF = null, BTDF = null) {
    if (BRDF === null && BTDF === null) {
        return (toViewer, norm, toSource, rel_index) => null
    }
    if (BTDF === null)
        return (toViewer, norm, toSource, rel_index) => {
            if (
                norm.dot(toViewer) * norm.dot(toSource) > 0
            ) {
                return BRDF(toViewer, norm, toSource).lightMult(2);
            }
            return null;
        }
    if (BRDF === null)
        return (toViewer, norm, toSource, rel_index) => {
            if (
                norm.dot(toViewer) * norm.dot(toSource) < 0
            ) {
                return BTDF(toViewer, norm, toSource, rel_index).lightMult(2);
            }
            return null;
        }
    return (toViewer, norm, toSource, rel_index) => {
        const cos_i = Math.abs(norm.dot(toViewer));
        const cos_t = Math.sqrt(1 - (1 - cos_i * cos_i) / (rel_index * rel_index))
        const R = (
            Math.pow((cos_i - rel_index * cos_t) / (cos_i + rel_index * cos_t), 2)
            + Math.pow((cos_t - rel_index * cos_i) / (cos_t + rel_index * cos_i), 2)
        ) / 2;
        if (
            norm.dot(toViewer) * norm.dot(toSource) > 0
        ) {
            return BRDF(toViewer, norm, toSource).lightMult(R);
        }
        if (
            norm.dot(toViewer) * norm.dot(toSource) < 0
        ) {
            return BTDF(toViewer, norm, toSource, rel_index).lightMult(1 - R);
        }
        return null;
    }
}
export function lambertianBRDF(color) {
    return (toViewer, norm, toSource) => {
        const diffuse_rate = Math.abs(norm.dot(toSource));
        return color.clone().lightMult(diffuse_rate);
    }
}
export function phongBRDF(diffuse, specular, exponent) {
    const lambertian = lambertianBRDF(diffuse);
    return (toViewer, norm, toSource) => {
        const reflect_to = Vector.mult(norm, 2 * toSource.dot(norm)).sub(toSource);
        const specular_rate = Math.pow(Math.max(reflect_to.dot(toViewer), 0), exponent);
        const factor = Dye.black;
        factor.lightMix(lambertian(toViewer, norm, toSource));
        factor.lightMix(specular.clone().lightMult(specular_rate));
        factor.lightMult(.5);
        return factor;
    }
}
export function blinnphongBRDF(diffuse, specular, exponent) {
    const lambertian = lambertianBRDF(diffuse);
    return (toViewer, norm, toSource) => {
        const half_angle = Vector.add(toViewer, toSource);
        const factor = Dye.black;
        const specular_rate = Math.pow(Math.max(norm.dot(half_angle), 0), exponent);
        factor.lightMix(lambertian(toViewer, norm, toSource));
        factor.lightMix(specular.clone().lightMult(specular_rate));
        factor.lightMult(.5);
        return factor;
    }
}
export function phongBTDF(color, exponent) {
    return (toViewer, norm, toSource, rel_index) => {
        const cos_i = Math.abs(norm.dot(toViewer));
        const refract_to = toViewer.copy().mult(-rel_index).add(norm.copy().mult(rel_index * cos_i - Math.sqrt(1 - rel_index * rel_index * (1 - cos_i * cos_i))));
        const refract_rate = Math.pow(Math.max(refract_to.dot(toViewer), 0), exponent);
        return color.clone().lightMult(refract_rate);
    }
}
export function defaultInterior(color) {
    return (from, direction, distance) => color.clone().mult(distance);
}
export class Material {
    constructor(
        brdf = null,
        emittance = null,
        btdf = null,
        interior = null,
        index = 1,
    ) {
        this.emittance = emittance;
        this.bdf = BDF(brdf, btdf);
        this.interior = interior;
        this.index = index;
    }
}