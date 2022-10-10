const MAXDEPTH = 20;
// Distance
const EPSILON = 1e-2;
const OMEGA = 1e4;
// Intensity
const Omega = 1e2;

class light {
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
        return new light(
            this.color.r + other.color.r,
            this.color.g + other.color.g,
            this.color.b + other.color.b
        );
    }
    mult(fac) {
        return new light(
            this.color.r * fac,
            this.color.g * fac,
            this.color.b * fac
        );
    }
    apply(pigment) {
        return new light(
            this.color.r * pigment.color.r,
            this.color.g * pigment.color.g,
            this.color.b * pigment.color.b
        );
    }
    static black() {
        return new light(0, 0, 0);
    }
    static white() {
        return new light(Omega, Omega, Omega);
    }
}

class ray {
    constructor() {
        this.position = null;
        this.direction = null;
    }
    intersect(object) {
        let d;
        let distance = 0;
        let pos = this.position.copy();
        let dir = this.direction.copy();
        while ((d = object.distance(pos)) > EPSILON) {
            dir.setMag(d);
            pos.add(dir);
            distance += d;
            if (distance > OMEGA) {
                return false;
            }
        }
        return {
            material: object.material(pos, this.direction),
            normal: object.normal(pos),
            position: pos,
        };
    }
    cleanup() {
        this.direction.normalize();
    }
}

function trace(path, object, depth = 0) {
    if (depth > MAXDEPTH) {
        return light.black();
    }
    let intersect = path.intersect(object);
    console.log(depth, path, intersect);
    if (!intersect) {
        return light.black();
    }
    let mat = intersect.material;
    let emit = mat.emittance;
    let brdf = mat.reflectance;
    // let btdf = mat.transmission;
    let next = new ray();
    next.position = intersect.position;
    next.direction = p5.Vector.random3D();
    if (
        intersect.normal.dot(path.direction) *
        intersect.normal.dot(next.direction) < 0
    ) {
        next.direction.mult(-1);
    }
    let prob = mat.prob(path.direction, next.direction, intersect.normal);
    let inc = trace(next, object, depth + 1);
    return emit.mix(inc.apply(brdf).mult(prob));
}
