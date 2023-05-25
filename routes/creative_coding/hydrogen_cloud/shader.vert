attribute vec2 a_position;
varying vec2 texCoords;

void main() {
    texCoords = (a_position + 1.0) / 2.0;
    gl_Position = vec4(a_position, 0.0, 1.0);
}