export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;
    let workers = [], white_calc = null;
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
            white_calc = new Worker(import.meta.resolve("./worker_white.js"), { type: "module" });
            white_calc.postMessage(null);
            white_calc.addEventListener("message", function (e) {
                white_calc.postMessage(null);
                color.white = e.data.white;
                color.bright = e.data.bright;
            });
            if (document.createElement("canvas").getContext("webgl") && 'transferControlToOffscreen' in canvas) {
                const worker = new Worker(import.meta.resolve("./worker_shader.js"), { type: "module" });
                const offscreen = canvas.transferControlToOffscreen();
                function draw() {
                    worker?.postMessage({
                        render: true,
                        color,
                    });
                }
                worker.postMessage({
                    canvas: offscreen,
                }, [offscreen]);
                worker.addEventListener("message", function handler(e) {
                    if (e.data.canvas) {
                        worker.removeEventListener("message", handler);
                        requestAnimationFrame(draw);
                        worker.addEventListener("message", (e) => {
                            if (isAnimating) {
                                requestAnimationFrame(draw);
                            }
                        });
                    }
                })
                workers.push(worker);
            } else {
                const ctx = canvas.getContext("2d");
                const maxWorkers = window.navigator.hardwareConcurrency || 4;
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
                    for (let j = 0; j < subdivide[1]; j++)
                        workers[i * subdivide[1] + j].postMessage({
                            size: {
                                width: Math.ceil(ctx.canvas.width / subdivide[0]),
                                height: Math.ceil(ctx.canvas.height / subdivide[1]),
                                dx: Math.floor(i * ctx.canvas.width / subdivide[0]),
                                dy: Math.floor(j * ctx.canvas.height / subdivide[1]),
                                sx: ctx.canvas.width,
                                sy: ctx.canvas.width,
                            },
                        });
            }
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            workers.forEach(worker => {
                worker.terminate();
            });
            white_calc?.terminate();
            isAnimating = false;
            workers = [];
            white_calc = parent = canvas = resizeObserver = null;
        },
    };
}
