import { getParentSize } from "../utils/dom.js";
import { fract, map, pow } from "../utils/math.js";
import { createAndLinkProgram, createShader, supportWebGL } from "../utils/webgl.js";
import { RADIUS_REDUCED } from "./psi.js";

const VERTEX_SHADER = await fetch(import.meta.resolve("./shader.vert")).then(r => r.text());
const FRAGMENT_SHADER = await fetch(import.meta.resolve("./shader.frag")).then(r => r.text());

export default function execute() {
    let parent = null;
    let canvas = null;
    let foreground = null;
    let resizeObserver = null;
    let isActive = false;
    const state = { n: 3, l: 2, m: -1 };
    const n_max = state.n + 2;
    const T = 20_000;

    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        foreground.width = canvas.width = width;
        foreground.height = canvas.height = height;
        const scale = pow(n_max, 2) * RADIUS_REDUCED / width;
        const background_draw = supportWebGL ? draw_webgl(width, height, scale) : draw_worker(width, height, scale);
        requestAnimationFrame(function draw(t) {
            foreground_draw(width, height, scale, t);
            background_draw(t);
            if (!isActive || canvas.width !== width || canvas.height !== height) return;
            requestAnimationFrame(draw);
        });
    }

    function foreground_draw(width, height, scale, t) {
        if (!isActive || canvas.width !== width || canvas.height !== height) return;
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
    }
    function draw_webgl(width, height, scale) {
        const gl = canvas.getContext("webgl");
        gl.getExtension("OES_texture_float");

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

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
        return function draw(t) {
            if (!isActive || canvas.width !== width || canvas.height !== height) return;
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
        }
    }
    function draw_worker(width, height, scale) {
        const worker = new Worker(import.meta.resolve("./worker.js"), { type: "module" });
        worker.postMessage({ width, height, state, scale });
        return async function draw(t) {
            if (!isActive || canvas.width !== width || canvas.height !== height) {
                worker.terminate();
                return;
            }
            const result = await new Promise(resolve => {
                worker.postMessage({ render: true, z_depth: width * scale * map(fract(t / T), 0, 1, -1, +1) });
                function listener(e) {
                    worker.removeEventListener("message", listener);
                    if (!e.data.buffer) return;
                    resolve(new ImageData(e.data.buffer, width, height));
                }
                worker.addEventListener("message", listener);
            });
            const ctx = canvas.getContext("2d", { alpha: false });
            ctx.putImageData(result, 0, 0);
        }
    }

    return {
        start: (node) => {
            parent = node;
            isActive = true;
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            canvas = document.createElement("canvas");
            foreground = document.createElement("canvas");
            parent.append(foreground, canvas);
            foreground.style.position = "absolute";
            canvas.style.position = "absolute";
            foreground.style.zIndex = -1;
            canvas.style.zIndex = -2;
        },
        stop: () => {
            canvas?.remove();
            foreground?.remove();
            resizeObserver?.disconnect();
            isActive = false;
            parent = canvas = foreground = resizeObserver = null;
        },
    };
}
