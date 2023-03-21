import { Sphere, Dye, Object, Horizon, PhongMaterial } from "./object.js";
import { Light, Ray, trace } from "./ray.js";
import { Vector } from "../utils/index.js";
const SCENE = Object.union(
    new Horizon(),
    new Sphere(
        new Vector(0, 0, 30),
        10,
        new PhongMaterial(null, new Dye(1, 0, 0), new Dye(0, 1, 0), 10),
    )
);
const FOCAL_LENGTH = 250;
const CAMERA_POSITION = new Vector(0, 0, 0);
let array = null, buffer = null, size = { width: null, height: null }, iter = 0;
self.addEventListener("message", function (e) {
    if (e.data?.size) {
        size = {
            width: e.data.size.width,
            height: e.data.size.height,
        }
        array = new Array(size.width).fill(0).map(_ => new Array(size.height).fill(0).map(_ => Light.black));
        buffer = new Uint8ClampedArray(size.height * size.width * 4);
        iter = 0;
        buffer.fill(255);
        this.postMessage(buffer);
        return;
    }
    if (!buffer) {
        this.postMessage(null);
        return;
    }
    for (let i = 0; i < size.width; i++) {
        for (let j = 0; j < size.height; j++) {
            const color = array[i][j]
                .mult(iter)
                .mix(trace(
                    new Ray(CAMERA_POSITION, new Vector(
                        (i - size.width / 2) / FOCAL_LENGTH,
                        (size.height / 2 - j) / FOCAL_LENGTH,
                        1,
                    )),
                    SCENE,
                ))
                .mult(1 / (iter + 1))
                .rgb();
            buffer[j * (size.width * 4) + i * 4 + 0] = color.r * 255;
            buffer[j * (size.width * 4) + i * 4 + 1] = color.g * 255;
            buffer[j * (size.width * 4) + i * 4 + 2] = color.b * 255;
        }
    }
    iter++;
    this.postMessage(buffer);
})