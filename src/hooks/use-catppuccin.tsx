import type { ColorName } from "@catppuccin/palette";
import { flavors } from "@catppuccin/palette";
import * as color from "@thi.ng/color";
import { useMemo } from "react";
import { useColorScheme } from "./use-dark-mode";

export const useCatppuccin = (name: ColorName) => {
  const dark = useColorScheme();
  return useMemo(() => {
    return color.css(flavors[dark ? "mocha" : "latte"].colors[name].hex);
  }, [dark]);
};
