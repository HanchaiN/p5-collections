import "katex";
import "katex/dist/katex.min.css";
import React, { PropsWithChildren } from "react";
import Navbar from "./navbar";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>{children}</main>
    </>
  );
}
