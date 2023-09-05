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
      ? (await import("@/script/creative_coding/spectral_graph")).default
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
        <h1 className={headlineLarge}>Spectral Graph</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p className={`${textContainer} ${bodyMedium}`}>
          Spectral layout is a class of algorithm for drawing graphs. The layout
          uses the eigenvectors of a matrix, such as the Laplace matrix of the
          graph, as Cartesian coordinates of the graph&apos;s vertices.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Spectral Graph" />
    </>
  );
}
