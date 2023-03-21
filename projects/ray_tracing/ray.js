import { Vector } from "../utils/index.js";
export const MAXDEPTH = 20;
// Distance
export const EPSILON = 1e-2;
export const OMEGA = 1e4;
// Intensity
const Epsilon = 1e-10;
const Omega = 255;

export class Light {
    constructor(r, g, b) {
        this.color = { r: r, g: g, b: b };
    }
    rgb() {
        // Reinhard tone mapping
        return {
            r: this.color.r / (this.color.r + 1),
            g: this.color.g / (this.color.g + 1),
            b: this.color.b / (this.color.b + 1),
        };
    }
    mix(other) {
        this.color.r += other.color.r;
        this.color.g += other.color.g;
        this.color.b += other.color.b;
        return this;
    }
    mult(fac) {
        this.color.r *= fac;
        this.color.g *= fac;
        this.color.b *= fac;
        return this;
    }
    apply(pigment) {
        this.color.r *= pigment.color.r;
        this.color.g *= pigment.color.g;
        this.color.b *= pigment.color.b;
        return this;
    }
    static get black() {
        return new Light(0, 0, 0);
    }
    static get white() {
        return new Light(Omega, Omega, Omega);
    }
}

export class Ray {
    constructor(pos, dir) {
        this.position = pos;
        this.direction = dir;
        this.cleanup();
    }
    intersect(object) {
        let dist = this.direction.copy();
        let d;
        dist.setMag(EPSILON);
        while ((d = object.distance(Vector.add(this.position, dist))) <= EPSILON) {
            dist.setMag(dist.mag() + Math.max(-0.99 * d, EPSILON));
        }
        while ((d = object.distance(Vector.add(this.position, dist))) > EPSILON) {
            dist.setMag(dist.mag() + Math.max(Math.abs(d) * 0.99, Math.abs(d) - EPSILON / 2));
            if (dist.mag() > 3 * OMEGA) {
                console.warn("Ray does not intersect with the objects.");
                return false;
            }
        }
        const position = Vector.add(this.position, dist);
        return {
            material: object.materialAt(position, this.direction),
            normal: object.normal(position),
            position,
        };
    }
    cleanup() {
        this.direction.normalize();
    }
}

export function trace(path, object, depth = 0) {
    if (depth > MAXDEPTH) {
        return Light.black;
    }
    const intersect = path.intersect(object);
    const toViewer = path.direction.copy().mult(-1);
    if (!intersect)
        return Light.black;
    const mat = intersect.material;
    const result = Light.black;
    const emit = mat.emittance?.(toViewer, intersect.normal);
    if (
        typeof emit !== "undefined"
    ) {
        result.mix(emit);
    }
    const nextDir = Vector.random3D();
    if (intersect.normal.dot(toViewer) * intersect.normal.dot(nextDir) < 0)
        nextDir.mult(-1);
    let brdf = mat.brdf?.(toViewer, intersect.normal, nextDir);
    if (
        typeof brdf !== "undefined"
        && (brdf?.color?.r > Epsilon || brdf?.color?.g > Epsilon || brdf?.color?.b > Epsilon)
    ) {
        const nextPos = intersect.position.copy();
        const inc = trace(new Ray(nextPos, nextDir), object, depth + 1);
        result.mix(inc.apply(brdf));
    }
    return result;
}
