import type { GatsbySSR } from "gatsby";
import React from "react";
import Layout from "@/components/layout";

export const wrapPageElement: GatsbySSR["wrapPageElement"] = ({
  element,
  props,
}) => {
  return <Layout {...props}> {element} </Layout>;
};
