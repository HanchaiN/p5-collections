import { useSiteMetadata } from "@/hooks/use-site-metadata";
import "@/styles/main.css";
import { surface } from "@/styles/main.module.css";
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
      <meta
        name="theme-color"
        content="#b36619"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content="#f2cca6"
        media="(prefers-color-scheme: dark)"
      />
      <body className={surface} />
      {children}
    </>
  );
}
