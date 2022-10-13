export const a_red = 1;
export const mass_red = 9.109e-31;
export const hbar = 1.054e-34;

function factorial(a) {
    return math.gamma(a + 1);
}
function permutation(a, k) {
    return factorial(a) / factorial(a - k);
}
function combination(a, k) {
    return permutation(a, k) / factorial(k);
}
function laguerre(n, k) {
    const coeff = new Array(n + 1).fill(0).map((_, i) => math.pow(-1, i) * combination(n + k, n - i) / factorial(i));
    return (x) => {
        return coeff.reduceRight((prev, curr) => prev * x + curr, 0);
    };
}
function legendre(m, l) {
    if (math.abs(m) > l) {
        return (x) => {
            return 0;
        };
    }
    if (l < 0) {
        return legendre(m, -l - 1);
    }
    if (m < 0) {
        const legendre_ = legendre(-m, l);
        const factor = math.pow(-1, -m) * factorial(l + m) / factorial(l - m);
        return (x) => {
            return legendre_(x) * factor;
        };
    }
    const coeff = new Array(l - m + 1).fill(0).map((_, ind) => combination(l, ind + m) * combination((l + ind + m - 1) / 2, l) * permutation(ind + m, m));
    const factor = math.pow(2, l) * math.pow(-1, m);
    return (x) => {
        return coeff.reduceRight((prev, curr) => prev * x + curr, 0) * factor * math.pow(1 - math.square(x), m / 2);
    };
}
function sph_harm(m, l) {
    if (m < 0) {
        const sph_harm_ = sph_harm(-m, l);
        const factor = math.pow(-1, -m);
        return (theta, phi) => {
            return math.multiply(factor, sph_harm_(theta, phi)).conjugate();
        }
    }
    const legendre_ = legendre(m, l);
    const factor = math.pow(-1, m) * math.sqrt(((2 * l + 1) / (4 * math.PI)) * (factorial(l - m) / factorial(l + m)));
    return (theta, phi) => {
        return math.multiply(
            factor * legendre_(math.cos(theta)),
            math.exp(math.complex(0, m * phi))
        );
    };
}
export function superposition(states_) {
    const states = states_;
    {
        const mag = math.sqrt(states.reduce((mag, state) => mag + math.square(math.abs(state.coeff)), 0));
        if (mag !== 0)
            states.forEach((state) => { state.coeff = math.divide(state.coeff, mag) });
    }
    return (...args) => states.reduce((prev, { coeff, psi }) => math.add(prev, math.multiply(coeff, psi(...args))), math.complex(0, 0));
}
export function wave_function(n, l, m) {
    const Z = 1;
    const factor = - math.sqrt(
        ((2 * Z / (n * a_red)) ** 3 * factorial(n - l - 1)) /
        (2 * n * factorial(n + l))
    );
    const laguerre_ = laguerre(n - l - 1, 2 * l + 1);
    const sph_harm_ = sph_harm(m, l);
    const factor_t = (- (Z ** 2 * hbar ** 2) / (2 * mass_red * a_red ** 2) * (1 / n ** 2)) / hbar;
    const factor_r = (2 * Z) / (n * a_red);
    return (r, theta, phi, time = 0) => {
        const rho = factor_r * r;
        return math.multiply(
            math.multiply(
                factor * math.exp(-rho / 2) * math.pow(rho, l) * laguerre_(rho),
                sph_harm_(theta, phi)
            ),
            math.exp(math.complex(0, - factor_t * time))
        );
    };
}
export function wave_function_r(n, l, m) {
    if (m === 0)
        return wave_function(n, l, m);
    if (m > 0) {
        return superposition([
            { coeff: math.complex(1, 0), psi: wave_function(n, l, -m) },
            { coeff: math.complex(math.pow(-1, m), 0), psi: wave_function(n, l, +m) },
        ]);
    }
    if (m < 0) {
        return superposition([
            { coeff: math.complex(1, 0), psi: wave_function(n, l, -m) },
            { coeff: math.complex(math.pow(-1, m), 0), psi: wave_function(n, l, +m) },
        ]);
    }
}