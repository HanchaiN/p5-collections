import "p5";
import { getParentSize } from "../utils/utils.js";
const VERTEX_SHADER = await fetch(import.meta.resolve("./shader.vert")).then(r => r.text());
const FRAGMENT_SHADER_P = await fetch(import.meta.resolve("./shader.frag")).then(r => r.text());
const FRAGMENT_SHADER_R = await fetch(import.meta.resolve("./render.frag")).then(r => r.text());
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let worker;
    let isAnimating = false;

    return {
        start: (node) => {
            parent = node;
            isAnimating = true;

            const { width, height } = getParentSize(parent, canvas);
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            parent.appendChild(canvas);
            if (document.createElement("canvas").getContext("webgl")) {
                const gl = canvas.getContext("webgl");
                gl.getExtension("OES_texture_float");

                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

                function createAndLinkProgram(gl, vertex_shader, fragment_shader) {
                    var prog = gl.createProgram();
                    gl.attachShader(prog, vertex_shader);
                    gl.attachShader(prog, fragment_shader);
                    gl.linkProgram(prog);
                    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                        console.warn("Failed to link program: " + gl.getProgramInfoLog(prog));
                    }
                    return prog;
                }

                function createShader(gl, shader_type, shader_code) {
                    const shader = gl.createShader(shader_type);
                    gl.shaderSource(shader, shader_code);
                    gl.compileShader(shader);
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        const err = gl.getShaderInfoLog(shader);
                        console.warn("Failed to compile shader: " + err);
                    }
                    return shader
                }

                const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
                const fragmentShader_p = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_P);
                const fragmentShader_r = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_R);
                const processor = createAndLinkProgram(gl, vertexShader, fragmentShader_p);
                const renderer = createAndLinkProgram(gl, vertexShader, fragmentShader_r);

                const VERTICES = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]);
                const vertexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

                const aPosition_p = gl.getAttribLocation(processor, "a_position");
                gl.vertexAttribPointer(aPosition_p, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aPosition_p);
                const aPosition_r = gl.getAttribLocation(renderer, "a_position");
                gl.vertexAttribPointer(aPosition_r, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(aPosition_r);

                const init = new Float32Array(new Array(canvas.width * canvas.height * 4)).map((_, i) => [1, 0, 0, 1][i % 4]);
                {
                    const s = 10;
                    const d = 1;
                    for (let i = -s; i < s; i++) {
                        for (let j = -s; j < s; j++) {
                            if (Math.pow(Math.abs(i), d) + Math.pow(Math.abs(j), d) < Math.pow(Math.abs(s), d)) {
                                init[
                                    (j + Math.round(canvas.height / 2)) * (canvas.width * 4)
                                    + (i + Math.round(canvas.width / 2)) * 4
                                    + 1
                                ] = 1;
                            }
                        }
                    }
                }
                const texture_framebuffer = [init, null].map((init) => {
                    const texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.FLOAT, init);
                    const framebuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                    return { texture, framebuffer };
                });
                let iter = 0;
                function draw() {
                    if (!isAnimating) return;
                    gl.clearColor(1.0, 1.0, 1.0, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    const subdiv = 50;
                    const dt = 50;
                    for (let i = 0; i < subdiv; i++) {
                        gl.useProgram(processor);
                        gl.bindTexture(gl.TEXTURE_2D, texture_framebuffer[iter % texture_framebuffer.length].texture);
                        gl.uniform2f(gl.getUniformLocation(processor, "u_textureSize"), canvas.width, canvas.height);
                        gl.uniform1f(gl.getUniformLocation(processor, "dt"), dt * 1 / subdiv);
                        gl.uniform2f(gl.getUniformLocation(processor, "u_diffuseRate"), 1.0, 0.5);
                        gl.uniform1f(gl.getUniformLocation(processor, "u_adder"), .04);
                        gl.uniform1f(gl.getUniformLocation(processor, "u_remover"), .06);
                        iter++;
                        gl.bindFramebuffer(gl.FRAMEBUFFER, texture_framebuffer[iter % texture_framebuffer.length].framebuffer);
                        gl.viewport(0, 0, canvas.width, canvas.height);
                        gl.drawArrays(gl.TRIANGLES, 0, 6);
                    }

                    gl.useProgram(renderer);
                    gl.bindTexture(gl.TEXTURE_2D, texture_framebuffer[iter % texture_framebuffer.length].texture);
                    gl.uniform2f(gl.getUniformLocation(renderer, "u_textureSize"), canvas.width, canvas.height)
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                    requestAnimationFrame(draw);
                }
                requestAnimationFrame(draw);
            } else {
                const ctx = canvas.getContext("2d");
                worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
                function draw() {
                    if (!isAnimating) return;
                    worker?.postMessage?.({ dt: 1 });
                }
                worker.addEventListener("message", (e) => {
                    const buffer = e.data.buffer;
                    const image = new ImageData(buffer, ctx.canvas.width, ctx.canvas.height);
                    ctx.putImageData(image, 0, 0);
                    requestAnimationFrame(draw);
                });
                worker.postMessage({ size: { width: ctx.canvas.width, height: ctx.canvas.height } });
                requestAnimationFrame(draw);
            }
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            worker?.terminate();
            isAnimating = false;
            parent = canvas = resizeObserver = null;
        },
    };
}
