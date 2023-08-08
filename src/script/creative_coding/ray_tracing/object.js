import { constrain, Vector } from "@/script/utils/math";
import { MAX_DIST, MIN_DIST } from "./const";
import { Material } from "./material";

export class Object {
  constructor(
    distance = (pos) => MAX_DIST,
    normal = null,
    material = new Material(),
  ) {
    this.distance = distance;
    if (normal === null)
      normal = (pos) => {
        const vec = new Vector(
          distance(new Vector(+MIN_DIST, 0, 0).add(pos)) -
            distance(new Vector(-MIN_DIST, 0, 0).add(pos)),
          distance(new Vector(0, +MIN_DIST, 0).add(pos)) -
            distance(new Vector(0, -MIN_DIST, 0).add(pos)),
          distance(new Vector(0, 0, +MIN_DIST).add(pos)) -
            distance(new Vector(0, 0, -MIN_DIST).add(pos)),
        );
        if (vec.magSq() === 0) return Vector.normalize(pos).mult(-1);
        return vec.normalize();
      };
    this.normal = normal;
    if (material instanceof Material) this.materialAt = (pos) => material;
    else this.materialAt = material;
  }
  static union(...objects) {
    const distance = (pos) => Math.min(...objects.map((o) => o.distance(pos)));
    const normal = (pos) => {
      const dist = distance(pos);
      const object = objects.find((o) => o.distance(pos) === dist);
      return object.normal(pos);
    };
    const materialAt = (pos) => {
      const dist = distance(pos);
      const object = objects.find((o) => o.distance(pos) === dist);
      return object.materialAt(pos);
    };
    return new Object(distance, normal, materialAt);
  }
  static intersect(...objects) {
    const distance = (pos) => Math.max(...objects.map((o) => o.distance(pos)));
    const normal = (pos) => {
      const dist = distance(pos);
      const object = objects.find((o) => o.distance(pos) === dist);
      return object.normal(pos);
    };
    return new Object(distance, normal, null);
  }
  static subtract(main, operator) {
    const obj = Object.intersect(main, Object.negate(operator));
    obj.materialAt = main.materialAt;
    return obj;
  }
  static negate(object) {
    const distance = (pos) => -object.distance(pos);
    const normal = (pos) => object.normal(pos).mult(-1);
    return new Object(distance, normal, object.materialAt);
  }
  translate(displacement) {
    const inv_transformation = (pos) => pos.copy().sub(displacement);
    const distance = (pos) => {
      return this.distance(inv_transformation(pos));
    };
    const normal = (pos) => {
      return this.normal(inv_transformation(pos));
    };
    const materialAt = (pos) => {
      return this.materialAt(inv_transformation(pos));
    };
    return new Object(distance, normal, materialAt);
  }
  rotate(x, y, z) {
    const x_ = x.normalize(),
      y_ = y.normalize(),
      z_ = z.normalize();
    if (Math.abs(x_.dot(y_.cross(z_))) !== 1)
      console.warn(
        "The transformation might contains skewing (not pure rotation).",
      );
    const inv_transformation = (pos) =>
      new Vector(
        pos.x * x_.x + pos.y * x_.y + pos.z * x_.z,
        pos.x * y_.x + pos.y * y_.y + pos.z * y_.z,
        pos.x * z_.x + pos.y * z_.y + pos.z * z_.z,
      );
    const distance = (pos) => {
      return this.distance(inv_transformation(pos));
    };
    const normal = (pos) => {
      return this.normal(inv_transformation(pos));
    };
    const materialAt = (pos) => {
      return this.materialAt(inv_transformation(pos));
    };
    return new Object(distance, normal, materialAt);
  }
}

// https://iquilezles.org/articles/distfunctions/
class Sphere extends Object {
  constructor(radius, mat) {
    const distance = (pos) => pos.mag() - radius;
    const normal = (pos) => pos.copy().normalize();
    super(distance, normal, mat);
  }
}
export function sphere(center, radius, mat = new Material()) {
  return new Sphere(radius, mat).translate(center);
}
class Box extends Object {
  constructor(dimension, mat) {
    const distance = (pos) => {
      const pos_ = new Vector(
        Math.abs(pos.x),
        Math.abs(pos.y),
        Math.abs(pos.z),
      ).sub(dimension);
      const v = Math.max(pos_.x, pos_.y, pos_.z);
      if (v < 0) return v;
      return new Vector(
        Math.max(pos_.x, 0),
        Math.max(pos_.y, 0),
        Math.max(pos_.z, 0),
      ).mag();
    };
    super(distance, null, mat);
  }
}
export function box(origin, sx, sy, sz, mat = new Material()) {
  const dx = sx.copy().mult(0.5);
  const dy = sy.copy().mult(0.5);
  const dz = sz.copy().mult(0.5);
  return new Box(new Vector(dx.mag(), dy.mag(), dz.mag()), mat)
    .rotate(dx, dy, dz)
    .translate(Vector.add(origin, dx, dy, dz));
}
class Plane extends Object {
  constructor(norm, mat) {
    const distance = (pos) => norm.dot(pos);
    const normal = (pos) => norm.copy();
    super(distance, normal, mat);
  }
}
export function plane(
  norm = new Vector(0, 1, 0),
  pivot = new Vector(0, 0, 0),
  mat = new Material(),
) {
  return new Plane(norm.normalize(), mat).translate(pivot);
}
class Triangle extends Object {
  constructor(a, b, c, mat) {
    const ba = Vector.sub(b, a).normalize();
    const cb = Vector.sub(c, b).normalize();
    const ac = Vector.sub(at, c).normalize();
    const norm = Vector.cross(ba, ac);
    const ba_ = Vector.cross(ba, norm);
    const cb_ = Vector.cross(cb, norm);
    const distance = (p) => {
      const pa = Vector.sub(p, a);
      const pb = Vector.sub(p, b);
      const pc = Vector.sub(p, c);
      const sa = Math.sign(ba_.dot(pa));
      const sb = Math.sign(cb_.dot(pb));
      const sc = Math.sign(ac_.dot(pc));
      if (sa + sb + sc >= 2) return Math.abs(norm.dot(pa));
      const va = constrain(ba.dot(pa), 0, 1);
      const vb = constrain(cb.dot(pb), 0, 1);
      const vc = constrain(ac.dot(pc), 0, 1);
      return Math.sqrt(
        Math.min(
          Vector.mult(ba, va).sub(pa).magSq(),
          Vector.mult(cb, vb).sub(pb).magSq(),
          Vector.mult(ac, vc).sub(pc).magSq(),
        ),
      );
    };
    const normal = (pos) => norm;
    super(distance, normal, mat);
  }
}
export function triangle(a, b, c, mat = new Material()) {
  return new Triangle(a, b, c, mat);
}
class Quad extends Object {
  constructor(a, b, c, d, mat) {
    const ba = Vector.sub(b, a).normalize();
    const cb = Vector.sub(c, b).normalize();
    const dc = Vector.sub(d, c).normalize();
    const ad = Vector.sub(a, d).normalize();
    const norm = Vector.cross(ba, ad);
    const ba_ = Vector.cross(ba, norm);
    const cb_ = Vector.cross(cb, norm);
    const dc_ = Vector.cross(dc, norm);
    const ad_ = Vector.cross(ad, norm);
    const distance = (p) => {
      const pa = Vector.sub(p, a);
      const pb = Vector.sub(p, b);
      const pc = Vector.sub(p, c);
      const pd = Vector.sub(p, d);
      const sa = Math.sign(ba_.dot(pa));
      const sb = Math.sign(cb_.dot(pb));
      const sc = Math.sign(dc_.dot(pc));
      const sd = Math.sign(ad_.dot(pd));
      if (sa + sb + sc + sd >= 3) return Math.abs(norm.dot(pa));
      const va = Math.max(ba.dot(pa), 0);
      const vb = Math.max(cb.dot(pb), 0);
      const vc = Math.max(dc.dot(pc), 0);
      const vd = Math.max(ad.dot(pd), 0);
      return Math.sqrt(
        Math.min(
          Vector.mult(ba, va).sub(pa).magSq(),
          Vector.mult(cb, vb).sub(pb).magSq(),
          Vector.mult(dc, vc).sub(pc).magSq(),
          Vector.mult(ad, vd).sub(pd).magSq(),
        ),
      );
    };
    const normal = (pos) => norm.copy();
    super(distance, normal, mat);
  }
}
export function quad(a, b, c, d, mat = new Material()) {
  return new Quad(a, b, c, d, mat);
}
class Horizon extends Object {
  constructor(mat) {
    const distance = (pos) => Math.max(MAX_DIST - pos.mag(), 0);
    const normal = (pos) => Vector.normalize(pos).mult(-1);
    super(distance, normal, mat);
  }
}
export function horizon(mat = new Material()) {
  return new Horizon(mat);
}
