"use client";

import { Button } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePalette } from "@/theme/ThemePaletteContext";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const palette = usePalette();
  const isLight = resolvedTheme === "light";

  return (
    <Button
      aria-label={isLight ? "Ativar tema escuro" : "Ativar tema claro"}
      variant="ghost"
      size="sm"
      px={2}
      borderRadius="lg"
      color={palette.textMuted}
      _hover={{
        bg: palette.navHover,
        color: palette.text,
      }}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? (
        <Moon size={18} strokeWidth={1.75} />
      ) : (
        <Sun size={18} strokeWidth={1.75} />
      )}
    </Button>
  );
}
