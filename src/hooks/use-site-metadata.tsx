import { graphql, useStaticQuery } from "gatsby";

const SEOStaticQuery = graphql`
  query UseSiteMetadata {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
  }
`;

export const useSiteMetadata = () => {
  const data = useStaticQuery<Queries.UseSiteMetadataQuery>(SEOStaticQuery);
  return data.site!.siteMetadata!;
};
