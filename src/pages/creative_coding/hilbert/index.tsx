import Header from "@/components/header";
import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/hilbert")).default
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
        <h1>Hilbert Curve</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          The Hilbert curve (also known as the Hilbert space-filling curve) is a
          continuous fractal space-filling curve first described by the German
          mathematician David Hilbert in 1891, as a variant of the space-filling
          Peano curves discovered by Giuseppe Peano in 1890.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Hilbert Curve" />
    </>
  );
}
