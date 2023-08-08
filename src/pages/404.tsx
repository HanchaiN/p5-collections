import Header from "@/components/header";
import { StaticImage } from "gatsby-plugin-image";
import * as React from "react";

export default function Body() {
  return (
    <>
      <StaticImage
        src="https://http.cat/404.jpg"
        alt="404 Not Found"
        style={{ display: "block", margin: "auto" }}
      />
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="404 Not Found" />
    </>
  );
}
