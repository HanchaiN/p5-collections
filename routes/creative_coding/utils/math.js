/// <reference path="../utils/types/gpu.d.ts" />
export * from './random.js';
export function constrain(v, l, h) { return Math.min(h, Math.max(l, v)); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
constrain.add = (gpu) => {
    gpu.addFunction(constrain, { argumentTypes: ['Float', 'Float', 'Float'], returnType: 'Float' });
};
export function map(v, l, h, l_, h_) { return l_ + (v - l) * (h_ - l_) / (h - l); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
map.add = (gpu) => {
    gpu.addFunction(map, { argumentTypes: ['Float', 'Float', 'Float', 'Float', 'Float'], returnType: 'Float' });
};
export function lerp(v, l, h) { return map(v, 0, 1, l, h); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
lerp.add = (gpu) => {
    map.add(gpu)
    gpu.addFunction(lerp, { argumentTypes: ['Float', 'Float', 'Float'], returnType: 'Float' });
};
export function constrainMap(v, l, h, l_, h_) { return constrain(map(v, l, h, l_, h_), l_, h_); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
constrainMap.add = (gpu) => {
    constrain.add(gpu);
    map.add(gpu);
    gpu.addFunction(constrainMap, { argumentTypes: ['Float', 'Float', 'Float', 'Float', 'Float'], returnType: 'Float' });
};
export function constrainLerp(v, l, h) { return constrainMap(v, 0, 1, l, h); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
constrainLerp.add = (gpu) => {
    constrainMap.add(gpu);
    gpu.addFunction(constrainLerp, { argumentTypes: ['Float', 'Float', 'Float'], returnType: 'Float' });
};
export function fpart(x) { return x - Math.floor(x); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
fpart.add = (gpu) => {
    gpu.addFunction(fpart, { argumentTypes: ['Float'], returnType: 'Float' });
};
export function powneg(x) {
    return Math.pow(-1, x);
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
powneg.add = (gpu) => {
    constrainLerp.add(gpu);
    gpu.addFunction(powneg, { argumentTypes: ['Integer'], returnType: 'Integer' });
};
export function sigm(x) { return 1 / (1 + Math.exp(-x)); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
sigm.add = (gpu) => {
    gpu.addFunction(sigm, { argumentTypes: ['Float'], returnType: 'Float' });
};
export function gaus(x) { return Math.exp(-x * x); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
gaus.add = (gpu) => {
    gpu.addFunction(gaus, { argumentTypes: ['Float'], returnType: 'Float' });
};
export function symlog(x) { return x > 0 ? Math.log(1 + x) : -Math.log(1 - x); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
symlog.add = (gpu) => {
    gpu.addFunction(symlog, { argumentTypes: ['Float'], returnType: 'Float' });
};
export function symlog_inv(x) { return x > 0 ? Math.exp(x) - 1 : 1 - Math.exp(-x); }
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
symlog_inv.add = (gpu) => {
    gpu.addFunction(symlog_inv, { argumentTypes: ['Float'], returnType: 'Float' });
};
export function product(from, to) {
    let y = 1.0;
    for (let i = from; i <= to; i++)
        y *= i;
    return y;
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
product.add = (gpu) => {
    gpu.addFunction(product, { argumentTypes: ['Float', 'Float'], returnType: 'Float' });
};
export function factorial(n) {
    return product(1, n);
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
factorial.add = (gpu) => {
    product.add(gpu);
    gpu.addFunction(factorial, { argumentTypes: ['Integer'], returnType: 'Integer' });
};
export function permutation(a, k) {
    return product(a - k + 1, a);
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
permutation.add = (gpu) => {
    product.add(gpu);
    gpu.addFunction(permutation, { argumentTypes: ['Float', 'Integer'], returnType: 'Float' });
};
export function combination(a, k) {
    return product(a - k + 1, a) / product(1, k);
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
combination.add = (gpu) => {
    product.add(gpu);
    gpu.addFunction(combination, { argumentTypes: ['Float', 'Integer'], returnType: 'Float' });
};
export function arctan2(y, x) {
    if (y === 0) {
        if (x < 0)
            return Math.PI;
        else
            return 0;
    }
    return 2 * Math.atan(y / (Math.sqrt(x * x + y * y) + x));
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
arctan2.add = (gpu) => {
    gpu.addFunction(arctan2, { argumentTypes: ['Float', 'Float'], returnType: 'Float' });
};
export function complex_conj(z) {
    return [z[0], -z[1]];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_conj.add = (gpu) => {
    gpu.addFunction(complex_conj, { argumentTypes: ['Array(2)'], returnType: 'Array(2)' });
};
export function complex_absSq(z) {
    return z[0] * z[0] + z[1] * z[1];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_absSq.add = (gpu) => {
    gpu.addFunction(complex_absSq, { argumentTypes: ['Array(2)'], returnType: 'Float' });
};
export function complex_add(z1, z2) {
    return [z1[0] + z2[0], z1[1] + z2[1]];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_add.add = (gpu) => {
    gpu.addFunction(complex_add, { argumentTypes: ['Array(2)', 'Array(2)'], returnType: 'Array(2)' });
};
export function complex_scale(z, v) {
    return [z[0] * v, z[1] * v];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_scale.add = (gpu) => {
    gpu.addFunction(complex_scale, { argumentTypes: ['Array(2)', 'Float'], returnType: 'Array(2)' });
};
export function complex_add_inv(z) {
    return complex_scale(z, -1);
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_add_inv.add = (gpu) => {
    complex_scale.add(gpu);
    gpu.addFunction(complex_add_inv, { argumentTypes: ['Array(2)'], returnType: 'Array(2)' });
};
export function complex_sub(z1, z2) {
    // return complex_add(z1, complex_add_inv(z2));
    return [z1[0] - z2[0], z1[1] - z2[1]];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_sub.add = (gpu) => {
    // complex_add.add(gpu);
    // complex_add_inv.add(gpu);
    gpu.addFunction(complex_sub, { argumentTypes: ['Array(2)', 'Array(2)'], returnType: 'Array(2)' });
};
export function complex_mult(z1, z2) {
    return [z1[0] * z2[0] - z1[1] * z2[1], z1[0] * z2[1] + z1[1] * z2[0]];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_mult.add = (gpu) => {
    gpu.addFunction(complex_mult, { argumentTypes: ['Array(2)', 'Array(2)'], returnType: 'Array(2)' });
};
export function complex_mult_inv(z) {
    return complex_scale(complex_conj(z), 1 / complex_absSq(z));
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_mult_inv.add = (gpu) => {
    complex_conj.add(gpu);
    complex_absSq.add(gpu);
    complex_scale.add(gpu);
    gpu.addFunction(complex_mult_inv, { argumentTypes: ['Array(2)'], returnType: 'Array(2)' });
};
export function complex_div(z1, z2) {
    // return complex_mult(z1, complex_mult_inv(z2));
    return complex_scale(complex_mult(z1, [z2[0], -z2[1]]), 1 / complex_absSq(z2));
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_div.add = (gpu) => {
    complex_mult.add(gpu);
    // complex_mult_inv.add(gpu);
    complex_absSq.add(gpu);
    complex_scale.add(gpu);
    gpu.addFunction(complex_div, { argumentTypes: ['Array(2)', 'Array(2)'], returnType: 'Array(2)' });
};
export function complex_sin(z) {
    return [
        Math.sin(z[0]) * Math.cosh(z[1]),
        Math.cos(z[0]) * Math.sinh(z[1]),
    ];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_sin.add = (gpu) => {
    gpu.addFunction(complex_sin, { argumentTypes: ['Array(2)'], returnType: 'Array(2)' });
};
export function complex_exp(z) {
    return [Math.exp(z[0]) * Math.cos(z[1]), Math.exp(z[0]) * Math.sin(z[1])];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_exp.add = (gpu) => {
    gpu.addFunction(complex_exp, { argumentTypes: ['Array(2)'], returnType: 'Array(2)' });
};
export function complex_log(z) {
    return [
        Math.log(Math.sqrt(complex_absSq(z))),
        arctan2(z[1], z[0]),
    ];
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_log.add = (gpu) => {
    complex_absSq.add(gpu);
    arctan2.add(gpu);
    gpu.addFunction(complex_log, { argumentTypes: ['Array(2)'], returnType: 'Array(2)' });
};
export function gamma_re(n) {
    let reflected = false;
    // if (Number.isInteger(n)) {
    //     if (n <= 0) return Number.isFinite(n) ? Infinity : NaN;
    //     if (n > 171) return Infinity;
    //     return factorial(n - 1);
    // }
    if (n < 0.5) {
        n = 1.0 - n;
        reflected = true;
    }
    // if (n > 171.35) return Infinity;
    // if (n > 85.0)
    //     return Math.sqrt(Math.PI * 2.0 / n)
    //         * Math.pow((n / Math.E), n)
    //         * (
    //             1.0
    //             + 1.0 / (Math.pow(n, 1) * 12)
    //             + 1.0 / (Math.pow(n, 2) * 288)
    //             - 139.0 / (Math.pow(n, 3) * 51840)
    //             - 571.0 / (Math.pow(n, 4) * 2488320)
    //             + 163879.0 / (Math.pow(n, 5) * 209018880)
    //             + 5246819.0 / (Math.pow(n, 6) * 75246796800)
    //         );
    n--;
    let x = 0.99999999999999709182;
    x += 57.156235665862923517 / (n + 1);
    x += -59.597960355475491248 / (n + 2);
    x += 14.136097974741747174 / (n + 3);
    x += -0.49191381609762019978 / (n + 4);
    x += 0.33994649984811888699e-4 / (n + 5);
    x += 0.46523628927048575665e-4 / (n + 6);
    x += -0.98374475304879564677e-4 / (n + 7);
    x += 0.15808870322491248884e-3 / (n + 8);
    x += -0.21026444172410488319e-3 / (n + 9);
    x += 0.21743961811521264320e-3 / (n + 10);
    x += -0.16431810653676389022e-3 / (n + 11);
    x += 0.84418223983852743293e-4 / (n + 12);
    x += -0.26190838401581408670e-4 / (n + 13);
    x += 0.36899182659531622704e-5 / (n + 14);
    const t = n + 4.7421875 + 0.5;
    let result = x
        * Math.sqrt(Math.PI * 2)
        * Math.pow(t, n + 0.5)
        * Math.exp(-t);
    return reflected ? Math.PI / (Math.sin(-Math.PI * n) * result) : result;
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
gamma_re.add = (gpu) => {
    factorial.add(gpu)
    gpu.addFunction(gamma_re, { argumentTypes: ['Float'], returnType: 'Float' });
};
export function complex_gamma(z) {
    let reflected = false;
    // if (z[1] === 0)
    //     return [gamma_re(z[0]), 0];
    if (z[0] < 0.5) {
        z = complex_sub([1, 0], z);
        reflected = true;
    }
    z = complex_add(z, [-1, 0]);
    let x = [0.99999999999999709182, 0];
    x = complex_add(x, complex_div([57.156235665862923517, 0], complex_add(z, [1, 0])));
    x = complex_add(x, complex_div([-59.597960355475491248, 0], complex_add(z, [2, 0])));
    x = complex_add(x, complex_div([14.136097974741747174, 0], complex_add(z, [3, 0])));
    x = complex_add(x, complex_div([-0.49191381609762019978, 0], complex_add(z, [4, 0])));
    x = complex_add(x, complex_div([0.33994649984811888699e-4, 0], complex_add(z, [5, 0])));
    x = complex_add(x, complex_div([0.46523628927048575665e-4, 0], complex_add(z, [6, 0])));
    x = complex_add(x, complex_div([-0.98374475304879564677e-4, 0], complex_add(z, [7, 0])));
    x = complex_add(x, complex_div([0.15808870322491248884e-3, 0], complex_add(z, [8, 0])));
    x = complex_add(x, complex_div([-0.21026444172410488319e-3, 0], complex_add(z, [9, 0])));
    x = complex_add(x, complex_div([0.21743961811521264320e-3, 0], complex_add(z, [10, 0])));
    x = complex_add(x, complex_div([-0.16431810653676389022e-3, 0], complex_add(z, [11, 0])));
    x = complex_add(x, complex_div([0.84418223983852743293e-4, 0], complex_add(z, [12, 0])));
    x = complex_add(x, complex_div([-0.26190838401581408670e-4, 0], complex_add(z, [13, 0])));
    x = complex_add(x, complex_div([0.36899182659531622704e-5, 0], complex_add(z, [14, 0])));
    const t = complex_add(z, [4.7421875 + 0.5, 0]);
    let result = complex_div(complex_mult(complex_mult(
        x,
        [Math.sqrt(2 * Math.PI), 0]),
        complex_exp(complex_mult(complex_add(z, [0.5, 0]), complex_log(t)))),
        complex_exp(t),
    );
    return reflected ?
        complex_div(complex_div(
            [Math.PI, 0],
            complex_sin(complex_scale(z, -Math.PI))),
            result
        ) : result;
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_gamma.add = (gpu) => {
    // gamma_re.add(gpu);
    complex_add.add(gpu);
    complex_sub.add(gpu);
    complex_mult.add(gpu);
    complex_div.add(gpu);
    complex_exp.add(gpu);
    complex_log.add(gpu);
    complex_sin.add(gpu);
    gpu.addFunction(complex_gamma, { argumentTypes: ['Array(2)'], returnType: 'Array(2)' });
};
export function complex_zeta(s, prec = 1e-10) {
    const f0 = 0.0;
    if (complex_absSq(s) === f0) return [-0.5, 0];
    let dec = -Math.round(Math.log(prec * 0.1) / Math.LN10)
    let n = Math.min(Math.round(1.3 * dec + 0.9 * Math.abs(s[1])), 60);
    let reflected = false;

    if (s[0] <= 1 && s[0] != 0) {
        reflected = true;
        s = complex_sub([1, 0], s);
    }
    let S = [0, 0];
    for (let k = 1; k <= n; k++) {
        let T = 0.0
        for (let j = k; j <= n; j++) {
            T += (product(n - j + 1, n + j - 1) * Math.pow(4, j) / factorial(2 * j));
        }
        S = complex_add(
            S,
            complex_div([powneg(k - 1) * n * T, 0], complex_exp(complex_scale(s, Math.log(k))))
        )
    }
    let T = 0.0
    for (let j = 0; j <= n; j++) {
        T += (product(n - j + 1, n + j - 1) * Math.pow(4, j) / factorial(2 * j));
    }
    let result = complex_div(
        S,
        complex_scale(
            complex_add(
                complex_exp(complex_scale(complex_sub([1, 0], s), Math.LN2)),
                [-1, 0]),
            -n * T
        ));
    return reflected ? complex_mult(complex_mult(complex_mult(complex_mult(
        complex_exp(complex_scale(complex_sub([1, 0], s), Math.LN2)),
        complex_exp(complex_scale(s, -Math.log(Math.PI)))),
        complex_sin(complex_scale(complex_sub([1, 0], s), Math.PI / 2))),
        complex_gamma(s)),
        result
    ) : result;
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
complex_zeta.add = (gpu) => {
    powneg.add(gpu);
    product.add(gpu);
    factorial.add(gpu);
    complex_absSq.add(gpu);
    complex_add.add(gpu);
    complex_scale.add(gpu);
    complex_sub.add(gpu);
    complex_mult.add(gpu);
    complex_div.add(gpu);
    complex_exp.add(gpu);
    complex_log.add(gpu);
    complex_sin.add(gpu);
    complex_gamma.add(gpu);
    gpu.addFunction(complex_zeta, {
        argumentTypes: { s: 'Array(2)', prec: 'Float' },
        returnType: 'Array(2)'
    }).addFunction(complex_zeta, {
        argumentTypes: { s: 'Array(2)' },
        returnType: 'Array(2)'
    });
};
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
        return Complex.fromPolar(Math.pow(this.r, v), this.theta * v);
    }
    static pow(a, b) {
        if (b instanceof this)
            return this.mult(b, this.log(a)).exp();
        if (a instanceof this)
            return a.pow(b);
        if (typeof a === "number")
            return this.copy(Math.pow(a, b));
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
        return Math.pow(this.r, 2);
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
        return ComplexPolar.fromPolar(Math.pow(this.r, v), this.theta * v);
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
                    + 1 / (12 * Math.pow(n, 1))
                    + 1 / (288 * Math.pow(n, 2))
                    - 139 / (51840 * Math.pow(n, 3))
                    - 571 / (2488320 * Math.pow(n, 4))
                    + 163879 / (209018880 * Math.pow(n, 5))
                    + 5246819 / (75246796800 * Math.pow(n, 6))
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
                Complex.div(Math.pow(-1, k - 1) * d(k), Complex.pow(k, z))
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