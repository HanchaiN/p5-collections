import {
  dataContainer,
  previewContainer,
  sketch,
} from "@/styles/creative_coding.module.scss";
import React, { useEffect, useRef } from "react";

export default React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/fractal/fractal_tree_curve"))
          .default
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
            <button id="set" type="button">
              Regenerate
            </button>
            <button id="box" type="button">
              Toggle Box
            </button>
            <button id="reset" type="button">
              Restart
            </button>
          </form>
        </div>
      );
    },
  };
});
