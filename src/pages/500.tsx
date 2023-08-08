import Header from "@/components/header";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";

export default function Body() {
  return (
    <>
      <StaticImage
        src="https://http.cat/500.jpg"
        alt="500 Internal Server Error"
        style={{ display: "block", margin: "auto" }}
      />
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="500 Internal Server Error" />
    </>
  );
}
