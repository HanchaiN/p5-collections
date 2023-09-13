import Header from "@/components/header";
import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import {
  bodyMedium,
  headlineLarge,
  textContainer,
} from "@/styles/main.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/self_organizing_map")).default
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
        <h1 className={headlineLarge}>Self-organizing Map</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p className={`${textContainer} ${bodyMedium}`}>
          A self-organizing map (SOM) or self-organizing feature map (SOFM) is
          an unsupervised machine learning technique used to produce a
          low-dimensional (typically two-dimensional) representation of a higher
          dimensional data set while preserving the topological structure of the
          data.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Self-organizing Map" />
    </>
  );
}
