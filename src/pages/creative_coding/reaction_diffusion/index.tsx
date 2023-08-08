import Header from "@/components/header";
import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/reaction_diffusion")).default
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
        <h1>Reaction-diffusion</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          Reaction&ndash;diffusion systems are mathematical models which
          correspond to several physical phenomena. The most common is the
          change in space and time of the concentration of one or more chemical
          substances: local chemical reactions in which the substances are
          transformed into each other, and diffusion which causes the substances
          to spread out over a surface in space.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Reaction-diffusion" />
    </>
  );
}
