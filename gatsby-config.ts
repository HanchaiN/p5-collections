import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `HanchaiN`,
    description: `HanchaiN's GitHub Page`,
    siteUrl: `https://HanchaiN.github.io`,
  },
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        lang: "en-US",
        dir: "ltr",
        name: "HanchaiN's GitHub Page",
        short_name: "HanchaiN",
        description: "HanchaiN's GitHub Page",
        icon: "src/images/icon.png",
        scope: "/",
        start_url: "/",
        display: "browser",
        orientation: "landscape-primary",
        theme_color: "#b36619",
        background_color: "#fbfaf9",
      },
    },
    // "gatsby-plugin-mdx",
    // {
    //   resolve: 'gatsby-source-filesystem',
    //   options: {
    //     name: `blogs`,
    //     path: `./src/blogs`
    //   },
    // },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
  ],
};

export default config;