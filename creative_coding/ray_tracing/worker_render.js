import { Light } from "./colors.js";
import { Ray, trace } from "./ray.js";
import { Vector } from "../utils/math.js";
import { SCENE, FRAME_SIZE, FOCAL_LENGTH, CAMERA_POSITION } from "./scene.js";
import { postProcessorGen, reinhard_jodie_lum_ext as tonemaper } from "./postprocessor.js";
const postProcessorGen_ = postProcessorGen(
    tonemaper
);
let array = null,
    buffer = null,
    size = {},
    iter = 0,
    postProcessor = postProcessorGen_();
self.addEventListener("message", function (e) {
    if (e.data?.color) postProcessor = postProcessorGen_(e.data.color);
    if (e.data?.size) {
        size.w = e.data.size.width;
        size.h = e.data.size.height;
        size.dx = e.data.size.dx ?? 0;
        size.dy = e.data.size.dy ?? 0;
        size.sx = e.data.size.sx ?? size.w;
        size.sy = e.data.size.sy ?? size.h;
        size.s = e.data.size.s ?? size.sx;
        array = new Array(size.w).fill(0).map(_ => new Array(size.h).fill(0).map(_ => Light.black));
        buffer = new Uint8ClampedArray(size.h * size.w * 4);
        iter = 0;
        buffer.fill(255);
    }
    if (e.data?.render) {
        iter++;
        for (let i = 0; i < size.w; i++) {
            for (let j = 0; j < size.h; j++) {
                const { r, g, b } = postProcessor(
                    array[i][j]
                        .mix(trace(
                            new Ray(
                                CAMERA_POSITION,
                                new Vector(
                                    (size.sx / 2 - i - size.dx + (Math.random() - 0.5)) / size.s * FRAME_SIZE[0],
                                    (size.sy / 2 - j - size.dy + (Math.random() - 0.5)) / size.s * FRAME_SIZE[1],
                                    FOCAL_LENGTH,
                                )
                            ),
                            SCENE,
                        ))
                        .clone()
                        .mult(1 / iter)
                        .rgb()
                );
                buffer[j * (size.w * 4) + i * 4 + 0] = r * 255;
                buffer[j * (size.w * 4) + i * 4 + 1] = g * 255;
                buffer[j * (size.w * 4) + i * 4 + 2] = b * 255;
            }
        }
    }
    this.postMessage({ buffer, size });
})