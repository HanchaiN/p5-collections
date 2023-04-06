precision highp float;
uniform sampler2D tex;
uniform vec2 u_textureSize;
uniform float dt;
uniform vec2 u_diffuseRate;
uniform float u_adder;
uniform float u_remover;

void main() {
    vec2 conc = texture2D(tex, gl_FragCoord.xy / u_textureSize).xy;
    vec2 rxn = vec2(
        - conc.x * conc.y * conc.y + u_adder * (1.0 - conc.x),
        + conc.x * conc.y * conc.y - (u_adder + u_remover) * conc.y
    );
    vec2 div_grad =
        - 1.00 * texture2D(tex, (gl_FragCoord.xy + vec2(+0.0, +0.0)) / u_textureSize).xy
        + 0.20 * texture2D(tex, (gl_FragCoord.xy + vec2(-1.0, +0.0)) / u_textureSize).xy
        + 0.20 * texture2D(tex, (gl_FragCoord.xy + vec2(+1.0, +0.0)) / u_textureSize).xy
        + 0.20 * texture2D(tex, (gl_FragCoord.xy + vec2(+0.0, +1.0)) / u_textureSize).xy
        + 0.20 * texture2D(tex, (gl_FragCoord.xy + vec2(+0.0, -1.0)) / u_textureSize).xy
        + 0.05 * texture2D(tex, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_textureSize).xy
        + 0.05 * texture2D(tex, (gl_FragCoord.xy + vec2(+1.0, -1.0)) / u_textureSize).xy
        + 0.05 * texture2D(tex, (gl_FragCoord.xy + vec2(+1.0, +1.0)) / u_textureSize).xy
        + 0.05 * texture2D(tex, (gl_FragCoord.xy + vec2(-1.0, +1.0)) / u_textureSize).xy;
    gl_FragColor = vec4(clamp(conc + dt * (u_diffuseRate * div_grad + rxn), 0.0, 1.0), 0.0, 0.0);
}