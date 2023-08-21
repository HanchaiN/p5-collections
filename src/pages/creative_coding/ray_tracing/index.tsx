import Header from "@/components/header";
import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import { headlineLarge } from "@/styles/main.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/ray_tracing")).default
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
        <h1 className={headlineLarge}>Ray Tracing</h1>
        <Suspense>
          <Preview />
        </Suspense>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Boids" />
    </>
  );
}
