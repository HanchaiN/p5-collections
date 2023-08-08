import Header from "@/components/header";
import {
  dataContainer,
  previewContainer,
  sketch,
} from "@/styles/creative_coding.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/ideal_gas")).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLCanvasElement>(null);
      const config = useRef<HTMLFormElement>(null);
      const exec = main();
      useEffect(() => {
        exec?.start(canvas.current!, config.current!);
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
          <form className={dataContainer} ref={config}>
            <label htmlFor="volume">
              Volume: <slot id="volume-value"></slot>
            </label>
            <input id="volume" type="range" step="1e-5" />
            <label htmlFor="temperature">
              Temperature: <slot id="temperature-value"></slot>
            </label>
            <input id="temperature" type="range" step="1e-16" />
            <label htmlFor="pressure">
              Pressure: <slot id="pressure-value"></slot>
            </label>
            <input id="pressure" type="range" step="1e-16" readOnly disabled />
          </form>
        </div>
      );
    },
  };
});

export default function Body() {
  return (
    <>
      <article>
        <h1>Ideal Gas</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          An ideal gas is a theoretical gas composed of many randomly moving
          point particles that are not subject to interparticle interactions.
          The ideal gas concept is useful because it obeys the ideal gas law, a
          simplified equation of state, and is amenable to analysis under
          statistical mechanics. The requirement of zero interaction can often
          be relaxed if, for example, the interaction is perfectly elastic or
          regarded as point-like collisions.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Ideal Gas" />
    </>
  );
}
