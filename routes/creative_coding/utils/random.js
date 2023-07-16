
export function randomGaussian(mu = 0, sigma = 1) {
    const U1 = Math.random(),
        U2 = Math.random();
    const Z0 = Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * Math.PI * U2),
        Z1 = Math.sqrt(-2 * Math.log(U1)) * Math.sin(2 * Math.PI * U2);
    return Z0 * sigma + mu
}
export function randomChi(k = 1) {
    return Math.sqrt(new Array(Math.ceil(k)).fill(0).map(_ => Math.pow(randomGaussian(0, 1), 2)).reduce((acc, cur) => acc + cur, 0));
}