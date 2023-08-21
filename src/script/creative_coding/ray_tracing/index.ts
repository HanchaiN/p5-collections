import { Vector, map } from "@/script/utils/math";
import type { TColorRGB } from "./colors";
import { Light } from "./colors";
import {
  postProcessorGen,
  reinhard_jodie_lum_ext as tonemaper,
} from "./postprocessor";
import { Ray, trace } from "./ray";
import { CAMERA_POSITION, FOCAL_LENGTH, FRAME_SIZE, SCENE } from "./scene";
import type { MessageResponse as WhiteMessageResponse } from "./worker_white";
export default function execute() {
  let workers: Worker[] = [];
  const color = {
    white: [1, 1, 1] as TColorRGB,
    bright: [1, 1, 1] as TColorRGB,
  };
  let isActive = false;
  const iter = 2;
  const scale = 1;

  const postProcessorGen_ = postProcessorGen(tonemaper);
  let postProcessor = postProcessorGen_(color.bright, color.white);

  function* main(buffer: ImageData): Generator<void, never, void> {
    let iter = 0;
    const array = new Array(buffer.width)
      .fill(null)
      .map(() => new Array(buffer.height).fill(null).map(() => Light.black));
    while (true) {
      for (let j = 0; j < buffer.height; j++) {
        if (j !== buffer.height - 1)
          buffer.data.set(
            new Array(buffer.width * 4).fill(255),
            (buffer.height - j - 2) * buffer.width * 4,
          );
        for (let i = 0; i < buffer.width; i++) {
          const [r, g, b] = postProcessor(
            array[i][j]
              .mix(
                trace(
                  new Ray(
                    CAMERA_POSITION,
                    new Vector(
                      map(
                        i + Math.random() - 0.5,
                        0,
                        buffer.width,
                        -FRAME_SIZE[0] / 2,
                        FRAME_SIZE[0] / 2,
                      ),
                      map(
                        j + Math.random() - 0.5,
                        0,
                        buffer.height,
                        -FRAME_SIZE[1] / 2,
                        FRAME_SIZE[1] / 2,
                      ),
                      FOCAL_LENGTH,
                    ),
                  ),
                  SCENE,
                ),
              )
              .clone()
              .mult(1 / iter)
              .rgb(),
          );
          buffer.data.set(
            [r * 255, g * 255, b * 255],
            (buffer.height - j - 1) * buffer.width * 4 + i * 4,
          );
          yield;
        }
      }
      iter++;
    }
  }

  return {
    start: (canvas: HTMLCanvasElement) => {
      isActive = true;
      const white_calc = new Worker(
        new URL("./worker_white.ts", import.meta.url),
      );
      white_calc.postMessage(null);
      white_calc.addEventListener(
        "message",
        function ({ data }: MessageEvent<WhiteMessageResponse>) {
          white_calc.postMessage(null);
          // color.white = data.white;
          color.bright = data.bright;
          postProcessor = postProcessorGen_(color.bright, color.white);
        },
      );
      workers.push(white_calc);
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      })!;
      const buffer = ctx.getImageData(
        0,
        0,
        canvas.width / scale,
        canvas.height / scale,
      );
      const step = main(buffer);
      requestAnimationFrame(function draw() {
        if (!isActive) return;
        let done = false;
        for (let _ = 0; _ < iter; _++) {
          const res = step.next();
          if (res.done) {
            done = true;
            break;
          }
        }
        createImageBitmap(buffer).then((bmp) =>
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height),
        );
        if (!done) requestAnimationFrame(draw);
      });
    },
    stop: () => {
      isActive = false;
      workers?.forEach((worker) => {
        worker.terminate();
      });
      workers = [];
    },
  };
}
