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

export default function Body() {
  return (
    <>
      <article>
        <h1 className={headlineLarge}>Hydrogen Cloud</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p className={`${textContainer} ${bodyMedium}`}>
          In the solution to the Schrödinger equation, which is
          non-relativistic, hydrogen-like atomic orbitals are eigenfunctions of
          the one-electron angular momentum operator L and its z component Lz. A
          hydrogen-like atomic orbital is uniquely identified by the values of
          the principal quantum number n, the angular momentum quantum number l,
          and the magnetic quantum number m.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Hydrogen Cloud" />
    </>
  );
}
