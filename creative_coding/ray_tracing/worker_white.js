import { Light } from "./colors.js";
import { Ray, trace } from "./ray.js";
import { CAMERA_POSITION, REF_DIRECTION, SCENE_REF, WHITE_DIRECTION } from "./scene.js";
let white = Light.black, bright = Light.black, iter = 0;
const white_ray = new Ray(CAMERA_POSITION, WHITE_DIRECTION);
const ref_ray = new Ray(CAMERA_POSITION, REF_DIRECTION);
self.addEventListener("message", function (e) {
    for (let i = 0; i < 1000; i++) {
        white.mix(trace(white_ray, SCENE_REF));
        bright.mix(trace(ref_ray, SCENE_REF));
        iter++;
    }
    this.postMessage({
        white: white.clone().mult(1 / iter).rgb(),
        bright: bright.clone().mult(1 / iter).rgb(),
    });
})