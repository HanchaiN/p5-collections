import Header from "@/components/header";
import type { PageProps } from "gatsby";
import { Link, graphql } from "gatsby";
import * as React from "react";

export default function Body({ data }: PageProps<Queries.CreativeCodingQuery>) {
  return (
    <>
      <article>
        <h1>Creative Coding</h1>
        <p>
          Creative coding is a type of computer programming in which the goal is
          to create something expressive instead of something functional.
        </p>
        <ul>
          {data.allSitePage.nodes.map((node) => (
            <li key={node.path}>
              <Link to={node.path}>{node.path}</Link>
            </li>
          ))}
        </ul>
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

export const query = graphql`
  query CreativeCoding {
    allSitePage(
      filter: { path: { glob: "/creative_coding/*" } }
      sort: { path: ASC }
    ) {
      nodes {
        path
      }
    }
  }
`;
