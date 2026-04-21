"use client";

import { Box, Text, Textarea } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { MealSlotDef } from "@/constants/meal-slots";
import { usePalette } from "@/theme/ThemePaletteContext";
import type { MealSlotId } from "@/types/diary";

type DayMealCardProps = {
  ymd: string;
  slots: MealSlotDef[];
  values: Partial<Record<MealSlotId, string>>;
  onChange: (slot: MealSlotId, text: string) => void;
};

export function DayMealCard({ ymd, slots, values, onChange }: DayMealCardProps) {
  const palette = usePalette();

  return (
    <motion.div
      key={ymd}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Box
        p={{ base: 4, md: 6 }}
        borderRadius="2xl"
        bg={palette.surfaceSoft}
        borderWidth="1px"
        borderColor={palette.border}
        boxShadow={palette.cardShadow}
      >
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color={palette.textMuted}
          mb={5}
          letterSpacing="-0.01em"
        >
          Edição completa do dia (opcional)
        </Text>
        <Box display="flex" flexDirection="column" gap={3}>
          {slots.map((slot) => (
            <Box key={slot.id}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="0.06em"
                color={palette.textMuted}
                mb={1.5}
              >
                {slot.label}
              </Text>
              <Textarea
                aria-label={`${slot.label} em ${ymd}`}
                value={values[slot.id] ?? ""}
                onChange={(e) => onChange(slot.id, e.target.value)}
                rows={3}
                size="sm"
                borderRadius="xl"
                resize="vertical"
                fontSize="sm"
                lineHeight="1.5"
              />
            </Box>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
}
