export function constrain(v, l, h) { return Math.min(h, Math.max(l, v)); }
export function map(v, l, h, l_, h_) { return l_ + (v - l) * (h_ - l_) / (h - l); }
export function lerp(v, l, h) { return map(v, 0, 1, l, h); }
export function constrainMap(v, l, h, l_, h_) { return constrain(map(v, l, h, l_, h_), l_, h_); }
export function constrainLerp(v, l, h) { return constrainMap(v, 0, 1, l, h); }
export function sigm(x) { return 1 / (1 + Math.exp(-x)); }
export function fract(x) { return x - Math.floor(x); }
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
        return new Complex().set(re, im);
    }
    setPolar(r = 0, theta = 0) {
        this._re = r * Math.cos(theta);
        this._im = r * Math.sin(theta);
        return this;
    }
    static fromPolar(r = 0, theta = 0) {
        return new Complex().setPolar(r, theta);
    }
    copy(polar = null) {
        return Complex.fromCartesian(this.re, this.im);
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
        return Complex.fromCartesian(this.re, -this.im);
    }
    static conj(v) {
        return Complex.copy(v).conj();
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
            this.set(this.re * v.re - this.im * v.im, this.re * v.im + this.im * v.re);
        }
        if (typeof v === "number") {
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
            this.mult(v.conj()).div(v.absSq());
        }
        if (typeof v === "number") {
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
    static exp(z) {
        return Complex.copy(z).exp();
    }
    log() {
        return Complex.fromCartesian(Math.log(this.r), this.theta);
    }
    static log(z) {
        return Complex.copy(z).log();
    }
    pow(v) {
        return Complex.fromPolar(pow(this.r, v), this.theta * v);
    }
    static pow(a, b) {
        if (a instanceof Complex) {
            if (b instanceof Complex)
                return Complex.mult(b, a.log()).exp();
            if (typeof b === "number")
                return a.pow(b);
        }
        if (typeof a === "number") {
            if (b instanceof Complex)
                return Complex.mult(b, Math.log(a)).exp();
            if (typeof b === "number")
                return Complex.fromPolar(pow(a, b));
        }
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
        return Complex.copy(z).sin();
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
    static fromCartesian(re = 0, im = 0) {
        return new Complex().set(re, im);
    }
    setPolar(r = 0, theta = 0) {
        this._r = Math.abs(this._r);
        this._theta = (r > 0 ? theta : theta + Math.PI) % (2 * Math.PI);
        return this;
    }
    static fromPolar(r = 0, theta = 0) {
        return new Complex().setPolar(r, theta);
    }
    copy() {
        return ComplexPolar.fromPolar(this.r, this.theta);
    }
    static copy(v) {
        if (v instanceof Complex) {
            return v.copy();
        }
        if (typeof v === "number") {
            return ComplexPolar.fromPolar(v);
        }
    }
    conj() {
        return ComplexPolar.fromPolar(this.r, -this.theta);
    }
    static conj(v) {
        return ComplexPolar.copy(v).conj();
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
    static add(a, ...args) {
        const z = ComplexPolar.copy(a);
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
        return ComplexPolar.copy(a).sub(b);
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
    static mult(a, ...args) {
        const z = ComplexPolar.copy(a);
        for (let v of args) z.mult(v);
        return z;
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
    static div(a, b) {
        return ComplexPolar.copy(a).div(b);
    }
    exp() {
        return ComplexPolar.fromPolar(Math.exp(this.re), this.im);
    }
    static exp(z) {
        return ComplexPolar.copy(z).exp();
    }
    log() {
        return ComplexPolar.fromCartesian(Math.log(this.r), this.theta);
    }
    static log(z) {
        return ComplexPolar.copy(z).log();
    }
    pow(v) {
        return ComplexPolar.fromPolar(pow(this.r, v), this.theta * v);
    }
    static pow(a, b) {
        if (b instanceof Complex)
            return ComplexPolar.mult(b, ComplexPolar.log(a)).exp();
        if (a instanceof Complex)
            return a.pow(b);
        if (typeof a === "number")
            return ComplexPolar.fromPolar(pow(a, b));
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
    static sin(z) {
        return ComplexPolar.copy(z).sin();
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