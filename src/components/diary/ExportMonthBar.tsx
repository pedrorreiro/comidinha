"use client";

import { Button, Flex, Input, Text } from "@chakra-ui/react";
import { FileDown } from "lucide-react";
import { pad2 } from "@/lib/dates";
import { usePalette } from "@/theme/ThemePaletteContext";

type ExportMonthBarProps = {
  /** YYYY-MM */
  monthValue: string;
  onMonthChange: (value: string) => void;
  onExportPdf: () => void;
  exporting: boolean;
};

export function ExportMonthBar({
  monthValue,
  onMonthChange,
  onExportPdf,
  exporting,
}: ExportMonthBarProps) {
  const palette = usePalette();

  return (
    <Flex
      align={{ base: "stretch", sm: "center" }}
      justify="space-between"
      gap={4}
      flexWrap="wrap"
      mt={10}
      p={4}
      borderRadius="2xl"
      bg={palette.surfaceSoft}
      borderWidth="1px"
      borderColor={palette.border}
      boxShadow={palette.cardShadow}
    >
      <Flex direction="column" gap={1} minW="0">
        <Text fontSize="sm" fontWeight="semibold" color={palette.text}>
          Exportar para a nutricionista
        </Text>
        <Text fontSize="xs" color={palette.fgSubtle}>
          Gera um PDF com todos os dias do mês escolhido (inclusive vazios).
        </Text>
      </Flex>
      <Flex align="center" gap={3} flexWrap="wrap">
        <Input
          type="month"
          value={monthValue}
          onChange={(e) => onMonthChange(e.target.value)}
          onClick={(e) => {
            const input = e.currentTarget as HTMLInputElement & {
              showPicker?: () => void;
            };
            input.showPicker?.();
          }}
          onFocus={(e) => {
            const input = e.currentTarget as HTMLInputElement & {
              showPicker?: () => void;
            };
            input.showPicker?.();
          }}
          maxW="180px"
          size="sm"
          borderRadius="lg"
          fontVariantNumeric="tabular-nums"
        />
        <Button
          size="sm"
          borderRadius="lg"
          gap={2}
          loading={exporting}
          loadingText="Gerando…"
          onClick={onExportPdf}
          bg={palette.navActive}
          color={palette.text}
          borderWidth="1px"
          borderColor={palette.navActiveBorder}
          _hover={{
            bg: palette.navHover,
            borderColor: palette.borderGlow,
          }}
        >
          <FileDown size={16} strokeWidth={1.75} />
          Baixar PDF
        </Button>
      </Flex>
    </Flex>
  );
}

/** Converte Date em string YYYY-MM para input type="month". */
export function dateToMonthInput(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}
