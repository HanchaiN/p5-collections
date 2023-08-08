import Header from "@/components/header";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/brainfuck")).default
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
        <h1>Brainfuck</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          Brainfuck is an esoteric programming language created in 1993 by Urban
          Müller.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Brainfuck" />
    </>
  );
}