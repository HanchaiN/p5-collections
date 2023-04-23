import { maxWorkers } from "../utils/dom.js";
import { createAndLinkProgram, createShader } from "../utils/webgl.js";
const VERTEX_SHADER = await fetch(import.meta.resolve("./shader.vert")).then(r => r.text());
const FRAGMENT_SHADER_R = await fetch(import.meta.resolve("./shader.frag")).then(r => r.text());
const FRAGMENT_SHADER_P = await fetch(import.meta.resolve("./postprocessing.frag")).then(r => r.text());
export default function execute() {
    let parent = null;
    let canvas = null;
    let workers = [];
    const size = [512, 512];
    const color = {
        white: { r: 1, g: 1, b: 1 },
        bright: { r: 1, g: 1, b: 1 },
    };
    let isAnimating = false;

    return {
        start: (node) => {
            isAnimating = true;
            parent = node;
            canvas = document.createElement("canvas");
            canvas.width = size[0];
            canvas.height = size[1];
            parent.appendChild(canvas);
            parent.style.display = "flex";
            parent.style.justifyContent = "center";
            parent.style.alignItems = "center";
            const white_calc = new Worker(import.meta.resolve("./worker_white.js"), { type: "module" });
            white_calc.postMessage(null);
            white_calc.addEventListener("message", function (e) {
                white_calc.postMessage(null);
                // color.white = e.data.white;
                color.bright = e.data.bright;
            });
            workers.push(white_calc)
            if (document.createElement("canvas").getContext("webgl")) {
                const gl = canvas.getContext("webgl");
                gl.getExtension("OES_texture_float");

                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

                const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
                const fragmentShader_r = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_R);
                const fragmentShader_p = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_P);
                const renderer = createAndLinkProgram(gl, vertexShader, fragmentShader_r);
                const processor = createAndLinkProgram(gl, vertexShader, fragmentShader_p);

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

                const init = new Float32Array(new Array(canvas.width * canvas.height * 4)).map((_, i) => [0, 0, 0, 1][i % 4]);
                const texture_framebuffer = [init, init].map((init) => {
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
                    gl.useProgram(renderer);
                    gl.bindTexture(gl.TEXTURE_2D, texture_framebuffer[iter % texture_framebuffer.length].texture);
                    gl.uniform2f(gl.getUniformLocation(renderer, "textureSize"), canvas.width, canvas.height);
                    gl.uniform1i(gl.getUniformLocation(renderer, "frameCount"), iter);
                    gl.uniform1f(gl.getUniformLocation(renderer, "u_seed"), Math.random());
                    iter++;
                    gl.bindFramebuffer(gl.FRAMEBUFFER, texture_framebuffer[iter % texture_framebuffer.length].framebuffer);
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);

                    gl.useProgram(processor);
                    gl.bindTexture(gl.TEXTURE_2D, texture_framebuffer[iter % texture_framebuffer.length].texture);
                    gl.uniform2f(gl.getUniformLocation(processor, "textureSize"), canvas.width, canvas.height);
                    gl.uniform3f(gl.getUniformLocation(processor, "white"), color.white.r, color.white.g, color.white.b);
                    gl.uniform3f(gl.getUniformLocation(processor, "bright"), color.bright.r, color.bright.g, color.bright.b);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                    requestAnimationFrame(draw);
                }
                requestAnimationFrame(draw);
            } else {
                const ctx = canvas.getContext("2d", { alpha: false });
                const aspect = size[1] / size[0];
                const subdivide = [
                    Math.floor(Math.sqrt(maxWorkers / aspect)),
                    Math.floor(Math.sqrt(maxWorkers / aspect) * aspect),
                ];
                workers = new Array(subdivide[0] * subdivide[1]).fill(0).map(_ =>
                    new Worker(import.meta.resolve("./worker_render.js"), { type: "module" })
                );
                workers.forEach(worker => {
                    worker.addEventListener("message", function draw(e) {
                        if (isAnimating)
                            worker.postMessage({
                                render: true,
                                color,
                            });
                        const { buffer, size } = e.data;
                        const image = new ImageData(buffer, size.w, size.h);
                        ctx.putImageData(image, size.dx, size.dy);
                    });
                });
                for (let i = 0; i < subdivide[0]; i++)
                    for (let j = 0; j < subdivide[1]; j++) {
                        const worker = new Worker(import.meta.resolve("./worker_render.js"), { type: "module" });
                        worker.addEventListener("message", function draw(e) {
                            if (isAnimating)
                                worker.postMessage({
                                    render: true,
                                    color,
                                });
                            const { buffer, size } = e.data;
                            const image = new ImageData(buffer, size.w, size.h);
                            ctx.putImageData(image, size.dx, size.dy);
                        });
                        worker.postMessage({
                            size: {
                                width: Math.ceil(canvas.width / subdivide[0]),
                                height: Math.ceil(canvas.height / subdivide[1]),
                                dx: Math.floor(i * canvas.width / subdivide[0]),
                                dy: Math.floor(j * canvas.height / subdivide[1]),
                                sx: canvas.width,
                                sy: canvas.height,
                            },
                        });
                        workers.push(worker);
                    }
            }
        },
        stop: () => {
            canvas?.remove();
            workers.forEach(worker => {
                worker.terminate();
            });
            isAnimating = false;
            workers = [];
            parent = canvas = null;
        },
    };
}
