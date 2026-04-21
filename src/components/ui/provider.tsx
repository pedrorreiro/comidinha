"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme/system";
import { ThemePaletteProvider } from "@/theme/ThemePaletteContext";
import { ColorModeProvider } from "./color-mode";
import EmotionRegistry from "./registry";
import { AppToaster } from "./AppToaster";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        <ColorModeProvider
          attribute="class"
          disableTransitionOnChange
          storageKey="diario-alimentar-theme"
          defaultTheme="dark"
          themes={["dark", "light"]}
          enableSystem={false}
          enableColorScheme
        >
          <ThemePaletteProvider>
            <AppToaster />
            {children}
          </ThemePaletteProvider>
        </ColorModeProvider>
      </ChakraProvider>
    </EmotionRegistry>
  );
}
