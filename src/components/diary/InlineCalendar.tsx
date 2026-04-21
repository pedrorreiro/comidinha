"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { daysInMonth, formatYmd, parseYmd, todayYmd } from "@/lib/dates";
import { usePalette } from "@/theme/ThemePaletteContext";

type InlineCalendarProps = {
  selectedYmd: string;
  onSelectDate: (ymd: string) => void;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function InlineCalendar({
  selectedYmd,
  onSelectDate,
}: InlineCalendarProps) {
  const palette = usePalette();
  const selected = useMemo(
    () => parseYmd(selectedYmd) ?? parseYmd(todayYmd())!,
    [selectedYmd],
  );

  const [viewYear, setViewYear] = useState(selected.year);
  const [viewMonth, setViewMonth] = useState(selected.month);

  const firstDayOffset = new Date(viewYear, viewMonth - 1, 1).getDay();
  const total = daysInMonth(viewYear, viewMonth);
  const today = todayYmd();
  const yearOptions = Array.from(
    { length: 13 },
    (_, i) => selected.year - 6 + i,
  );

  const goPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 1) {
        setViewYear((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 12) {
        setViewYear((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  };

  return (
    <Box
      p={{ base: 3, md: 4 }}
      mb={{ base: 4, md: 6 }}
      borderRadius="2xl"
      bg={palette.surfaceSoft}
      borderWidth="1px"
      borderColor={palette.border}
      boxShadow={palette.cardShadow}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="sm" fontWeight="semibold" color={palette.text}>
          Calendário
        </Text>
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        gap={{ base: 1.5, md: 2 }}
        mb={{ base: 2, md: 3 }}
        flexWrap="wrap"
      >
        <Flex align="center" gap={{ base: 1, md: 2 }}>
          <IconButton
            aria-label="Mês anterior"
            variant="outline"
            size="xs"
            borderRadius="lg"
            borderColor={palette.border}
            color={palette.text}
            _hover={{ bg: palette.navHover }}
            onClick={goPrevMonth}
          >
            <ChevronLeft size={14} />
          </IconButton>
          <select
            value={String(viewMonth)}
            onChange={(e) => setViewMonth(Number(e.currentTarget.value))}
            style={{
              height: "26px",
              paddingInline: "8px",
              borderRadius: "8px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: palette.border,
              background: "transparent",
              color: palette.text,
              fontSize: "11px",
            }}
          >
            {MONTHS_PT.map((label, idx) => (
              <option key={label} value={String(idx + 1)}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={String(viewYear)}
            onChange={(e) => setViewYear(Number(e.currentTarget.value))}
            style={{
              height: "26px",
              paddingInline: "8px",
              borderRadius: "8px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: palette.border,
              background: "transparent",
              color: palette.text,
              fontSize: "11px",
            }}
          >
            {yearOptions.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
          <IconButton
            aria-label="Próximo mês"
            variant="outline"
            size="xs"
            borderRadius="lg"
            borderColor={palette.border}
            color={palette.text}
            _hover={{ bg: palette.navHover }}
            onClick={goNextMonth}
          >
            <ChevronRight size={14} />
          </IconButton>
        </Flex>
        <Button
          size={{ base: "2xs", md: "xs" }}
          borderRadius="lg"
          bg={palette.navActive}
          color={palette.text}
          borderWidth="1px"
          borderColor={palette.navActiveBorder}
          _hover={{ bg: palette.navHover, borderColor: palette.borderGlow }}
          onClick={() => {
            const t = parseYmd(today);
            if (!t) return;
            setViewYear(t.year);
            setViewMonth(t.month);
            onSelectDate(today);
          }}
        >
          Ir para hoje
        </Button>
      </Flex>

      <Grid templateColumns="repeat(7, minmax(0, 1fr))" gap={{ base: 1.5, md: 2 }}>
        {WEEKDAYS.map((d) => (
          <GridItem key={d}>
            <Text
              display={{ base: "none", sm: "block" }}
              fontSize="xs"
              textAlign="center"
              color={palette.textMuted}
              fontWeight="semibold"
            >
              {d}
            </Text>
            <Text
              display={{ base: "block", sm: "none" }}
              fontSize="10px"
              textAlign="center"
              color={palette.textMuted}
              fontWeight="semibold"
            >
              {d.charAt(0)}
            </Text>
          </GridItem>
        ))}

        {Array.from({ length: firstDayOffset }).map((_, idx) => (
          <GridItem key={`empty-${idx}`} />
        ))}

        {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
          const ymd = formatYmd(viewYear, viewMonth, day);
          const isSelected = ymd === selectedYmd;
          const isToday = ymd === today;

          return (
            <GridItem key={ymd}>
              <Button
                size="xs"
                w="100%"
                minW={0}
                h={{ base: "26px", md: "30px" }}
                borderRadius="md"
                variant={isSelected ? "solid" : "outline"}
                bg={isSelected ? palette.navActive : "transparent"}
                borderColor={
                  isSelected ? palette.navActiveBorder : palette.border
                }
                color={isSelected ? palette.text : palette.textMuted}
                _hover={{ bg: palette.navHover, color: palette.text }}
                onClick={() => onSelectDate(ymd)}
              >
                {day}
                {isToday ? " •" : ""}
              </Button>
            </GridItem>
          );
        })}
      </Grid>
    </Box>
  );
}
