import Header from "@/components/header";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/spectral_graph")).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLDivElement>(null);
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
      return <div ref={canvas}></div>;
    },
  };
});

export default function Body() {
  return (
    <>
      <article>
        <h1>Spectral Graph</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
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
