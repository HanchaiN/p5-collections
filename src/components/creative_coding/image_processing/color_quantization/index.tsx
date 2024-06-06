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
      ? (
          await import(
            "@/script/creative_coding/image_processing/color_quantization"
          )
        ).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLCanvasElement>(null);
      const svgCanvas = useRef<SVGSVGElement>(null);
      const config = useRef<HTMLFormElement>(null);
      const exec = main();
      useEffect(() => {
        exec?.start(canvas.current!, svgCanvas.current!, config.current!);
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
          <svg
            width="500"
            height="500"
            className={sketch}
            ref={svgCanvas}
          ></svg>
          <form className={dataContainer} ref={config}>
            <label htmlFor="image" className={labelMedium}>
              Image:
            </label>
            <input type="file" accept="image/*" id="image" />
            <label htmlFor="sample-dim" className={labelMedium}>
              Sample Dimension:
            </label>
            <input
              id="sample-dim"
              type="number"
              min="50"
              max="5000"
              step="1"
              defaultValue="100"
            />
            <div
              style={{ gridColumn: "1 / 3", display: "flex", flexWrap: "wrap" }}
            >
              <button id="autorun" type="button">
                Autorun
              </button>
              <button id="update-color" type="button">
                Update colors
              </button>
            </div>
            <label htmlFor="palette-count" className={labelMedium}>
              Color Count:
            </label>
            <input
              id="palette-count"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
            />
            <div
              style={{ gridColumn: "1 / 3", display: "flex", flexWrap: "wrap" }}
            >
              <button id="calc" type="button">
                Calculate
              </button>
              <button id="snap" type="button">
                Snap
              </button>
              <button id="eval" type="button">
                Evaluate
              </button>
            </div>
            <label htmlFor="palette-score" className={labelMedium}>
              Silhouette Score:
            </label>
            <input id="palette-score" type="number" disabled />
            <div
              style={{ gridColumn: "1 / 3", display: "flex", flexWrap: "wrap" }}
            >
              <button id="draw-raw" type="button">
                Draw (Raw)
              </button>
              <button id="draw-quant" type="button">
                Quantize
              </button>
              <button id="draw-dither" type="button">
                Dither
              </button>
              <button id="draw-svg" type="button">
                Vectorize
              </button>
            </div>
            <textarea id="palette-text" />
            <div
              id="palette"
              style={{ gridColumn: "1 / 3", display: "flex", flexWrap: "wrap" }}
            ></div>
          </form>
        </div>
      );
    },
  };
});
