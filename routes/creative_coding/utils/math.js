export function constrain(v, l, h) { return Math.min(h, Math.max(l, v)); }
export function map(v, l, h, l_, h_) { return l_ + (v - l) * (h_ - l_) / (h - l); }
export function lerp(v, l, h) { return map(v, 0, 1, l, h); }
export function constrainMap(v, l, h, l_, h_) { return constrain(map(v, l, h, l_, h_), l_, h_); }
export function constrainLerp(v, l, h) { return constrainMap(v, 0, 1, l, h); }
export function sigm(x) { return 1 / (1 + Math.exp(-x)); }
export function gaus(x) { return Math.exp(-x*x); }
export function symlog(x) { return x > 0 ? Math.log(1 + x) : -Math.log(1 - x); }
export function symlog_inv(x) { return x > 0 ? Math.exp(x) - 1 : 1 - Math.exp(-x); }
export function fract(x) { return x - Math.floor(x); }
export function randomGaussian(mu = 0, sigma = 1) {
    const U1 = Math.random(),
        U2 = Math.random();
    const Z0 = Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * Math.PI * U2),
        Z1 = Math.sqrt(-2 * Math.log(U1)) * Math.sin(2 * Math.PI * U2);
    return Z0 * sigma + mu
}
export function randomChi(k = 1)
{
    return Math.sqrt(new Array(Math.ceil(k)).fill(0).map(_=>Math.pow(randomGaussian(0, 1), 2)).reduce((acc, cur) => acc + cur, 0));
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
    constructor(...val) {
        this.set(...val);
    }
    get x() { return this._val[0] ?? 0; }
    get y() { return this._val[1] ?? 0; }
    get z() { return this._val[2] ?? 0; }
    get w() { return this._val[3] ?? 0; }
    get val() { return this._val.slice(); }
    get dim() { return this._val.length; }
    static zero(dim) {
        return new this(...new Array(dim).fill(0));
    }
    set(...val) {
        if (val.length === 0) val = [0, 0, 0]
        this._val = val.slice();
        return this;
    }
    copy() {
        return Vector.copy(this);
    }
    static copy(v) {
        if (v instanceof this)
            return new this(...v.val);
        if (typeof v === "number")
            return new this(v, v, v);
        throw new TypeError();
    }
    dot(v) {
        if (this.dim !== v.dim) throw new TypeError();
        return this.val.reduce((acc, _, i) => acc + this._val[i] * v._val[i], 0);
    }
    static dot(a, b) {
        if (!(a instanceof this) || !(b instanceof this))
            throw new TypeError();
        return a.dot(b);
    }
    cross(v) {
        if (this.dim !== 3 || v.dim !== 3) throw new TypeError();
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vector(x, y, z);
    }
    static cross(a, b) {
        if (!(a instanceof this) || !(b instanceof this))
            throw new TypeError();
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
    static dist(a, b) {
        if (!(a instanceof this) || !(b instanceof this))
            throw new TypeError();
        return a.dist(b);
    }
    add(v) {
        if (typeof v === "number")
            this.set(...this._val.map(_ => _ + v));
        if (v instanceof Vector)
            if (this.dim !== v.dim) throw new TypeError();
            else this.set(...this._val.map((_, i) => this._val[i] + v._val[i]));
        return this;
    }
    static add(a, ...args) {
        const vec = this.copy(a);
        for (let v of args) vec.add(v);
        return vec;
    }
    sub(v) {
        if (typeof v === "number")
            this.set(...this._val.map(_ => _ - v));
        if (v instanceof Vector)
            if (this.dim !== v.dim) throw new TypeError();
            else this.set(...this._val.map((_, i) => this._val[i] - v._val[i]));
        return this;
    }
    static sub(a, b) {
        return this.copy(a).sub(b);
    }
    mult(v) {
        if (typeof v === "number")
            this.set(...this._val.map(_ => _ * v));
        if (v instanceof Vector)
            if (this.dim !== v.dim) throw new TypeError();
            else this.set(...this._val.map((_, i) => this._val[i] * v._val[i]));
        return this;
    }
    static mult(a, ...args) {
        const vec = this.copy(a);
        for (let v of args) vec.mult(v);
        return vec;
    }
    div(v) {
        if (typeof v === "number")
            this.set(...this._val.map(_ => _ / v));
        if (v instanceof Vector)
            if (this.dim !== v.dim) throw new TypeError();
            else this.set(...this._val.map((_, i) => this._val[i] / v._val[i]));
        return this;
    }
    static div(a, b) {
        return this.copy(a).div(b);
    }
    normalize() {
        return this.div(this.mag());
    }
    static normalize(v) {
        if (!(v instanceof this))
            throw new TypeError();
        return this.copy(v).normalize();
    }
    setMag(len) {
        return this.normalize().mult(len);
    }
    heading() {
        if (this.dim !== 2) throw new TypeError();
        return Math.atan2(this.y, this.x);
    }
    angleBetween(v) {
        if (this.dim !== v.dim) throw new TypeError();
        const factor = this.dot(v) / (this.mag() * v.mag());
        return Math.acos(factor) * Math.sign(this.x * v.y - this.y * v.x);
    }
    static angleBetween(a, b) {
        if (!(a instanceof this) || !(b instanceof this))
            throw new TypeError();
        return a.angleBetween(b);
    }
    rotate(theta) {
        if (this.dim !== 2) throw new TypeError();
        return this.set(
            this.x * Math.cos(theta) - this.y * Math.sin(theta),
            this.x * Math.sin(theta) + this.y * Math.cos(theta),
        );
    }
    static rotate(v, theta) {
        if (!(v instanceof this))
            throw new TypeError();
        return this.copy(v).rotate(theta);
    }
    toPolar() {
        if (this.dim !== 2) throw new TypeError();
        const r = this.mag();
        const theta = this.heading();
        return { r, theta };
    }
    static fromPolar(r = 0, theta = 0) {
        return new this(
            r * Math.cos(theta),
            r * Math.sin(theta),
        );
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
export class Complex {
    constructor() { }
    get re() {
        return this._re;
    }
    get im() {
        return this._im;
    }
    get r() {
        return this.abs();
    }
    get theta() {
        return Math.atan2(this.im, this.re);
    }
    set(re = 0, im = 0) {
        this._re = re;
        this._im = im;
        return this;
    }
    static fromCartesian(re = 0, im = 0) {
        return new this().set(re, im);
    }
    setPolar(r = 0, theta = 0) {
        this._re = r * Math.cos(theta);
        this._im = r * Math.sin(theta);
        return this;
    }
    static fromPolar(r = 0, theta = 0) {
        return new this().setPolar(r, theta);
    }
    copy() {
        return Complex.copy(this);
    }
    static copy(v) {
        if (v instanceof this) {
            return new this().set(v.re, v.im);
        }
        if (typeof v === "number") {
            return this.fromCartesian(v);
        }
        throw new TypeError();
    }
    conj() {
        return Complex.fromCartesian(this.re, -this.im);
    }
    static conj(v) {
        return this.copy(v).conj();
    }
    absSq() {
        return this.conj().mult(this).re;
    }
    abs() {
        return Math.sqrt(this.absSq());
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
        const z = this.copy(a);
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
        return this.copy(a).sub(b);
    }
    mult(v) {
        if (v instanceof Complex) {
            this.set(this.re * v.re - this.im * v.im, this.re * v.im + this.im * v.re);
        }
        if (typeof v === "number") {
            this.set(this.re * v, this.im * v);
        }
        return this;
    }
    static mult(a, ...args) {
        const z = this.copy(a);
        for (let v of args) z.mult(v);
        return z;
    }
    div(v) {
        if (v instanceof Complex) {
            this.mult(v.conj()).div(v.absSq());
        }
        if (typeof v === "number") {
            this.set(this.re / v, this.im / v);
        }
        return this;
    }
    static div(a, b) {
        return this.copy(a).div(b);
    }
    exp() {
        return Complex.fromPolar(Math.exp(this.re), this.im);
    }
    static exp(z) {
        return this.copy(z).exp();
    }
    log() {
        return Complex.fromCartesian(Math.log(this.r), this.theta);
    }
    static log(z) {
        return this.copy(z).log();
    }
    pow(v) {
        return Complex.fromPolar(pow(this.r, v), this.theta * v);
    }
    static pow(a, b) {
        if (b instanceof this)
            return this.mult(b, this.log(a)).exp();
        if (a instanceof this)
            return a.pow(b);
        if (typeof a === "number")
            return this.copy(pow(a, b));
        throw new TypeError();
    }
    sinh() {
        return Complex.fromCartesian(
            Math.sinh(this.re) * Math.cos(this.im),
            Math.cosh(this.re) * Math.sin(this.im),
        );
    }
    cosh() {
        return Complex.fromCartesian(
            Math.cosh(this.re) * Math.cos(this.im),
            Math.sinh(this.re) * Math.sin(this.im),
        );
    }
    sin() {
        return Complex.fromCartesian(
            Math.sin(this.re) * Math.cosh(this.im),
            Math.cos(this.re) * Math.sinh(this.im),
        );
    }
    static sin(z) {
        return this.copy(z).sin();
    }
    cos() {
        return Complex.fromCartesian(
            Math.cos(this.re) * Math.cosh(this.im),
            Math.sin(this.re) * Math.sinh(this.im),
        );
    }
}
export class ComplexPolar extends Complex {
    constructor() { }
    get re() {
        return this._r * Math.cos(this._theta);
    }
    get im() {
        return this._r * Math.sin(this._theta);
    }
    get r() {
        return Math.abs(this._r);
    }
    get theta() {
        return (this._r > 0 ? this._theta : this._theta + Math.PI) % (2 * Math.PI);
    }
    set(re = 0, im = 0) {
        this._r = Math.sqrt(re * re + im * im);
        this._theta = Math.atan2(im, re);
        return this;
    }
    setPolar(r = 0, theta = 0) {
        this._r = Math.abs(this._r);
        this._theta = (r > 0 ? theta : theta + Math.PI) % (2 * Math.PI);
        return this;
    }
    copy() {
        return ComplexPolar.copy(this);
    }
    conj() {
        return ComplexPolar.fromPolar(this.r, -this.theta);
    }
    absSq() {
        return pow(this.r, 2);
    }
    abs() {
        return this.r;
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
    sub(v) {
        if (v instanceof Complex) {
            this.set(this.re - v.re, this.im - v.im);
        }
        if (typeof v === "number") {
            this.set(this.re - v, this.im);
        }
        return this;
    }
    mult(v) {
        if (v instanceof Complex) {
            this.setPolar(this.r * v.r, this.theta + v.theta);
        }
        if (typeof v === "number") {
            this.setPolar(this.r * v, this.theta);
        }
        return this;
    }
    div(v) {
        if (v instanceof Complex) {
            this.mult(v.conj()).div(v.absSq());
        }
        if (typeof v === "number") {
            this.setPolar(this.r / v, this.theta);
        }
        return this;
    }
    exp() {
        return ComplexPolar.fromPolar(Math.exp(this.re), this.im);
    }
    log() {
        return ComplexPolar.fromCartesian(Math.log(this.r), this.theta);
    }
    pow(v) {
        return ComplexPolar.fromPolar(pow(this.r, v), this.theta * v);
    }
    sinh() {
        return ComplexPolar.fromCartesian(
            Math.sinh(this.re) * Math.cos(this.im),
            Math.cosh(this.re) * Math.sin(this.im),
        );
    }
    cosh() {
        return ComplexPolar.fromCartesian(
            Math.cosh(this.re) * Math.cos(this.im),
            Math.sinh(this.re) * Math.sin(this.im),
        );
    }
    sin() {
        return ComplexPolar.fromCartesian(
            Math.sin(this.re) * Math.cosh(this.im),
            Math.cos(this.re) * Math.sinh(this.im),
        );
    }
    cos() {
        return ComplexPolar.fromCartesian(
            Math.cos(this.re) * Math.cosh(this.im),
            Math.sin(this.re) * Math.sinh(this.im),
        );
    }
}

export function gamma(n) {
    const gammaP = [
        0.99999999999999709182,
        57.156235665862923517,
        -59.597960355475491248,
        14.136097974741747174,
        -0.49191381609762019978,
        0.33994649984811888699e-4,
        0.46523628927048575665e-4,
        -0.98374475304879564677e-4,
        0.15808870322491248884e-3,
        -0.21026444172410488319e-3,
        0.21743961811521264320e-3,
        -0.16431810653676389022e-3,
        0.84418223983852743293e-4,
        -0.26190838401581408670e-4,
        0.36899182659531622704e-5
    ];
    const gammaG = 4.7421875;
    if (typeof n === "number") {
        if (Number.isInteger(n)) {
            if (n <= 0) return Number.isFinite(n) ? Infinity : NaN;
            if (n > 171) return Infinity;
            return factorial(n - 1);
        }
        if (n < 0.5)
            return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
        if (n > 171.35) return Infinity;
        if (n > 85.0)
            return Math.sqrt(2 * Math.PI / n)
                * Math.pow((n / Math.E), n)
                * (
                    1
                    + 1 / (12 * pow(n, 1))
                    + 1 / (288 * pow(n, 2))
                    - 139 / (51840 * pow(n, 3))
                    - 571 / (2488320 * pow(n, 4))
                    + 163879 / (209018880 * pow(n, 5))
                    + 5246819 / (75246796800 * pow(n, 6))
                );
        n--;
        let x = gammaP[0];
        for (let i = 1; i < gammaP.length; i++)
            x += gammaP[i] / (n + i);
        const t = n + gammaG + 0.5;
        return x
            * Math.sqrt(2 * Math.PI)
            * Math.pow(t, n + 0.5)
            * Math.exp(-t);
    }
    if (n instanceof Complex) {
        if (n.im === 0)
            return Complex.copy(gamma(n.re));
        if (n.re < 0.5)
            return Complex.copy(Math.PI)
                .div(Complex.mult(n, Math.PI).sin())
                .div(gamma(Complex.sub(1.0, n)));
        const z = n.copy().sub(1);
        const x = Complex.fromCartesian(gammaP[0]);
        for (let i = 1; i < gammaP.length; i++)
            x.add(Complex.div(gammaP[i], Complex.add(z, i)));
        const t = Complex.add(z, gammaG, 0.5);
        return x.copy(true)
            .mult(Complex.copy(Math.sqrt(2 * Math.PI)))
            .mult(Complex.pow(t, Complex.add(z, 0.5)))
            .div(Complex.exp(t));
    }
}

export function zeta(s, prec = 1e-3, only = false) {
    let z = Complex.copy(s);
    if (z.absSq() === 0) return -0.5;
    let dec = -Math.round(Math.log(prec * 0.1) / Math.log(10))
    let n = Math.min(Math.round(1.3 * dec + 0.9 * Math.abs(z.im)), 60);

    function d(k) {
        let S = 0
        for (let j = k; j <= n; j++) {
            S += (product(n - j + 1, n + j - 1) * (4 ** j) / factorial(2 * j));
        }
        return n * S;
    }
    function f(z) {
        let S = Complex.copy(0);
        for (let k = 1; k <= n; k++) {
            S.add(
                Complex.div(pow(-1, k - 1) * d(k), Complex.pow(k, z))
            );
        }
        return S.div(
            Complex.pow(2, Complex.sub(1, z))
                .sub(1)
                .mult(-d(0))
        )
    }
    if (z.re > 1 || z.re == 0 || only) {
        return f(z)
    }
    return Complex.pow(2, z)
        .mult(Complex.pow(Math.PI, Complex.sub(z, 1)))
        .mult(Complex.mult(z, Math.PI / 2).sin().copy(true))
        .mult(gamma(Complex.sub(1, z)))
        .mult(zeta(Complex.sub(1, z), prec, true));
}