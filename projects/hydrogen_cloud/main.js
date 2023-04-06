import { RADIUS_REDUCED } from "./psi.js";
import { getParentSize } from "../utils/utils.js";
import { fract, map, pow } from "../utils/math.js";

const VERTEX_SHADER = await fetch(import.meta.resolve("./shader.vert")).then(r => r.text());
const FRAGMENT_SHADER = await fetch(import.meta.resolve("./shader.frag")).then(r => r.text());

export default function execute() {
    let parent = null;
    let canvas = null;
    let foreground = null;
    let resizeObserver = null;
    let worker;
    let isAnimating = false;
    const state = { n: 3, l: 2, m: -1 };
    const n_max = state.n + 2;
    let draw_gen = (width, height, scale) => (t) => { };
    let draw_gen_ = (width, height, scale) => {
        function draw(t) {
            if (!isAnimating || foreground.width !== width || foreground.height !== height) return;
            const ctx = foreground.getContext("2d");
            ctx.clearRect(0, 0, width, height)
            const z = width * scale * map(fract(t / T), 0, 1, -1, +1);
            for (let i = 0; i <= pow(n_max, 2); i++) {
                if (Number.isInteger(Math.sqrt(i)))
                    ctx.strokeStyle = "#00F";
                else
                    ctx.strokeStyle = "#0FF";
                ctx.beginPath();
                ctx.arc(
                    width / 2, height / 2,
                    Math.sqrt(Math.max(pow(i, 2) - pow(z, 2), 0)) / (2 * scale),
                    0, 2 * Math.PI,
                )
                ctx.stroke();
            }
            requestAnimationFrame(draw);
        }
        return draw;
    };
    const T = 20_000;

    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        foreground.width = canvas.width = width;
        foreground.height = canvas.height = height;
        requestAnimationFrame(draw_gen(width, height, pow(n_max, 2) * RADIUS_REDUCED / width));
        const d = draw_gen_(width, height, pow(n_max, 2) * RADIUS_REDUCED / width);
        requestAnimationFrame(d);
    }

    return {
        start: (node) => {
            parent = node;
            isAnimating = true;
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            canvas = document.createElement("canvas");
            foreground = document.createElement("canvas");
            const { width, height } = getParentSize(parent, canvas);
            foreground.width = canvas.width = width;
            foreground.height = canvas.height = height;
            foreground.style.position = "absolute";
            parent.append(foreground, canvas);
            if (document.createElement("canvas").getContext("webgl")) {
                draw_gen = function (width, height, scale) {
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
                    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
                    const renderer = createAndLinkProgram(gl, vertexShader, fragmentShader);

                    const VERTICES = new Float32Array([-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1]);
                    const vertexBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);

                    const aPosition = gl.getAttribLocation(renderer, "a_position");
                    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(aPosition);
                    function draw(t) {
                        if (!isAnimating || gl.canvas.width !== width || gl.canvas.height !== height) return;
                        gl.clearColor(1.0, 1.0, 1.0, 1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT);

                        gl.useProgram(renderer);
                        gl.uniform2f(gl.getUniformLocation(renderer, "u_size"), scale * width, scale * height);
                        gl.uniform1i(gl.getUniformLocation(renderer, "n"), state.n);
                        gl.uniform1i(gl.getUniformLocation(renderer, "l"), state.l);
                        gl.uniform1i(gl.getUniformLocation(renderer, "m"), state.m);
                        gl.uniform1f(gl.getUniformLocation(renderer, "z"), width * scale * map(fract(t / T), 0, 1, -1, +1));
                        gl.viewport(0, 0, width, height);
                        gl.drawArrays(gl.TRIANGLES, 0, 6);
                        requestAnimationFrame(draw);
                    }
                    return draw;
                }
            } else {
                draw_gen = function draw(width, height, scale) {
                    worker?.terminate();
                    worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
                    function draw(t) {
                        if (!isAnimating) return;
                        worker?.postMessage?.({ render: true, z_depth: width * scale * map(fract(t / T), 0, 1, -1, +1) });
                    }
                    worker.addEventListener("message", (e) => {
                        if (!e.data.buffer) return;
                        const width = canvas?.width, height = canvas?.height;
                        if (isAnimating && e.data.width === width && e.data.height === height) {
                            requestAnimationFrame(draw);
                            const ctx = canvas.getContext("2d", { alpha: false });
                            const image = new ImageData(e.data.buffer, width, height);
                            ctx.putImageData(image, 0, 0);
                        } else {
                            worker?.terminate();
                        }
                    });
                    worker.postMessage({ width, height, state, scale });
                    return draw;
                }
            }
            requestAnimationFrame(draw_gen(width, height, pow(n_max, 2) * RADIUS_REDUCED / width));
            requestAnimationFrame(draw_gen_(width, height, pow(n_max, 2) * RADIUS_REDUCED / width));
        },
        stop: () => {
            canvas?.remove();
            foreground?.remove();
            resizeObserver?.disconnect();
            isAnimating = false;
            worker = parent = canvas = foreground = resizeObserver = null;
        },
    };
}
