import Layout from "@/components/layout";
import type { GatsbyBrowser } from "gatsby";
import React from "react";

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({
  element,
  props,
}) => {
  return <Layout {...props}> {element} </Layout>;
};
