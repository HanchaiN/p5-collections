import Header from "@/components/header";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/poincare_disk")).default
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
        <h1>Poincare Disk</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          In geometry, the Poincaré disk model, also called the conformal disk
          model, is a model of 2-dimensional hyperbolic geometry in which all
          points are inside the unit disk, and straight lines are either
          circular arcs contained within the disk that are orthogonal to the
          unit circle or diameters of the unit circle.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Poincare Disk" />
    </>
  );
}
