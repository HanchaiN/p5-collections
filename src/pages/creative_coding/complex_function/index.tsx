import Header from "@/components/header";
import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/complex_function")).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLCanvasElement>(null);
      const exec = main();
      useEffect(() => {
        exec?.start(canvas.current!);
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
        </div>
      );
    },
  };
});

export default function Body() {
  return (
    <>
      <article>
        <h1>Complex Function</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          In complex analysis, domain coloring or a color wheel graph is a
          technique for visualizing complex functions by assigning a color to
          each point of the complex plane.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Complex function" />
    </>
  );
}
