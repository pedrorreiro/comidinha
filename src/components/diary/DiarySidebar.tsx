"use client";

import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { ClipboardList, NotepadText } from "lucide-react";
import { usePalette } from "@/theme/ThemePaletteContext";

export type DiarySection = "resumo" | "registro";

type DiarySidebarProps = {
  section: DiarySection;
  onChangeSection: (section: DiarySection) => void;
};

export function DiarySidebar({ section, onChangeSection }: DiarySidebarProps) {
  const palette = usePalette();

  const itemStyles = (active: boolean) => ({
    justifyContent: "flex-start",
    gap: 2,
    borderRadius: "lg",
    borderWidth: "1px",
    borderColor: active ? palette.navActiveBorder : palette.border,
    bg: active ? palette.navActive : "transparent",
    color: active ? palette.text : palette.textMuted,
    _hover: { bg: palette.navHover, color: palette.text },
  });

  return (
    <Box
      w={{ base: "100%", lg: "260px" }}
      flexShrink={0}
      position={{ base: "static", lg: "sticky" }}
      top={{ lg: "16px" }}
      p={4}
      borderRadius="2xl"
      bg={palette.surfaceSoft}
      borderWidth="1px"
      borderColor={palette.border}
      boxShadow={palette.cardShadow}
    >
      <Text fontSize="sm" fontWeight="semibold" color={palette.text} mb={3}>
        Navegação
      </Text>
      <Flex direction={{ base: "row", lg: "column" }} gap={2}>
        <Button
          size="sm"
          {...itemStyles(section === "resumo")}
          onClick={() => onChangeSection("resumo")}
        >
          <ClipboardList size={16} />
          Resumo do dia
        </Button>
        <Button
          size="sm"
          {...itemStyles(section === "registro")}
          onClick={() => onChangeSection("registro")}
        >
          <NotepadText size={16} />
          Registrar refeições
        </Button>
      </Flex>
    </Box>
  );
}
