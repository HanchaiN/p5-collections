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
      ? (await import("@/script/creative_coding/hydrogen_pilot")).default
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
        <h1 className={headlineLarge}>Hydrogen Pilot Wave</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p className={`${textContainer} ${bodyMedium}`}>
          The de Broglie&ndash;Bohm theory, also known as the pilot wave theory,
          Bohmian mechanics, Bohm&apos;s interpretation, and the causal
          interpretation, is an interpretation of quantum mechanics. In addition
          to the wavefunction, it also postulates an actual configuration of
          particles exists even when unobserved. The evolution over time of the
          configuration of all particles is defined by a guiding equation. The
          evolution of the wave function over time is given by the Schrödinger
          equation.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Hydrogen Pilot Wave" />
    </>
  );
}
