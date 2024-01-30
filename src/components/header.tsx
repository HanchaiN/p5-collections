import { useColorScheme } from "@/hooks/use-dark-mode";
import { useSiteMetadata } from "@/hooks/use-site-metadata";
import { bodyMedium, surface } from "@/styles/main.module.scss";
import "@/styles/main.scss";
import React, { PropsWithChildren } from "react";

type Props = {
  title?: string;
  description?: string;
};

export default function Header({
  title,
  description,
  children,
}: PropsWithChildren<Props>) {
  const { title: defaultTitle, description: defaultDescription } =
    useSiteMetadata();

  const metadata = {
    title: title || defaultTitle,
    description: description || defaultDescription,
  };

  const dark = useColorScheme();
  const theme = dark ? "mocha" : "latte";

  return (
    <>
      <html lang="en" className={`theme-${theme}`} />
      {metadata.title ? <title>{metadata.title}</title> : <></>}
      <meta charSet="utf-8" />
      {metadata.description ? (
        <meta name="description" content={metadata.description} />
      ) : (
        <></>
      )}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="supported-color-schemes" content="light dark" />
      <body className={`${surface} ${bodyMedium}`} />
      {children}
    </>
  );
}
