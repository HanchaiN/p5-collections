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
    return function (x) {
        let y = 0;
        for (let m = 0; m <= n; m += 1) {
            y +=
                (math.pow(x, m) * math.pow(-1, m) * combination(n + k, n - m)) /
                factorial(m);
        }
        return y;
    };
}
function legendre(m, l) {
    if (math.abs(m) > l) {
        return function (x) {
            return 0;
        };
    }
    if (l < 0) {
        return legendre(m, -l - 1);
    }
    if (m < 0) {
        let legendre_ = legendre(-m, l);
        return function (x) {
            return (
                (legendre_(x) * math.pow(-1, -m) * factorial(l + m)) / factorial(l - m)
            );
        };
    }
    return function (x) {
        let y = 0;
        for (let i = m; i <= l; i += 1) {
            y +=
                math.pow(x, i - m) *
                combination(l, i) *
                combination((l + i - 1) / 2, l) *
                permutation(i, m);
        }
        y *= math.pow(2, l) * math.pow(-1, m) * math.pow(1 - math.square(x), m / 2);
        return y;
    };
}
function sph_harm(m, l) {
    if (m < 0) {
        let sph_harm_ = sph_harm(-m, l);
        return function (theta, phi) {
            return math.multiply(math.pow(-1, -m), sph_harm_(theta, phi)).conjugate();
        }
    }
    let k =
        (math.pow(-1, m) *
            math.sqrt((2 * l + 1) / (4 * math.PI)) *
            factorial(l - m)) /
        factorial(l + m);
    let legendre_ = legendre(m, l);
    return function (theta, phi) {
        return math.multiply(
            k * legendre_(math.cos(theta)),
            math.exp(math.complex(0, m * phi))
        );
    };
}
function wave_function(n, l, m) {
    let a0 = 1;
    let k = math.sqrt(
        (math.pow(2 / (n * a0), 3) * factorial(n - l - 1)) /
        (2 * n * factorial(n + l))
    );
    let laguerre_ = laguerre(n - l - 1, 2 * l + 1);
    let sph_harm_ = sph_harm(m, l);
    return function (r, theta, phi) {
        let rho = (2 * r) / (n * a0);
        return math.multiply(
            math.exp(-rho / 2) * math.pow(rho, l) * laguerre_(rho),
            sph_harm_(theta, phi)
        );
    };
}
