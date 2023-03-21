export function constrain(v, l, h) { return Math.min(h, Math.max(l, v)); }
export function map(v, l, h, l_, h_) { return l_ + (v - l) * (h_ - l_) / (h - l); }
export function constrainMap(v, l, h, l_, h_) { return constrain(map(v, l, h, l_, h_), l_, h_); }
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
        return new Vector(this.x, this.y, this.z);
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
    static add(a, b) {
        return a.copy().add(b);
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
        return a.copy().sub(b);
    }
    mult(v) {
        if (v instanceof Vector) {
            this.set(this.x * v.x, this.y * v.y, this.z * v.z);
        }
        if (typeof v === "number") {
            this.set(this.x * v, this.y * v, this.z * v);
        }
        return this;
        return this;
    }
    static mult(a, b) {
        return a.copy().mult(b);
    }
    div(v) {
        if (v instanceof Vector) {
            this.set(this.x / v.x, this.y / v.y, this.z / v.z);
        }
        if (typeof v === "number") {
            this.set(this.x / v, this.y / v, this.z / v);
        }
        return this;
        return this;
    }
    static div(a, b) {
        return a.copy().div(b);
    }
    normalize() {
        return this.div(this.mag());
    }
    static normalize(vector) {
        return vector.copy().normalize();
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
        return v.copy().rotate(theta);
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
        this._fixPolar();
        return this.isPolar ? this._r : this.abs();
    }
    get theta() {
        this._fixPolar();
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
    conj() {
        return this.isPolar ? Complex.fromPolar(this.r, -this.theta) : Complex.fromCartesian(this.re, -this.im);
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
    static add(a, b) {
        return a.copy().add(b);
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
        return a.copy().sub(b);
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
    static mult(a, b) {
        return a.copy().mult(b);
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
        return a.copy().div(b);
    }
    exp() {
        return Complex.fromPolar(Math.exp(this.re), this.im);
    }
    pow(v) {
        return Complex.fromPolar(pow(this.r, v), this.theta * v);
    }
}