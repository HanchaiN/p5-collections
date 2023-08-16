import Header from "@/components/header";
import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import React, { Suspense, useEffect, useRef } from "react";

import {
  bodyMedium,
  headlineLarge,
  textContainer,
} from "@/styles/main.module.css";
const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/dynamical_system")).default
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
        <h1 className={headlineLarge}>Dynamical System</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p className={`${textContainer} ${bodyMedium}`}>
          In physics, a dynamical system is described as a &ldquo;particle or
          ensemble of particles whose state varies over time and thus obeys
          differential equations involving time derivatives&rdquo;.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Dynamical System" />
    </>
  );
}
