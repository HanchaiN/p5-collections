import { useSiteMetadata } from "@/hooks/use-site-metadata";
import "@/styles/main.css";
import { bodyMedium, surface } from "@/styles/main.module.css";
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
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@12..57,400..500&display=swap"
      ></link>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <body className={`${surface} ${bodyMedium}`} />
      {children}
    </>
  );
}
