"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { darkPalette, lightPalette, type AppPalette } from "./palettes";

const ThemePaletteContext = createContext<AppPalette>(darkPalette);

export function ThemePaletteProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const palette = resolvedTheme === "light" ? lightPalette : darkPalette;

  return (
    <ThemePaletteContext.Provider value={palette}>
      {children}
    </ThemePaletteContext.Provider>
  );
}

export function usePalette(): AppPalette {
  return useContext(ThemePaletteContext);
}
