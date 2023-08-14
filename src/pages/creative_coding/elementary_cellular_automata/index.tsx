import Header from "@/components/header";
import React, { Suspense, useEffect, useRef } from "react";

import { headingLarge } from "@/styles/main.module.css";
const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/elementary_cellular_automata"))
          .default
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
        <h1 className={headingLarge}>Elementary Cellular Automata</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p>
          In mathematics and computability theory, an elementary cellular
          automaton is a one-dimensional cellular automaton where there are two
          possible states (labeled 0 and 1) and the rule to determine the state
          of a cell in the next generation depends only on the current state of
          the cell and its two immediate neighbors.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Elementary Cellular Automata" />
    </>
  );
}
