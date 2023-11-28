import {
  dataContainer,
  previewContainer,
  sketch,
} from "@/styles/creative_coding.module.scss";
import { labelMedium } from "@/styles/main.module.scss";
import React, { useEffect, useRef } from "react";

export default React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/2d_fourier")).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLCanvasElement>(null);
      const config = useRef<HTMLFormElement>(null);
      const exec = main();
      useEffect(() => {
        exec?.start(canvas.current!, config.current!);
      }, []);
      useEffect(
        () => () => {
          exec?.stop();
        },
        [],
      );
      return (
        <div className={previewContainer}>
          <canvas
            width="500"
            height="500"
            className={sketch}
            ref={canvas}
          ></canvas>
          <form className={dataContainer} ref={config}>
            <label htmlFor="image" className={labelMedium}>
              Image:
            </label>
            <input type="file" accept="image/*" id="image" />
            <label htmlFor="fft-size" className={labelMedium}>
              FFT Size: <slot id="fft-size-value"></slot>
            </label>
            <input id="fft-size" type="number" step="1" />
            <label htmlFor="render-size" className={labelMedium}>
              Render Size: <slot id="render-size-value"></slot>
            </label>
            <input id="render-size" type="number" step="1" />
            <label htmlFor="overlay" className={labelMedium}>
              Overlay: <slot id="overlay-value"></slot>
            </label>
            <input
              id="overlay"
              type="number"
              min="0"
              max="1"
              step="1e-16"
              defaultValue="0.05"
            />
            <canvas
              width="100"
              height="100"
              className={sketch}
              id="kspace"
            ></canvas>
          </form>
        </div>
      );
    },
  };
});
