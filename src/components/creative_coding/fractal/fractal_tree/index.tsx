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
      ? (await import("@/script/creative_coding/fractal/fractal_tree")).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLDivElement>(null);
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
          <div className={sketch} ref={canvas}></div>
          <form className={dataContainer} ref={config}>
            <label htmlFor="alpha" className={labelMedium}>
              Unbranched:
            </label>
            <input
              id="alpha"
              type="range"
              min="-1"
              max="1"
              defaultValue="0"
              step="1e-5"
            />
            <label htmlFor="beta1" className={labelMedium}>
              Branched (New):
            </label>
            <input
              id="beta1"
              type="range"
              min="-1"
              max="1"
              defaultValue="0"
              step="1e-5"
            />
            <label htmlFor="beta2" className={labelMedium}>
              Branched (Old):
            </label>
            <input
              id="beta2"
              type="range"
              min="-1"
              max="1"
              defaultValue="0"
              step="1e-5"
            />
            <button id="reset" type="button">
              Toggle Leaves
            </button>
          </form>
        </div>
      );
    },
  };
});
