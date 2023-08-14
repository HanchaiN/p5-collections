import Header from "@/components/header";
import { headingLarge } from "@/styles/main.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/slit_experiment")).default
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
        <h1 className={headingLarge}>Slit Experiment</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          The path integral formulation is a description in quantum mechanics
          that generalizes the action principle of classical mechanics. It
          replaces the classical notion of a single, unique classical trajectory
          for a system with a sum, or functional integral, over an infinity of
          quantum-mechanically possible trajectories to compute a quantum
          amplitude.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Slit Experiment" />
    </>
  );
}
