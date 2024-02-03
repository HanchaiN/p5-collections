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
      ? (await import("@/script/creative_coding/self_organizing_map")).default
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
            <label htmlFor="range" className={labelMedium}>
              Initial Range: <slot id="range-value"></slot>
            </label>
            <input id="range" type="range" step="1e-5" min="0" max="1" />
            <label htmlFor="learning-rate" className={labelMedium}>
              Initial Learning Rate: <slot id="learning-rate-value"></slot>
            </label>
            <input
              id="learning-rate"
              type="range"
              step="1e-5"
              min="0"
              max="1"
            />
            <label htmlFor="range-decay-rate" className={labelMedium}>
              Range Decay Rate:
            </label>
            <input id="range-decay-rate" type="number" min="0" />
            <label htmlFor="learning-decay-rate" className={labelMedium}>
              Learning Decay Rate:
            </label>
            <input id="learning-decay-rate" type="number" min="0" />
            <label htmlFor="color-choices" className={labelMedium}>
              Color Choices: <slot id="color-choices-value"></slot>
            </label>
            <input id="color-choices" type="range" step="1" min="1" max="10" />
            <label htmlFor="weight-positions" className={labelMedium}>
              Position Weighting:
            </label>
            <input id="weight-positions" type="number" />
            <label htmlFor="weight-colors" className={labelMedium}>
              Color Weighting:
            </label>
            <input id="weight-colors" type="number" />
          </form>
        </div>
      );
    },
  };
});
