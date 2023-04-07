#define PI 3.1415926
precision highp float;
varying vec2 texCoords;
uniform vec2 u_size;
uniform float z;
uniform int n;
uniform int l;
uniform int m;
const int n_max = 100;
const float Z = 1.0;
const float R = 1.0;

float atan2(in float y, in float x) {
    float s = float(abs(x) > abs(y));
    return mix(PI/2.0 - atan(x,y), atan(y,x), s);
}
float powneg(in int n) {
    return mix(+1.0, -1.0, mod(float(n), 2.0));
}
float product(in float from, in float to) {
    float curr = from;
    float acc = 1.0;
    for(int i = 0; i < n_max; i++) {
        if(curr > to) break;
        acc *= curr;
        curr += 1.0;
    }
    return acc;
}
float factorial(in int n) {
    return product(1.0, float(n));
}
float permutation(in float a, in int k) {
    return product(a - float(k) + 1.0, a);
}
float combination(in float a, in int k) {
    return permutation(a, k) / factorial(k);
}

float laguerre(in int n, in int k, in float x) {
    float y = 0.0;
    for(int i = 0; i < n_max; i++) {
        y *= x;
        y += powneg(n-i) * combination(float(n+k), i) / factorial(n-i);
        if(i == n) break;
    }
    return y;
}
float legendre(in int m, in int l, in float x) {
    if (abs(float(m)) > float(l)) return 0.0;
    if (l < 0) l = - l - 1;
    float c = 1.0;
    if (m < 0) {
        c *= powneg(m) * product(float(l - m + 1), float(l + m));
        m *= -1;
    }
    c *= powneg(m) * pow(2.0, float(l));
    float y = 0.0;
    for(int i = 0; i < n_max; i++) {
        y *= x;
        y += combination(float(l), l - i) * combination(float(2 * l - i - 1) / 2.0, l) * permutation(float(l - i), m);
        if(i == l - m) break;
    }
    return c * y * pow(1.0 - x * x, float(m) / 2.0);
}
vec2 sph_harm(in int m, in int l, in float theta, in float phi) {
    vec2 c = vec2(1.0);
    if(m < 0) {
        c *= powneg(m) * vec2(1.0, -1.0);
        m *= -1;
    }
    c *= powneg(m) * sqrt(float(2 * l + 1) / (4.0 * PI * product(float(l - m + 1), float(l + m))));
    return c * vec2(cos(float(m) * phi), sin(float(m) * phi)) * legendre(m, l, cos(theta));
}
vec2 psi(in int n, in int l, in int m, in float r, in float theta, in float phi) {
    float c_r = 2.0 * Z / (float(n) * R);
    float rho = c_r * r;
    float radial = -sqrt(pow(c_r, 3.0) / (2.0 * float(n) * product(float(n-l), float(n+l)))) * exp(- rho / 2.0) * pow(rho, float(l)) * laguerre(n - l - 1, 2 * l + 1, rho);
    vec2 angular = sph_harm(m, l, theta, phi);
    return radial * angular;
}

vec3 lch2rgb(in vec3 lch) {
    lch.x *= 100.0;
    lch.y *= 100.0;
    const float CBRT_EPSILON = 6.0 / 29.0;
    const float KAPPA = 24389.0 / 27.0;
    const mat3 xyz2rgb = mat3(
        +8041697.0, -3049000.0, -1591847.0,
        -1752003.0, +4851000.0, +301853.0,
        +17697.0, -49000.0, +3432153.0
    ) / 3400850.0;

    vec3 lab = vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));

    float fy = (lab.x + 16.0) / 116.0;
    float fx = (lab.y / 500.0) + fy;
    float fz = fy - (lab.z / 200.0);

    vec3 xyz = vec3(
        mix((116.0*fx - 16.0) / KAPPA, fx*fx*fx, float(fx > CBRT_EPSILON)) * 0.9504492182750991,
        mix(lab.x / KAPPA, fy*fy*fy, float(lab.x > 8.0)),
        mix((116.0*fz - 16.0) / KAPPA, fz*fz*fz, float(fz > CBRT_EPSILON)) * 1.0889166484304715
    );

    vec3 rgb = xyz * xyz2rgb;

    return mix(vec3(1.055)*pow(rgb, vec3(1.0/2.4)) - vec3(0.055), rgb * vec3(12.92), vec3(lessThan(rgb, vec3(0.0031308))));
}

void main() {
    vec3 pos = vec3(2.0 * (texCoords.xy - 0.5) * u_size, z);
    float r = length(pos);
    float theta = r == 0.0 ? 0.0 : acos(pos.z / r);
    float phi = atan2(pos.y, pos.x);
    vec2 psi_ = psi(n, l, m, r, theta, phi);
    float prob = 1000.0 * pow(length(psi_), 2.0);
    float phase = atan2(psi_.y, psi_.x);
    float v = clamp(pow(prob / (prob + 1.0), 0.5), 0.0, 1.0);
    gl_FragColor = vec4(lch2rgb(vec3(
        v,
        v,
        phase
    )), 1.0);
}