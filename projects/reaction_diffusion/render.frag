precision highp float;
uniform sampler2D tex;
uniform vec2 u_textureSize;

void main() {
    vec2 conc = texture2D(tex, gl_FragCoord.xy / u_textureSize).xy;
    float v = 1.0 - clamp(conc.x - conc.y, 0.0, 1.0);
    gl_FragColor = vec4(0.0, 0.0, 0.0, v);
}
