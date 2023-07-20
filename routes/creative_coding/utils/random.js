/// <reference path="../utils/types/gpu.d.ts" />
import { lerp } from './math.js';
export function randomUniform(l = 0, h = 1) {
    return lerp(Math.random(), l, h);
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
randomUniform.add = (gpu) => {
    lerp.add(gpu);
    gpu.addFunction(randomUniform, { argumentTypes: ['Float', 'Float'], returnType: 'Float' });
};
export function randomGaussian(mu = 0, sigma = 1) {
    const U1 = Math.random(),
        U2 = Math.random();
    const Z0 = Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * Math.PI * U2),
        Z1 = Math.sqrt(-2 * Math.log(U1)) * Math.sin(2 * Math.PI * U2);
    return Z0 * sigma + mu
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
randomGaussian.add = (gpu) => {
    gpu.addFunction(randomGaussian, { argumentTypes: ['Float', 'Float'], returnType: 'Float' });
};
export function randomChi(alpha = 1) {
    if (alpha < 1.0)
        return 0.0;
    // if (!Number.isInteger(alpha)) {
    const beta = Math.sqrt(alpha - 1);
    const vp = Math.exp(-1 / 2) * (Math.SQRT1_2 + beta) / (.5 + beta);
    const vn = Math.max(-beta, -Math.exp(-1 / 2) * (1 - .25 / alpha));
    for (let _ = 0; _ < 1000; _++) {
        const u = randomUniform(0, 1),
            v = randomUniform(vn, vp);
        const z = v / u;
        if (z < -beta)
            continue;
        const r = 2.5 - z * z;
        if (z < 0)
            r += (z * z * z / 3) * (z + beta);
        if (u < r / (2 * Math.exp(1 / 4)))
            return z + beta;
        if (z * z > 4 * Math.exp(1.35) / u + 1.4)
            continue;
        const h = Math.pow(1 + z / beta, beta * beta) * Math.exp(-z * z / 2 - z * beta);
        if (-2 * Math.log(u) < Math.log(h))
            return z + beta;
    }
    // }
    let acc = 0.0;
    for (let _ = 0; _ < Math.ceil(alpha); _++)
        acc += Math.pow(randomGaussian(0, 1), 2);
    return Math.sqrt(acc);
}
/**
 * @param {GPU.GPU | GPU.Kernel} gpu 
 */
randomChi.add = (gpu) => {
    randomUniform.add(gpu);
    randomGaussian.add(gpu);
    gpu.addFunction(randomChi, { argumentTypes: ['Float'], returnType: 'Float' });
};