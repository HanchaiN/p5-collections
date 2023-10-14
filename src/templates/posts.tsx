import Header from "@/components/header";
import * as style from "@/styles/main.module.css";
import { MDXProvider } from "@mdx-js/react";
import type { Components } from "@mdx-js/react/lib";
import { HeadProps, Link, PageProps, graphql } from "gatsby";
import React from "react";
import { BlockMath, InlineMath } from "react-katex";

const components: Components = {
  h1: ({ className, ..._props }) => (
    <h1 className={`${style.headlineLarge} ${className}`} {..._props} />
  ),
  h2: ({ className, ..._props }) => (
    <h2 className={`${style.headlineMedium} ${className}`} {..._props} />
  ),
  h3: ({ className, ..._props }) => (
    <h3 className={`${style.headlineSmall} ${className}`} {..._props} />
  ),
  h4: ({ className, ..._props }) => (
    <h4 className={`${style.titleLarge} ${className}`} {..._props} />
  ),
  h5: ({ className, ..._props }) => (
    <h5 className={`${style.titleMedium} ${className}`} {..._props} />
  ),
  h6: ({ className, ..._props }) => (
    <h6 className={`${style.titleSmall} ${className}`} {..._props} />
  ),
  p: ({ className, ..._props }) => (
    <p
      className={`${style.bodyMedium} ${style.textContainer} ${className}`}
      {..._props}
    />
  ),
  Link,
  InlineMath,
  BlockMath,
};

export default function PostTemplate({
  children,
}: PageProps<Queries.PostTemplateQuery>) {
  return (
    <MDXProvider components={components}>
      <article>{children}</article>
    </MDXProvider>
  );
}

export function Head({ data }: HeadProps<Queries.PostTemplateQuery>) {
  return (
    <>
      <Header title={data.mdx?.frontmatter?.title ?? undefined} />
    </>
  );
}

export const query = graphql`
  query PostTemplate($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
      }
    }
  }
`;
