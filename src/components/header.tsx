import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSiteMetadata } from "@/hooks/use-site-metadata";
import { bodyMedium, surface } from "@/styles/main.module.scss";
import "@/styles/main.scss";
import React, { PropsWithChildren, useEffect } from "react";

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
  useEffect(() => {
    document.documentElement.classList.toggle("theme-mocha", dark);
    document.documentElement.classList.toggle("theme-latte", !dark);
  }, [dark]);

  return (
    <>
      <html lang="en" />
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
