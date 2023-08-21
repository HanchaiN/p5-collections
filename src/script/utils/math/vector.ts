import type { GPUKernel } from "@/script/utils/types";
import { arctan2 } from ".";
import { randomUniform } from "./random";

export type TVector = number[];
export function vector_dim(v: TVector) {
  return v.length;
}
vector_dim.add = (gpu: GPUKernel) => {
  gpu
    .addFunction(vector_dim, {
      argumentTypes: ["Array"],
      returnType: "Integer",
    })
    .addFunction(vector_dim, {
      argumentTypes: ["Array(2)"],
      returnType: "Integer",
    })
    .addFunction(vector_dim, {
      argumentTypes: ["Array(3)"],
      returnType: "Integer",
    });
};
export function vector_add(a: TVector, b: TVector): TVector {
  // if (vector_dim(a) !== vector_dim(b)) throw new TypeError();
  return a.map((_, i) => a[i] + b[i]);
}
vector_add.add = (gpu: GPUKernel) => {
  // vector_dim.add(gpu);
  gpu
    .addFunction(vector_add, {
      argumentTypes: ["Array", "Array"],
      returnType: "Array",
    })
    .addFunction(vector_add, {
      argumentTypes: ["Array(2)", "Array(2)"],
      returnType: "Array(2)",
    })
    .addFunction(vector_add, {
      argumentTypes: ["Array(3)", "Array(3)"],
      returnType: "Array(3)",
    });
};
export function vector_sub(a: TVector, b: TVector): TVector {
  // if (vector_dim(a) !== vector_dim(b)) throw new TypeError();
  return a.map((_, i) => a[i] - b[i]);
}
vector_sub.add = (gpu: GPUKernel) => {
  // vector_dim.add(gpu);
  gpu
    .addFunction(vector_sub, {
      argumentTypes: ["Array", "Array"],
      returnType: "Array",
    })
    .addFunction(vector_sub, {
      argumentTypes: ["Array(2)", "Array(2)"],
      returnType: "Array(2)",
    })
    .addFunction(vector_sub, {
      argumentTypes: ["Array(3)", "Array(3)"],
      returnType: "Array(3)",
    });
};
export function vector_mult(v: TVector, s: number): TVector {
  return v.map((_, i) => v[i] * s);
}
vector_mult.add = (gpu: GPUKernel) => {
  gpu
    .addFunction(vector_mult, {
      argumentTypes: ["Array", "Float"],
      returnType: "Array",
    })
    .addFunction(vector_mult, {
      argumentTypes: ["Array(2)", "Float"],
      returnType: "Array(2)",
    })
    .addFunction(vector_mult, {
      argumentTypes: ["Array(3)", "Float"],
      returnType: "Array(3)",
    });
};
export function vector_div(v: TVector, s: number): TVector {
  return v.map((_, i) => v[i] / s);
}
vector_div.add = (gpu: GPUKernel) => {
  gpu
    .addFunction(vector_div, {
      argumentTypes: ["Array", "Float"],
      returnType: "Array",
    })
    .addFunction(vector_div, {
      argumentTypes: ["Array(2)", "Float"],
      returnType: "Array(2)",
    })
    .addFunction(vector_div, {
      argumentTypes: ["Array(3)", "Float"],
      returnType: "Array(3)",
    });
};
export function vector_dot(a: TVector, b: TVector) {
  // if (vector_dim(a) != vector_dim(b)) throw new TypeError();
  let acc = 0.0;
  for (let i = 0; i < vector_dim(a); i++) acc += a[i] * b[i];
  return acc;
}
vector_dot.add = (gpu: GPUKernel) => {
  vector_dim.add(gpu);
  gpu
    .addFunction(vector_dot, {
      argumentTypes: ["Array", "Array"],
      returnType: "Float",
    })
    .addFunction(vector_dot, {
      argumentTypes: ["Array(2)", "Array(2)"],
      returnType: "Float",
    })
    .addFunction(vector_dot, {
      argumentTypes: ["Array(3)", "Array(3)"],
      returnType: "Float",
    });
};
export function vector_cross(a: TVector, b: TVector): TVector {
  // if (vector_dim(a) !== 3 || vector_dim(b) !== 3) throw new TypeError();
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
vector_cross.add = (gpu: GPUKernel) => {
  // vector_dim.add(gpu);
  gpu.addFunction(vector_cross, {
    argumentTypes: ["Array(3)", "Array(3)"],
    returnType: "Array(3)",
  });
};
export function vector_magSq(v: TVector) {
  return vector_dot(v, v);
}
vector_magSq.add = (gpu: GPUKernel) => {
  vector_dot.add(gpu);
  gpu
    .addFunction(vector_magSq, {
      argumentTypes: ["Array"],
      returnType: "Float",
    })
    .addFunction(vector_magSq, {
      argumentTypes: ["Array(2)"],
      returnType: "Float",
    })
    .addFunction(vector_magSq, {
      argumentTypes: ["Array(3)"],
      returnType: "Float",
    });
};
export function vector_mag(v: TVector) {
  return Math.sqrt(vector_dot(v, v));
}
vector_mag.add = (gpu: GPUKernel) => {
  vector_magSq.add(gpu);
  gpu
    .addFunction(vector_mag, { argumentTypes: ["Array"], returnType: "Float" })
    .addFunction(vector_mag, {
      argumentTypes: ["Array(2)"],
      returnType: "Float",
    })
    .addFunction(vector_mag, {
      argumentTypes: ["Array(3)"],
      returnType: "Float",
    });
};
export function vector_dist(a: TVector, b: TVector) {
  return vector_mag(vector_sub(a, b));
}
vector_dist.add = (gpu: GPUKernel) => {
  vector_mag.add(gpu);
  vector_sub.add(gpu);
  gpu
    .addFunction(vector_dist, {
      argumentTypes: ["Array", "Array"],
      returnType: "Float",
    })
    .addFunction(vector_dist, {
      argumentTypes: ["Array(2)", "Array(2)"],
      returnType: "Float",
    })
    .addFunction(vector_dist, {
      argumentTypes: ["Array(3)", "Array(3)"],
      returnType: "Float",
    });
};
export function vector_normalize(v: TVector): TVector {
  return vector_div(v, vector_mag(v));
}
export function vector_setMag(v: TVector, mag: number): TVector {
  return vector_mult(vector_normalize(v), mag);
}
export function vector_heading(v: TVector) {
  if (vector_dim(v) !== 2) throw new TypeError();
  return arctan2(v[1], v[0]);
}
export function vector_angleBetween(a: TVector, b: TVector) {
  if (vector_dim(a) !== vector_dim(b)) throw new TypeError();
  if (vector_dim(a) !== 2)
    return Math.acos(vector_dot(a, b) / (vector_mag(a), vector_mag(b)));
  return (
    Math.acos(vector_dot(a, b) / (vector_mag(a), vector_mag(b))) *
    Math.sign(a[0] * b[1] - a[1] * b[0])
  );
}
export function vector_rotate(v: TVector, theta: number): TVector {
  if (vector_dim(v) !== 2) throw new TypeError();
  return [
    Math.cos(theta) * v[0] - Math.sin(theta) * v[1],
    Math.sin(theta) * v[0] + Math.cos(theta) * v[1],
  ];
}
export function vector_inclination(v: TVector) {
  // if (vector_dim(v) !== 3) throw new TypeError();
  const r = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); //vector_mag(v);
  return r === 0 ? 0 : Math.acos(v[2] / r);
}
vector_inclination.add = (gpu: GPUKernel) => {
  // vector_dim.add(gpu);
  // vector_mag.add(gpu);
  gpu.addFunction(vector_inclination, {
    argumentTypes: ["Array(3)"],
    returnType: "Float",
  });
};
export function vector_alzimuth(v: TVector) {
  // if (vector_dim(v) !== 3) throw new TypeError();
  return arctan2(v[1], v[0]);
}
vector_alzimuth.add = (gpu: GPUKernel) => {
  // vector_dim.add(gpu);
  arctan2.add(gpu);
  gpu.addFunction(vector_alzimuth, {
    argumentTypes: ["Array(3)"],
    returnType: "Float",
  });
};
export function vector_fromPolar(r: number, heading: number): TVector {
  return [r * Math.cos(heading), r * Math.sin(heading)];
}
export function vector_fromSphere(
  r: number,
  inclination: number,
  alzimuth: number,
): TVector {
  return [
    r * Math.sin(inclination) * Math.cos(alzimuth),
    r * Math.sin(inclination) * Math.sin(alzimuth),
    r * Math.cos(inclination),
  ];
}
export function vector_random2D() {
  const angle = randomUniform(0, Math.PI * 2);
  return vector_fromPolar(1, angle);
}
export function random3D() {
  const angle = randomUniform(0, Math.PI * 2);
  const vz = randomUniform(-1, 1);
  return vector_fromSphere(1, Math.acos(vz), angle);
}
export class Vector {
  private _val!: number[];
  constructor(...val: number[]) {
    this.set(...val);
  }
  get x() {
    return this._val[0] ?? 0;
  }
  get y() {
    return this._val[1] ?? 0;
  }
  get z() {
    return this._val[2] ?? 0;
  }
  get w() {
    return this._val[3] ?? 0;
  }
  get val() {
    return this._val.slice();
  }
  get dim() {
    return this._val.length;
  }
  static zero(dim: number) {
    return new this(...new Array(dim).fill(0));
  }
  set(...val: number[]) {
    if (val.length === 0) val = [0, 0, 0];
    this._val = val;
    return this;
  }
  copy() {
    return Vector.copy(this);
  }
  static copy(v: Vector) {
    return new this(...v.val);
  }
  dot(v: Vector) {
    if (this.dim !== v.dim) throw new TypeError();
    return this.val.reduce((acc, _, i) => acc + this._val[i] * v._val[i], 0);
  }
  static dot(a: Vector, b: Vector) {
    return a.dot(b);
  }
  cross(v: Vector) {
    if (this.dim !== 3 || v.dim !== 3) throw new TypeError();
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    return new Vector(x, y, z);
  }
  static cross(a: Vector, b: Vector) {
    return a.cross(b);
  }
  magSq() {
    return this.dot(this);
  }
  mag() {
    return Math.sqrt(this.magSq());
  }
  dist(v: Vector) {
    return Vector.sub(v, this).mag();
  }
  static dist(a: Vector, b: Vector) {
    return a.dist(b);
  }
  add(v: Vector | number) {
    if (typeof v === "number") this.set(...this._val.map((_: number) => _ + v));
    if (v instanceof Vector)
      if (this.dim !== v.dim) throw new TypeError();
      else this.set(...this._val.map((_, i) => this._val[i] + v._val[i]));
    return this;
  }
  static add(a: Vector, ...args: (Vector | number)[]) {
    const vec = this.copy(a);
    for (const v of args) vec.add(v);
    return vec;
  }
  sub(v: Vector | number) {
    if (typeof v === "number") this.set(...this._val.map((_: number) => _ - v));
    if (v instanceof Vector)
      if (this.dim !== v.dim) throw new TypeError();
      else this.set(...this._val.map((_, i) => this._val[i] - v._val[i]));
    return this;
  }
  static sub(a: Vector, b: Vector | number) {
    return this.copy(a).sub(b);
  }
  mult(v: number | Vector) {
    if (typeof v === "number") this.set(...this._val.map((_: number) => _ * v));
    if (v instanceof Vector)
      if (this.dim !== v.dim) throw new TypeError();
      else this.set(...this._val.map((_, i) => this._val[i] * v._val[i]));
    return this;
  }
  static mult(a: Vector, ...args: (number | Vector)[]) {
    const vec = this.copy(a);
    for (const v of args) vec.mult(v);
    return vec;
  }
  div(v: number | Vector) {
    if (typeof v === "number") this.set(...this._val.map((_: number) => _ / v));
    if (v instanceof Vector)
      if (this.dim !== v.dim) throw new TypeError();
      else this.set(...this._val.map((_, i) => this._val[i] / v._val[i]));
    return this;
  }
  static div(a: Vector, b: number | Vector) {
    return this.copy(a).div(b);
  }
  normalize() {
    return this.div(this.mag());
  }
  static normalize(v: Vector) {
    return this.copy(v).normalize();
  }
  setMag(len: number) {
    return this.normalize().mult(len);
  }
  heading() {
    if (this.dim !== 2) throw new TypeError();
    return Math.atan2(this.y, this.x);
  }
  angleBetween(v: Vector) {
    if (this.dim !== v.dim) throw new TypeError();
    const factor = this.dot(v) / (this.mag() * v.mag());
    return Math.acos(factor) * Math.sign(this.x * v.y - this.y * v.x);
  }
  static angleBetween(a: Vector, b: Vector) {
    return a.angleBetween(b);
  }
  rotate(theta: number) {
    if (this.dim !== 2) throw new TypeError();
    return this.set(
      this.x * Math.cos(theta) - this.y * Math.sin(theta),
      this.x * Math.sin(theta) + this.y * Math.cos(theta),
    );
  }
  static rotate(v: Vector, theta: number) {
    return this.copy(v).rotate(theta);
  }
  toPolar() {
    if (this.dim !== 2) throw new TypeError();
    const r = this.mag();
    const theta = this.heading();
    return { r, theta };
  }
  static fromPolar(r = 0, theta = 0) {
    return new this(r * Math.cos(theta), r * Math.sin(theta));
  }
  toSphere() {
    if (this.dim !== 3) throw new TypeError();
    const r = this.mag();
    const theta = r === 0 ? 0 : Math.acos(this.z / r);
    const phi = Math.atan2(this.y, this.x);
    return { r, theta, phi };
  }
  static fromSphere(r = 0, theta = 0, phi = 0) {
    return new this(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(theta),
    );
  }
  static random2D() {
    const angle = Math.random() * Math.PI * 2;
    return this.fromPolar(1, angle);
  }
  static random3D() {
    const angle = Math.random() * Math.PI * 2;
    const vz = Math.random() * 2 - 1;
    return this.fromSphere(1, Math.acos(vz), angle);
  }
}
