export function createAndLinkProgram(gl, vertex_shader, fragment_shader) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vertex_shader);
    gl.attachShader(prog, fragment_shader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn("Failed to link program: " + gl.getProgramInfoLog(prog));
    }
    return prog;
}

export function createShader(gl, shader_type, shader_code) {
    const shader = gl.createShader(shader_type);
    gl.shaderSource(shader, shader_code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const err = gl.getShaderInfoLog(shader);
        console.warn("Failed to compile shader: " + err);
    }
    return shader
}