import { Complex } from "../utils/math.js";
export class Gyrovector {
    // https://www.researchgate.net/publication/242146667_What_is_a_vector_in_hyperbolic_geometry_And_what_is_a_hyperbolic_linear_transformation
    // https://www.researchgate.net/publication/268710591_Gyrovector_spaces_and_their_differential_geometry

    constructor(z) {
        this.z = z;
    }
    add(V) {
        // depend on models
        const u = this.z;
        const v = V.z;
        return new Gyrovector(Complex.div(Complex.add(u, v).div(Complex.add(1, Complex.mult(u.conj(), v)))));
    }
    neg() {
        // depend on models
        return new Gyrovector(Complex.mult(this.z, -1));
    }
    mult(t) {
        // depend on models
        if (t < 0) {
            return this.neg().mult(-t);
        }
        const abs = this.z.abs();
        return new Gyrovector(Complex.mult(this.z, 1 / abs, (Math.pow(1 + abs, t) - Math.pow(1 - abs, t)) / ((Math.pow(1 + abs, t) + Math.pow(1 - abs, t)))));
    }
    gyr(u, v) {
        // Identities
        return u.add(v).neg().add(u.add(v.add(this)));
    }
    coadd(v) {
        // Definition
        return this.add(v.gyr(this, v.neg()));
    }
    static geodesic(i, o) {
        const invI = Complex.copy(i.z).div(i.z.absSq());
        const pI = Complex.add(i.z, invI).mult(0.5);
        const mI = -1 / Math.tan(Complex.sub(i.z, invI).theta);
        const invO = Complex.copy(o.z).div(o.z.absSq());
        const pO = Complex.add(o.z, invO).mult(0.5);
        const mO = -1 / Math.tan(Complex.sub(o.z, invO).theta);
        const cI = pI.im - pI.re * mI;
        const cO = pO.im - pO.re * mO;
        const Cx = (cO - cI) / (mI - mO);
        const Cy = mI * Cx + cI;
        const R = Complex.fromCartesian(Cx, Cy).sub(i.z).abs();
        return ["circle", Cx, Cy, R];
    }
}