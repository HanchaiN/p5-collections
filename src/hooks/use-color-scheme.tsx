import { useEffect, useState } from "react";

export const useColorScheme = () => {
  const [dark, setDark] = useState(true);

  function onSchemeChange(this: MediaQueryList, e: MediaQueryListEvent) {
    setDark(!!e.matches);
  }

  useEffect(() => {
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

    setDark(matchMedia.matches);
    matchMedia.addEventListener("change", onSchemeChange);

    return () => matchMedia.removeEventListener("change", onSchemeChange);
  }, []);

  return dark;
};
