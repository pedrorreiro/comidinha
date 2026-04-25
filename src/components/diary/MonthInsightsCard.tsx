"use client";

import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MEAL_SLOTS } from "@/constants/meal-slots";
import {
  addDaysYmd,
  daysInMonth,
  formatYmd,
  monthTitlePt,
  parseYmd,
  todayYmd,
} from "@/lib/dates";
import { moodLabelPt } from "@/lib/diary-mood";
import { usePalette } from "@/theme/ThemePaletteContext";
import type { DiaryData } from "@/types/diary";

type MonthInsightsCardProps = {
  selectedYmd: string;
  data: DiaryData;
  collapsible?: boolean;
  initialCollapsed?: boolean;
};

type StatItem = {
  label: string;
  value: string;
};

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function hasAnyMeal(day?: Partial<Record<(typeof MEAL_SLOTS)[number]["id"], string>>) {
  if (!day) return false;
  return MEAL_SLOTS.some((slot) => (day[slot.id] ?? "").trim().length > 0);
}

export function MonthInsightsCard({
  selectedYmd,
  data,
  collapsible = false,
  initialCollapsed = false,
}: MonthInsightsCardProps) {
  const palette = usePalette();
  const parsed = parseYmd(selectedYmd);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  if (!parsed) return null;

  const monthDays = daysInMonth(parsed.year, parsed.month);
  const monthLabelRaw = monthTitlePt(parsed.year, parsed.month);
  const monthLabel = monthLabelRaw.charAt(0).toUpperCase() + monthLabelRaw.slice(1);
  const monthYmds = Array.from({ length: monthDays }, (_, idx) =>
    formatYmd(parsed.year, parsed.month, idx + 1),
  );

  const registeredDays = monthYmds.filter((ymd) => hasAnyMeal(data.days[ymd])).length;
  const progressPct = monthDays > 0 ? (registeredDays / monthDays) * 100 : 0;

  const slotCounts = Object.fromEntries(MEAL_SLOTS.map((slot) => [slot.id, 0])) as Record<
    (typeof MEAL_SLOTS)[number]["id"],
    number
  >;
  const moodValues: number[] = [];
  const weekdayMoodMap = new Map<number, number[]>();

  for (const ymd of monthYmds) {
    const day = data.days[ymd];
    const dayMoods = data.moods[ymd] ?? {};
    for (const slot of MEAL_SLOTS) {
      if ((day?.[slot.id] ?? "").trim()) {
        slotCounts[slot.id] += 1;
      }
      const mood = dayMoods[slot.id];
      if (typeof mood === "number") {
        moodValues.push(mood);
        const weekday = new Date(`${ymd}T12:00:00`).getDay();
        const existing = weekdayMoodMap.get(weekday) ?? [];
        existing.push(mood);
        weekdayMoodMap.set(weekday, existing);
      }
    }
  }

  const sortedSlots = [...MEAL_SLOTS].sort((a, b) => slotCounts[b.id] - slotCounts[a.id]);
  const mostRegistered = sortedSlots[0];
  const leastRegistered = [...sortedSlots].reverse().find((slot) => slotCounts[slot.id] > 0) ?? null;

  const avgMood =
    moodValues.length > 0
      ? moodValues.reduce((sum, mood) => sum + mood, 0) / moodValues.length
      : null;

  let bestWeekday: string | null = null;
  let bestWeekdayAvg = -1;
  weekdayMoodMap.forEach((values, weekday) => {
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    if (avg > bestWeekdayAvg) {
      bestWeekdayAvg = avg;
      bestWeekday = WEEKDAY_LABELS[weekday] ?? null;
    }
  });

  let streak = 0;
  // Ignora o dia atual para não quebrar a sequência logo após virar o dia.
  let cursor = addDaysYmd(todayYmd(), -1);
  while (hasAnyMeal(data.days[cursor])) {
    streak += 1;
    cursor = addDaysYmd(cursor, -1);
  }

  const stats: StatItem[] = [
    { label: "Dias registrados", value: `${registeredDays} de ${monthDays}` },
    { label: "Sequência atual", value: streak > 0 ? `${streak} dia(s)` : "Sem sequência" },
    {
      label: "Refeição mais registrada",
      value: mostRegistered && slotCounts[mostRegistered.id] > 0 ? mostRegistered.label : "Sem dados",
    },
    {
      label: "Refeição menos registrada",
      value: leastRegistered ? leastRegistered.label : "Sem dados",
    },
    {
      label: "Humor médio do mês",
      value: avgMood === null ? "Sem dados" : `${moodLabelPt(avgMood)} (${avgMood.toFixed(1)})`,
    },
    {
      label: "Melhor dia da semana",
      value: bestWeekday ? bestWeekday : "Sem dados",
    },
  ];

  return (
    <Box
      mb={5}
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      bg={palette.surfaceSoft}
      borderWidth="1px"
      borderColor={palette.border}
      boxShadow={palette.cardShadow}
    >
      <Flex justify="space-between" align="center" mb={3} gap={2} flexWrap="wrap">
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color={palette.text}>
          Seu mês em números
        </Text>
        <Flex
          align="center"
          gap={2}
          as={collapsible ? "button" : "div"}
          aria-label={collapsible ? (collapsed ? "Abrir card de insights" : "Fechar card de insights") : undefined}
          onClick={collapsible ? () => setCollapsed((prev) => !prev) : undefined}
          cursor={collapsible ? "pointer" : "default"}
          px={collapsible ? 1.5 : 0}
          py={collapsible ? 1 : 0}
          borderRadius={collapsible ? "md" : "none"}
          _hover={
            collapsible
              ? { bg: palette.navHover }
              : undefined
          }
        >
          <Text fontSize="xs" color={palette.textMuted}>
            {monthLabel}
          </Text>
          {collapsible && (
            <Box color={palette.textMuted} w="18px" h="18px" display="grid" placeItems="center">
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </Box>
          )}
        </Flex>
      </Flex>

      {collapsed ? null : (
        <>
      <Text fontSize="xs" color={palette.textMuted} mb={2}>
        Progresso mensal
      </Text>
      <Box mb={4} h="8px" borderRadius="full" bg={palette.panelMuted} overflow="hidden">
        <Box
          h="100%"
          borderRadius="full"
          bg={palette.emphasis}
          w={`${progressPct <= 0 ? 0 : Math.max(4, Math.min(100, progressPct))}%`}
          transition="width 0.25s ease"
        />
      </Box>

      <Flex wrap="wrap" gap={3}>
        {stats.map((stat) => (
          <Box
            key={stat.label}
            flex={{ base: "1 1 100%", md: "1 1 calc(50% - 6px)" }}
            p={3}
            borderRadius="xl"
            bg={palette.surface}
            borderWidth="1px"
            borderColor={palette.border}
          >
            <Text fontSize="xs" color={palette.textMuted} mb={1}>
              {stat.label}
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color={palette.text}>
              {stat.value}
            </Text>
          </Box>
        ))}
      </Flex>
        </>
      )}
    </Box>
  );
}
