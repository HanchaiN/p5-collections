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
            <label htmlFor="sample-scale" className={labelMedium}>
              Sample Scale:
            </label>
            <input
              id="sample-scale"
              type="number"
              min="1"
              max="50"
              step="1"
              defaultValue="5"
            />
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
            <label htmlFor="snap" className={labelMedium}>
              Is snap:
            </label>
            <input id="snap" type="checkbox" defaultChecked />
            <label htmlFor="dither" className={labelMedium}>
              Is Dithering:
            </label>
            <input id="dither" type="checkbox" />
            <button id="apply" type="button">
              Recalculate
            </button>
            <button id="redraw" type="button">
              Redraw
            </button>
            <label htmlFor="palette-score" className={labelMedium}>
              Silhouette Score:
            </label>
            <input id="palette-score" type="number" disabled />
            <button id="autorun" type="button">
              Autorun
            </button>
          </form>
        </div>
      );
    },
  };
});
