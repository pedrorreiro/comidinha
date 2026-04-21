import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const appGlobalCss = {
  body: {
    bg: "var(--app-body-bg)",
    color: "var(--app-body-fg)",
    minHeight: "100dvh",
    fontSize: "15px",
    lineHeight: 1.55,
    fontFamily: "body",
    letterSpacing: "-0.015em",
    transitionProperty: "background-color, color",
    transitionDuration: "0.2s",
  },
  "*": {
    scrollbarWidth: "thin",
  },
  "input, textarea, select": {
    borderColor: "var(--app-input-border)!important",
    background: "var(--app-input-bg)!important",
    color: "var(--app-input-fg)!important",
    transitionProperty: "background-color, border-color, color",
    transitionDuration: "0.15s",
  },
  "input::placeholder, textarea::placeholder": {
    color: "var(--app-ph)!important",
  },
} as const;

const appConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: {
          value: "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif",
        },
      },
      colors: {
        brand: {
          500: { value: "#5d7a96" },
          600: { value: "#4a6278" },
        },
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalCss: appGlobalCss as any,
});

export const system = createSystem(defaultConfig, appConfig);
