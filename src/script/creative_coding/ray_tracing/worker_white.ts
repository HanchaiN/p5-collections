import { Light, TColorRGB } from "./colors";
import { Ray, trace } from "./ray";
import {
  CAMERA_POSITION,
  LIGHT_DIRECTION,
  SCENE,
  WHITE_DIRECTION,
} from "./scene";
let iter = 0;
const white = Light.black,
  bright = Light.black,
  white_ray = new Ray(CAMERA_POSITION, WHITE_DIRECTION),
  ref_ray = new Ray(CAMERA_POSITION, LIGHT_DIRECTION);

export type MessageRequest = Record<string, never>;
export type MessageResponse = {
  white: TColorRGB;
  bright: TColorRGB;
};
function main(data: MessageRequest) {
  data;
  for (let i = 0; i < 1000; i++) {
    white.mix(trace(white_ray, SCENE));
    bright.mix(trace(ref_ray, SCENE));
    iter++;
  }
  return {
    white: white
      .clone()
      .mult(1 / iter)
      .rgb(),
    bright: bright
      .clone()
      .mult(1 / iter)
      .rgb(),
  };
}

self?.addEventListener("message", ({ data }: MessageEvent<MessageRequest>) =>
  self.postMessage(main(data)),
);
