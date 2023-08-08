precision highp float;
uniform vec3 white;
uniform vec3 bright;
uniform sampler2D tex;
uniform vec2 textureSize;

vec3 toRGB(in vec3 c) {
    return vec3(
        (c.y + c.z) / 2.0,
        (c.x + c.y) / 2.0,
        (0.0 + c.y) / 2.0
    );
}

vec3 whitebalance(in vec3 c, in vec3 w) {
    const mat3 rgb2xyz = mat3(
        0.49000, 0.31000, 0.20000,
        0.19697, 0.81240, 0.01063,
        0.00000, 0.01000, 0.99000
    );
    const mat3 xyz2rgb = mat3(
        +8041697.0, -3049000.0, -1591847.0,
        -1752003.0, +4851000.0, +301853.0,
        +17697.0, -49000.0, +3432153.0
    ) / 3400850.0;
    const vec3 d65 = vec3(0.95047, 1.00, 1.088883);
    return c * rgb2xyz * d65 / (w * rgb2xyz) * xyz2rgb;
}
float luminance(in vec3 c) {
    return dot(c, vec3(0.229, 0.587, 0.114));
}
vec3 tonemapper (in vec3 c, in vec3 b)
{
    float lc = luminance(c);
    float lb = luminance(b);
    vec3 l = c * (1.0 + lc / (lb * lb)) / (1.0 + lc);
    vec3 h = c * (1.0 + c / (b * b)) / (1.0 + c);
    return mix(l, h, clamp(l, 0.0, 1.0));
}
vec3 linear2sRGB(vec3 linearRGB)
{
    vec3 cutoff = vec3(lessThan(linearRGB, vec3(0.0031308)));
    vec3 lower = linearRGB * vec3(12.92);
    vec3 higher = vec3(1.055)*pow(linearRGB, vec3(1.0/2.4)) - vec3(0.055);

    return mix(higher, lower, cutoff);
}

void main() {
    vec3 color = toRGB(texture2D(tex, gl_FragCoord.xy / textureSize).xyz);
    color = linear2sRGB(
        clamp(
            tonemapper(
                whitebalance(color, white),
                whitebalance(bright, white)
            ),
            0.0, 1.0
        )
    );
    gl_FragColor = vec4(color, 1.0);
}