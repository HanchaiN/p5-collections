import type { GatsbyNode } from "gatsby";
import { createRequire } from "node:module";
import path from "path";
import webpack from "webpack";

const _require = createRequire(import.meta.url);

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      fallback: {
        stream: false,
        buffer: _require.resolve("buffer"),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
    optimization: {
      minimize: false,
    },
  });
};

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
  reporter,
}) => {
  const { createPage } = actions;

  const result = await graphql<
    Queries.GetMDXPagesQuery,
    Queries.GetMDXPagesQueryVariables
  >(`
    query GetMDXPages {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild("Error loading MDX result", result.errors);
  }

  // Create blog post pages.
  const posts = result.data!.allMdx.nodes;
  const postTemplate = path.resolve(`./src/templates/posts.tsx`);

  // you'll call `createPage` for each result
  posts.forEach((node) => {
    createPage({
      path: node.frontmatter?.slug ?? "test",
      component: `${postTemplate}?__contentFilePath=${node.internal
        .contentFilePath!}`,
      context: { id: node.id },
    });
  });
};
