class Gyrovector {
    // https://www.researchgate.net/publication242146667_What_is_a_vector_in_hyperbolic_geometry_And_what_is_a_hyperbolic_linear_transformation
    // https://www.researchgate.net/publication/268710591_Gyrovector_spaces_and_their_differential_geometry
    constructor(vec) {
        this.vec = vec;
    }
    add(V) {
        // depend on models
        let u = this.vec;
        let v = V.vec;
        let s = p5.Vector.div(
            p5.Vector.add(
                p5.Vector.mult(
                    u,
                    1 + 2 * p5.Vector.dot(u, v) + v.magSq()
                ),
                p5.Vector.mult(
                    v,
                    1 - u.magSq()
                )
            ),
            1 + 2 * p5.Vector.dot(u, v) + u.magSq() * v.magSq()
        );
        return new Gyrovector(s);
    }
    neg() {
        // depend on models
        return new Gyrovector(p5.Vector.mult(this.vec, -1));
    }
    mult(t) {
        // depend on models
        if (t < 0) {
            return this.neg().mult(-t);
        }
        let a = this.vec.mag()
        return new Gyrovector(p5.Vector.mult(this.vec, (pow(1 + a, t) - pow(1 - a, t)) / (a * (pow(1 + a, t) + pow(1 - a, t)))));
    }
    gyr(u, v) {
        // Identities
        return u.add(v).neg().add(u.add(v.add(this)));
    }
    coadd(v) {
        // Definition
        return this.add(v.gyr(this, v.neg()));
    }
}
function geodesic(a, b) {
    // very unstable;
    let eps = 0;
    if (p5.Vector.sub(a.vec, b.vec).mag() <= eps) {
        // same point - undefined
        return ["p", a.vec.x, a.vec.y];
    }
    // depend on models
    // geodisic midpoint (any point on the geodesic except a, b for calculation)
    let t = 0.5;
    let c = a.add(a.neg().add(b).mult(t));
    // canvas untransformed position
    // Solve for circle pass a, b, c
    let ma = p5.Vector.mult(p5.Vector.add(a.vec, c.vec), 0.5);
    let mb = p5.Vector.mult(p5.Vector.add(b.vec, c.vec), 0.5);
    let ga = (a.vec.y - c.vec.y) / (a.vec.x - c.vec.x);
    ga *= -1;
    let gb = (b.vec.y - c.vec.y) / (b.vec.x - c.vec.x);
    gb *= -1;
    if ((ga - gb) <= eps) {
        // infinite circle = line
        return ["l", a.vec.x, a.vec.y, b.vec.x, b.vec.y];
    } else {
        // Oy = g (Ox-x) + y
        // Ox = ga (Oy - ya) + xa
        // Ox = gb (Oy - yb) + xb
        // xb - xa + (ga ya - gb yb)= (ga-gb) Oy
        let Ox = ((ma.x / ga - mb.x / gb) - (ma.y - mb.y)) / (1 / ga - 1 / gb);
        let Oy = ((ga * ma.y - gb * mb.y) - (ma.x - mb.x)) / (ga - gb);
        let r = p5.Vector.sub(
            new p5.Vector(Ox, Oy),
            c.vec
        ).mag();
        return ["c", Ox, Oy, r];
    }
}