import Header from "@/components/header";
import { headingLarge } from "@/styles/main.module.css";
import * as React from "react";

export default function Body() {
  return (
    <>
      <article>
        <h1 className={headingLarge}>Welcome</h1>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis ullam
          sit quae et esse nam officiis asperiores natus, est hic inventore
          harum velit eum labore provident. Perferendis error obcaecati
          architecto?
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
