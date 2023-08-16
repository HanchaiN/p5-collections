import Header from "@/components/header";
import {
  bodyMedium,
  headlineLarge,
  textContainer,
} from "@/styles/main.module.css";
import React, { Suspense, useEffect } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/dtmf")).default
      : () => null;
  return {
    default: function Component() {
      const exec = main();
      useEffect(() => {
        exec?.start();
      }, []);
      useEffect(
        () => () => {
          exec?.stop();
        },
        [],
      );
      return <></>;
    },
  };
});

export default function Body() {
  return (
    <>
      <article>
        <h1 className={headlineLarge}>DTMF</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p className={`${textContainer} ${bodyMedium}`}>
          Dual-tone multi-frequency signaling (DTMF) is a telecommunication
          signaling system using the voice-frequency band over telephone lines
          between telephone equipment and other communications devices and
          switching centers.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="DTMF" />
    </>
  );
}
