export function constrain(v, l, h) { return Math.min(h, Math.max(l, v)); }
export function map(v, l, h, l_, h_) { return l_ + (v - l) * (h_ - l_) / (h - l); }
export function lerp(v, l, h) { return map(v, 0, 1, l, h); }
export function constrainMap(v, l, h, l_, h_) { return constrain(map(v, l, h, l_, h_), l_, h_); }
export function constrainLerp(v, l, h) { return constrainMap(v, 0, 1, l, h); }
export function sigm(x) { return 1 / (1 + Math.exp(-x)); }
export function randomGaussian(mu = 0, sigma = 1) {
    const U1 = Math.random(),
        U2 = Math.random();
    const Z0 = Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * Math.PI * U2),
        Z1 = Math.sqrt(-2 * Math.log(U1)) * Math.sin(2 * Math.PI * U2);
    return Z0 * sigma + mu
}
function negpow(val) {
    if (val % 2 === 0) return +1;
    if (val % 2 === 1) return -1;
    return 0;
}
export function pow(x, y) {
    if (x < 0) return negpow(y) * pow(-x, y);
    if (x < 1) return pow(1 / x, -y);
    if (y < 0) return 1 / pow(x, -y);
    if (Math.floor(y) === 0) return Math.pow(x, y);
    const exp = Math.floor(y), half = pow(x, Math.floor(exp / 2)), rem = y - exp;
    if (exp % 2 === 0) return half * half * pow(x, rem);
    if (exp % 2 === 1) return half * half * x * pow(x, rem);
    return 0;
}
export function product(from, to) {
    if (to < from) {
        return 1
    }

    if (to === from) {
        return to
    }

    const half = from + Math.floor((to - from) / 2);
    return product(from, half) * product(half + 1, to);
}
export function factorial(n) {
    return product(2, n);
}
export function permutation(a, k) {
    return product(a - k + 1, a);
}
export function combination(a, k) {
    return product(a - k + 1, a) / factorial(k);
}
export class Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.set(x, y, z);
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    set(x = 0, y = 0, z = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
        return this;
    }
    copy() {
        return Vector.copy(this);
    }
    static copy(v) {
        if (v instanceof Vector) {
            return new Vector(v.x, v.y, v.z);
        }
        if (typeof v === "number") {
            return new Vector(v, v, v);
        }
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    static dot(a, b) {
        return a.dot(b);
    }
    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vector(x, y, z);
    }
    static cross(a, b) {
        return a.cross(b);
    }
    magSq() {
        return this.dot(this);
    }
    mag() {
        return Math.sqrt(this.magSq());
    }
    dist(v) {
        return Vector.sub(v, this).mag();
    }
    add(v) {
        if (v instanceof Vector) {
            this.set(this.x + v.x, this.y + v.y, this.z + v.z);
        }
        if (typeof v === "number") {
            this.set(this.x + v, this.y + v, this.z + v);
        }
        return this;
    }
    static add(a, ...args) {
        const vec = Vector.copy(a);
        for (let v of args) vec.add(v);
        return vec;
    }
    sub(v) {
        if (v instanceof Vector) {
            this.set(this.x - v.x, this.y - v.y, this.z - v.z);
        }
        if (typeof v === "number") {
            this.set(this.x - v, this.y - v, this.z - v);
        }
        return this;
    }
    static sub(a, b) {
        return Vector.copy(a).sub(b);
    }
    mult(v) {
        if (v instanceof Vector) {
            this.set(this.x * v.x, this.y * v.y, this.z * v.z);
        }
        if (typeof v === "number") {
            this.set(this.x * v, this.y * v, this.z * v);
        }
        return this;
    }
    static mult(a, ...args) {
        const vec = Vector.copy(a);
        for (let v of args) vec.mult(v);
        return vec;
    }
    div(v) {
        if (v instanceof Vector) {
            this.set(this.x / v.x, this.y / v.y, this.z / v.z);
        }
        if (typeof v === "number") {
            this.set(this.x / v, this.y / v, this.z / v);
        }
        return this;
    }
    static div(a, b) {
        return Vector.copy(a).div(b);
    }
    normalize() {
        return this.div(this.mag());
    }
    static normalize(vector) {
        return Vector.copy(vector).normalize();
    }
    setMag(len) {
        return this.normalize().mult(len);
    }
    heading() {
        return Math.atan2(this.y, this.x);
    }
    angleBetween(v) {
        const factor = this.dot(v) / (this.mag() * v.mag());
        return Math.acos(Math.min(1, Math.max(-1, factor))) * Math.sign(this.cross(v).z || 1);
    }
    static angleBetween(a, b) {
        return a.angleBetween(b);
    }
    rotate(theta) {
        return this.set(
            this.x * Math.cos(theta) - this.y * Math.sin(theta),
            this.x * Math.sin(theta) + this.y * Math.cos(theta),
        );
    }
    static rotate(v, theta) {
        return Vector.copy(v).rotate(theta);
    }
    toPolar() {
        const r = this.mag();
        const theta = this.heading();
        return { r, theta };
    }
    static fromPolar(r = 0, theta = 0) {
        return new Vector(
            r * Math.cos(theta),
            r * Math.sin(theta),
        );
    }
    toSphere() {
        const r = this.mag();
        const theta = r === 0 ? 0 : Math.acos(this.z / r);
        const phi = Math.atan2(this.y, this.x);
        return { r, theta, phi };
    }
    static fromSphere(r = 0, theta = 0, phi = 0) {
        return new Vector(
            r * Math.sin(theta) * Math.cos(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(theta),
        );
    }
    static random2D() {
        const angle = Math.random() * Math.PI * 2;
        return Vector.fromPolar(1, angle);
    }
    static random3D() {
        const angle = Math.random() * Math.PI * 2;
        const vz = Math.random() * 2 - 1;
        return Vector.fromSphere(1, Math.acos(vz), angle);
    }
}
export class Complex {
    constructor() { }
    get isPolar() { return this._re === null; }
    get re() { return this.isPolar ? Math.cos(this.theta) * this.r : this._re; }
    get im() { return this.isPolar ? Math.sin(this.theta) * this.r : this._im; }
    get r() {
        return this.isPolar ? this._r : this.abs();
    }
    get theta() {
        return this.isPolar ? this._theta : Math.atan2(this.im, this.re);
    }
    set(re = 0, im = 0) {
        this._re = re;
        this._im = im;
        this._r = null;
        this._theta = null;
        return this;
    }
    static fromCartesian(re = 0, im = 0) {
        return new Complex().set(re, im);
    }
    setPolar(r = 0, theta = 0) {
        this._fixPolar();
        this._re = null;
        this._im = null;
        this._r = r;
        this._theta = theta;
        return this;
    }
    static fromPolar(r = 0, theta = 0) {
        return new Complex().setPolar(r, theta);
    }
    _fixPolar() {
        if (!this.isPolar) return;
        this._r = Math.abs(this._r);
        this._theta = this._r > 0 ? this._theta : this._theta + Math.PI;
        this._theta %= 2 * Math.PI;
    }
    copy() {
        return this.isPolar ? Complex.fromPolar(this.r, this.theta) : Complex.fromCartesian(this.re, this.im);
    }
    static copy(v) {
        if (v instanceof Complex) {
            return v.copy();
        }
        if (typeof v === "number") {
            return Complex.fromCartesian(v);
        }
    }
    conj() {
        return this.isPolar ? Complex.fromPolar(this.r, -this.theta) : Complex.fromCartesian(this.re, -this.im);
    }
    static conj(v) {
        return Complex.copy(v).conj();
    }
    absSq() {
        return this.isPolar ? Math.pow(this.r, 2) : this.conj().mult(this).re;
    }
    abs() {
        return this.isPolar ? this.r : Math.sqrt(this.absSq());
    }
    add(v) {
        if (v instanceof Complex) {
            this.set(this.re + v.re, this.im + v.im);
        }
        if (typeof v === "number") {
            this.set(this.re + v, this.im);
        }
        return this;
    }
    static add(a, ...args) {
        const z = Complex.copy(a);
        for (let v of args) z.add(v);
        return z;
    }
    sub(v) {
        if (v instanceof Complex) {
            this.set(this.re - v.re, this.im - v.im);
        }
        if (typeof v === "number") {
            this.set(this.re - v, this.im);
        }
        return this;
    }
    static sub(a, b) {
        return Complex.copy(a).sub(b);
    }
    mult(v) {
        if (v instanceof Complex) {
            if (this.isPolar && v.isPolar)
                this.setPolar(this.r * v.r, this.theta + v.theta);
            else
                this.set(this.re * v.re - this.im * v.im, this.re * v.im + this.im * v.re);
        }
        if (typeof v === "number") {
            if (this.isPolar)
                this.setPolar(this.r * v, this.theta);
            else
                this.set(this.re * v, this.im * v);
        }
        return this;
    }
    static mult(a, ...args) {
        const z = Complex.copy(a);
        for (let v of args) z.mult(v);
        return z;
    }
    div(v) {
        if (v instanceof Complex) {
            if (this.isPolar && v.isPolar)
                this.setPolar(this.r / v.r, this.theta - v.theta);
            else
                this.mult(v.conj()).div(v.absSq());
        }
        if (typeof v === "number") {
            if (this.isPolar)
                this.setPolar(this.r / v, this.theta);
            else
                this.set(this.re / v, this.im / v);
        }
        return this;
    }
    static div(a, b) {
        return Complex.copy(a).div(b);
    }
    exp() {
        return Complex.fromPolar(Math.exp(this.re), this.im);
    }
    pow(v) {
        return Complex.fromPolar(pow(this.r, v), this.theta * v);
    }
}
export class ComplexVector {
    constructor(x = 0, y = 0, z = 0) {
        this.set(x, y, z);
    }
    get x() { return Complex.copy(this._x); }
    get y() { return Complex.copy(this._y); }
    get z() { return Complex.copy(this._z); }
    get re() { return new Vector(this._x.re, this._y.re, this._z.re); }
    get im() { return new Vector(this._x.im, this._y.im, this._z.im); }
    set(x = 0, y = 0, z = 0) {
        this._x = Complex.copy(x);
        this._y = Complex.copy(y);
        this._z = Complex.copy(z);
        return this;
    }
    copy() {
        return ComplexVector.copy(this);
    }
    conj() {
        this.set(this._x.conj(), this._y.conj(), this._z.conj())
    }
    static copy(v) {
        if (v instanceof Vector || v instanceof ComplexVector) {
            return new ComplexVector(v.x, v.y, v.z);
        }
        if (typeof v === "number" || v instanceof Complex) {
            return new Vector(v, v, v);
        }
    }
    dot(v) {
        return Complex.add(
            Complex.mult(this._x, Complex.conj(v._x)),
            Complex.mult(this._y, Complex.conj(v._y)),
            Complex.mult(this._z, Complex.conj(v._z))
        );
    }
    static dot(a, b) {
        return a.dot(b);
    }
    cross(v) {
        return new ComplexVector(
            Complex.sub(Complex.mult(this._y, v._z), Complex.mult(this._z, v._y)).conj(),
            Complex.sub(Complex.mult(this._z, v._x), Complex.mult(this._x, v._z)).conj(),
            Complex.sub(Complex.mult(this._x, v._y), Complex.mult(this._y, v._x)).conj()
        );
    }
    magSq() {
        return this.dot(this).re;
    }
    mag() {
        return Math.sqrt(this.magSq());
    }
    dist(v) {
        return ComplexVector.sub(v, this).mag();
    }
    add(v) {
        if (v instanceof Vector || v instanceof ComplexVector) {
            this.set(Complex.add(this._x, v._x), Complex.add(this._y, v._y), Complex.add(this._z, v._z));
        }
        if (typeof v === "number" || v instanceof Complex) {
            this.add(new ComplexVector(v, v, v));
        }
        return this;
    }
    static add(a, ...args) {
        const vec = ComplexVector.copy(a);
        for (let v of args) vec.add(v);
        return vec;
    }
    sub(v) {
        if (v instanceof Vector || v instanceof ComplexVector) {
            this.set(Complex.sub(this._x, v._x), Complex.sub(this._y, v._y), Complex.sub(this._z, v._z));
        }
        if (typeof v === "number" || v instanceof Complex) {
            this.sub(new ComplexVector(v, v, v));
        }
        return this;
    }
    static sub(a, b) {
        return ComplexVector.copy(a).sub(b);
    }
    mult(v) {
        if (v instanceof Vector || v instanceof ComplexVector) {
            this.set(Complex.mult(this._x, v._x), Complex.mult(this._y, v._y), Complex.mult(this._z, v._z));
        }
        if (typeof v === "number" || v instanceof Complex) {
            this.mult(new ComplexVector(v, v, v));
        }
        return this;
    }
    static mult(a, ...args) {
        const vec = ComplexVector.copy(a);
        for (let v of args) vec.mult(v);
        return vec;
    }
    div(v) {
        if (v instanceof Vector || v instanceof ComplexVector) {
            this.set(Complex.div(this._x, v._x), Complex.div(this._y, v._y), Complex.div(this._z, v._z));
        }
        if (typeof v === "number" || v instanceof Complex) {
            this.div(new ComplexVector(v, v, v));
        }
        return this;
    }
    static div(a, b) {
        return ComplexVector.copy(a).div(b);
    }
    normalize() {
        return this.div(this.mag());
    }
    static normalize(vector) {
        return ComplexVector.copy(vector).normalize();
    }
    setMag(len) {
        return this.normalize().mult(len);
    }
}