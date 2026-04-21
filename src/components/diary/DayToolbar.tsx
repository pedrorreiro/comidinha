"use client";

import { Badge, Button, Flex, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { longDatePt } from "@/lib/dates";
import { usePalette } from "@/theme/ThemePaletteContext";

type DayToolbarProps = {
  year: number;
  month: number;
  day: number;
  isToday: boolean;
  onGoToday: () => void;
};

export function DayToolbar({
  year,
  month,
  day,
  isToday,
  onGoToday,
}: DayToolbarProps) {
  const palette = usePalette();
  const longLabel = longDatePt(year, month, day);
  const longCap = longLabel.charAt(0).toUpperCase() + longLabel.slice(1);

  return (
    <Flex direction="column" gap={2} mb={{ base: 4, md: 6 }}>
      <motion.div
        key={`${year}-${month}-${day}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ minWidth: 0 }}
      >
        <Heading
          size={{ base: "md", md: "lg" }}
          fontWeight="semibold"
          letterSpacing="-0.03em"
          color={palette.text}
          lineHeight="1.25"
        >
          {longCap}
        </Heading>
      </motion.div>

      {isToday ? (
        <Badge
          mt={1}
          px={2}
          py={0.5}
          borderRadius="md"
          bg={palette.navActive}
          color={palette.text}
          borderWidth="1px"
          borderColor={palette.navActiveBorder}
          fontWeight="medium"
          width="fit-content"
        >
          Hoje
        </Badge>
      ) : (
        <Button
          mt={1}
          size="xs"
          variant="outline"
          borderRadius="lg"
          borderColor={palette.border}
          color={palette.fgSubtle}
          _hover={{ bg: palette.navHover, color: palette.text }}
          onClick={onGoToday}
          width="fit-content"
        >
          Voltar para hoje
        </Button>
      )}
    </Flex>
  );
}
