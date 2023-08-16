import Header from "@/components/header";
import {
  bodyMedium,
  headlineLarge,
  textContainer,
} from "@/styles/main.module.css";
import * as React from "react";

export default function Body() {
  return (
    <>
      <article>
        <h1 className={headlineLarge}>Welcome</h1>
        <p className={`${textContainer} ${bodyMedium}`}>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis ullam
          sit quae et esse nam officiis asperiores natus, est hic inventore
          harum velit eum labore provident. Perferendis error obcaecati
          architecto?
        </p>
        <p className={`${textContainer} ${bodyMedium}`}>
          Basically, I did not know what to put here yet. For now, just go to
          the navigation panel and see what you&apos;d like over there.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header />
    </>
  );
}
