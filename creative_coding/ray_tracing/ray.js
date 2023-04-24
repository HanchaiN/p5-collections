import { Vector } from "../utils/math.js";
import { Light } from "./colors.js";
import { MAX_DEPTH, MAX_DIST, MIN_DIST } from "./const.js";

export class Ray {
    constructor(pos, dir) {
        this.position = pos;
        this.direction = dir.normalize();
    }
    intersect(object) {
        let position = this.position.copy();
        let d, total_dist = 0;
        while ((d = object.distance(position)) <= MIN_DIST) {
            total_dist += (d = Math.max(Math.abs(d) * 0.99, MIN_DIST));
            position.add(this.direction.copy().mult(d));
        }
        const isInside = object.distance(position) < 0;
        while ((d = object.distance(position)) > MIN_DIST) {
            total_dist += (d = Math.max(Math.abs(d) * 0.99, Math.abs(d) - MIN_DIST / 2));
            position.add(this.direction.copy().mult(d));
            if (total_dist > MAX_DIST) {
                return null;
            }
        }
        return {
            position,
            total_dist,
            isInside,
        };
    }
}

export function trace(ray, object, depth = 0) {
    if (depth > MAX_DEPTH) return Light.black;
    const intersect = ray.intersect(object);
    const toViewer = ray.direction.copy().mult(-1);
    if (intersect === null) return Light.black;
    const { position, total_dist, isInside } = intersect;
    const light = Light.black;
    const material = object.materialAt(position, ray.direction.copy());
    const normal = object.normal(position);
    if (material.emittance !== null) {
        const emit = material.emittance(toViewer, normal);
        light.mix(emit);
    }
    if (material.bdf !== null) {
        const nextDir = Vector.random3D();
        const bdf = material.bdf(toViewer, normal, nextDir, isInside ? 1 / material.index : material.index);
        if (bdf !== null && !bdf.isBlack()) {
            const nextPos = position.copy();
            const next = trace(new Ray(nextPos, nextDir), object, depth + 1);
            light.mix(next.apply(bdf));
        }
    }
    if (!isInside && material.interior !== null)
        light.apply(material.interior(ray.position.copy(), ray.direction.copy(), total_dist));
    return light;
}
