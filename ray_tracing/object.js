class dye {
    constructor(r, g, b) {
        this.color = { r: r, g: g, b: b };
    }
    rgb() {
        return this.apply(light.white()).rgb();
    }
    mix(other) {
        return new dye(
            this.color.r * other.color.r,
            this.color.g * other.color.g,
            this.color.b * other.color.b,
        );
    }
    mult(fac) {
        return new dye(
            pow(this.color.r, fac),
            pow(this.color.g, fac),
            pow(this.color.b, fac),
        );
    }
    apply(photon) {
        return new light(
            this.color.r * photon.color.r,
            this.color.g * photon.color.g,
            this.color.b * photon.color.b,
        );
    }
    static black() {
        return new dye(0, 0, 0);
    }
    static white() {
        return new dye(1, 1, 1);
    }
}

class material {
    constructor(
        emittance = light.black(),
        reflectance = dye.white(),
        prob = (inp, opt, norm) => max((norm.dot(inp) > 0 ? +1 : -1) * norm.dot(opt), 0)
    ) {
        this.emittance = emittance; // light
        this.reflectance = reflectance; // dye
        this.prob = prob;
    }
    this() {
        return (_, dir) => this;
    }
}

class prop {
    constructor(
        distance = (_) => OMEGA,
        normal = (_) => createVector(0, 0, 0),
        mat = new material().this()
    ) {
        this.distance = distance;
        this.normal = normal;
        this.material = mat;
    }
    union(other) {
        let distance = (pos_) => min(this.distance(pos_), other.distance(pos_));
        let normal = (pos_) =>
            this.distance(pos_) < other.distance(pos_) ? this.normal(pos_) : other.normal(pos_);
        let mat = (pos_) =>
            this.distance(pos_) < other.distance(pos_) ? this.material(pos_) : other.material(pos_);
        return new prop(distance, normal, mat);
    }
    intersect(other) {
        let distance = (pos_) => max(this.distance(pos_), other.distance(pos_));
        let normal = (pos_) =>
            this.distance(pos_) < other.distance(pos_) ? this.normal(pos_) : other.normal(pos_);
        let mat = (pos_) =>
            this.distance(pos_) < other.distance(pos_) ? this.material(pos_) : other.material(pos_);
        return new prop(distance, normal, mat);
    }
    subtract(other) {
        let distance = (pos_) => max(this.distance(pos_), -other.distance(pos_));
        let normal = (pos_) =>
            this.distance(pos_) < other.distance(pos_) ? this.normal(pos_) : other.normal(pos_);
        let mat = (pos_) =>
            this.distance(pos_) < other.distance(pos_) ? this.material(pos_) : other.material(pos_);
        return new prop(distance, normal, mat);
    }
}

class ball extends prop {
    constructor(pos, rad, mat = new material().this()) {
        let distance = (pos_) => pos.dist(pos_) - rad;
        let normal = (pos_) => p5.Vector.normalize(p5.Vector.sub(pos_, pos));
        super(distance, normal, mat);
    }
}