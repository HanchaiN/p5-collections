import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import React, { useEffect, useRef } from "react";

export default React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/hydrogen_cloud")).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLCanvasElement>(null);
      const foreground = useRef<HTMLCanvasElement>(null);
      const exec = main();
      useEffect(() => {
        exec?.start(foreground.current!, canvas.current!);
      }, []);
      useEffect(
        () => () => {
          exec?.stop();
        },
        [],
      );
      return (
        <div className={previewContainer} style={{ position: "relative" }}>
          <canvas
            width="500"
            height="500"
            className={sketch}
            ref={canvas}
            style={{ zIndex: 0 }}
          ></canvas>
          <canvas
            width="500"
            height="500"
            className={sketch}
            ref={foreground}
            style={{ zIndex: 0, position: "absolute" }}
          ></canvas>
        </div>
      );
    },
  };
});
