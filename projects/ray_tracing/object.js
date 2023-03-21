import { Light, OMEGA } from "./ray.js";
import { map, Vector } from "../utils/index.js";
export class Dye {
    constructor(r, g, b) {
        this.color = { r: r, g: g, b: b };
    }
    rgb() {
        return Light.white.apply(this).rgb();
    }
    clone() {
        return new Dye(this.color.r, this.color.g, this.color.b);
    }
    lightMix(other) {
        this.color.r += other.color.r;
        this.color.g += other.color.g;
        this.color.b += other.color.b;
        return this;
    }
    lightMult(fac) {
        this.color.r *= fac;
        this.color.g *= fac;
        this.color.b *= fac;
        return this;
    }
    mix(other) {
        this.color.r *= other.color.r;
        this.color.g *= other.color.g;
        this.color.b *= other.color.b;
        return this;
    }
    mult(fac) {
        this.color.r = Math.pow(this.color.r, fac);
        this.color.g = Math.pow(this.color.g, fac);
        this.color.b = Math.pow(this.color.b, fac);
        return this;
    }
    static get black() {
        return new Dye(0, 0, 0);
    }
    static get white() {
        return new Dye(1, 1, 1);
    }
}
export class Material {
    constructor(
        emittance = (toViewer, norm) => Light.black,
        brdf = phongBRDF(Dye.white, Dye.white, 1),
    ) {
        this.emittance = emittance; // light
        this.brdf = brdf;
    }
    at(pos) {
        return this;
    }
}

function phongBRDF(diffuse, specular, shininess) {
    return (toViewer, norm, nextDir) => {
        const diffuse_ref = norm;
        const specular_ref = Vector.mult(norm, 2 * toViewer.dot(norm)).sub(toViewer);
        const factor = Dye.black;
        if (
            norm.dot(toViewer) * norm.dot(nextDir) < 0
        ) {
            // BRTF
            return factor;
        }
        const diffuse_rate = Math.max(diffuse_ref.dot(nextDir), 0);
        const specular_rate = Math.pow(Math.max(specular_ref.dot(nextDir), 0), shininess);
        factor.lightMix(diffuse.clone().lightMult(diffuse_rate));
        factor.lightMix(specular.clone().lightMult(specular_rate));
        return factor;
    }
}
export class PhongMaterial extends Material {
    constructor(
        emittance = (toViewer, norm) => Light.black(),
        diffuse = Dye.white, specular = Dye.white, shininess = 1,
    ) {
        super(emittance, phongBRDF(diffuse, specular, shininess))
    }
}

export class Object {
    constructor(
        distance = (pos) => OMEGA,
        normal = (pos) => Vector.normalize(pos).mult(-1),
        material = new Material()
    ) {
        this.distance = distance;
        this.normal = normal;
        if (material instanceof Material)
            this.materialAt = material.at.bind(material);
        else
            this.materialAt = material;
    }
    static union(...objects) {
        let distance = (pos) => Math.min(...objects.map(o => o.distance(pos)));
        let normal = (pos) => {
            const dist = distance(pos);
            const object = objects.find(o => o.distance(pos) === dist);
            return object.normal(pos);
        }
        let materialAt = (pos) => {
            const dist = distance(pos);
            const object = objects.find(o => o.distance(pos) === dist);
            return object.materialAt(pos);
        }
        return new Object(distance, normal, materialAt);
    }
}

export class Sphere extends Object {
    constructor(center, radius, mat = new Material()) {
        let distance = (pos) => center.dist(pos) - radius;
        let normal = (pos) => Vector.sub(pos, center).normalize();
        super(distance, normal, mat);
    }
}
export class Horizon extends Object {
    constructor(up = new Vector(0, 1, 0)) {
        let up_ = up.normalize();
        let distance = (pos) => OMEGA - pos.mag();
        let normal = (pos) => Vector.normalize(pos).mult(-1);
        let emittance = (inp, norm) => Light.white.mult(.1).mult(map(Math.atan(inp.dot(up_) * 1000), +Math.PI / 2, -Math.PI / 2, 0, 1));
        super(distance, normal, new Material(emittance, null));
    }
}