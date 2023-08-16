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
        <h1 className={headlineLarge}>Creative Coding</h1>
        <p className={`${textContainer} ${bodyMedium}`}>
          Creative coding is a type of computer programming in which the goal is
          to create something expressive instead of something functional.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Creative Coding" />
    </>
  );
}
