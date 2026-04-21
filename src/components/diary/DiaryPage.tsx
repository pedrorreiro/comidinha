"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FileDown, Plus, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { MEAL_SLOTS } from "@/constants/meal-slots";
import { useDiary } from "@/hooks/useDiary";
import { parseYmd, todayYmd } from "@/lib/dates";
import { downloadMonthlyPdf } from "@/lib/pdf/download-monthly-pdf";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { usePalette } from "@/theme/ThemePaletteContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DiaryBackground } from "./DiaryBackground";
import { DayToolbar } from "./DayToolbar";
import { dateToMonthInput } from "./ExportMonthBar";
import { InlineCalendar } from "./InlineCalendar";
import { QuickMealEntry } from "./QuickMealEntry";
import { TodaySummaryCard } from "./TodaySummaryCard";

export function DiaryPage() {
  const palette = usePalette();
  const router = useRouter();
  const { data, setMeal, ready } = useDiary();
  const [selectedYmd, setSelectedYmd] = useState(todayYmd);
  const [exportMonth, setExportMonth] = useState(() =>
    dateToMonthInput(new Date()),
  );
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const handleSignOut = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/auth");
      router.refresh();
    } catch {
      toast.error("Não foi possível sair agora.");
    }
  }, [router]);


  const parts = useMemo(
    () => parseYmd(selectedYmd) ?? parseYmd(todayYmd())!,
    [selectedYmd],
  );
  const today = todayYmd();
  const isToday = selectedYmd === today;

  const goToday = useCallback(() => {
    setSelectedYmd(todayYmd());
  }, []);

  const handlePickDate = useCallback((ymd: string) => {
    if (parseYmd(ymd)) setSelectedYmd(ymd);
  }, []);

  const handleQuickAdd = useCallback(
    (slot: (typeof MEAL_SLOTS)[number]["id"], items: string[], mood: number) => {
      const previous = (data.days[selectedYmd]?.[slot] ?? "").trim();
      const moodEmoji = ["😞", "😕", "😐", "🙂", "😋", "🤩"][mood] ?? "😐";
      const itemsBlock = items.map((item) => `  - ${item}`).join("\n");
      const newEntries = `• [${moodEmoji}] Refeição\n${itemsBlock}`;
      const next = previous ? `${previous}\n${newEntries}` : newEntries;
      setMeal(selectedYmd, slot, next);

      const slotLabel =
        MEAL_SLOTS.find((s) => s.id === slot)?.label ?? "momento";
      toast.success(
        `Adicionado em ${slotLabel.toLowerCase()} com humor ${moodEmoji}.`,
      );
    },
    [data.days, selectedYmd, setMeal],
  );

  const handleExport = useCallback(async () => {
    const m = /^(\d{4})-(\d{2})$/.exec(exportMonth);
    if (!m) {
      toast.error("Mês inválido.");
      return;
    }
    const year = Number(m[1]);
    const month = Number(m[2]);
    if (!month || month > 12) {
      toast.error("Mês inválido.");
      return;
    }
    setExporting(true);
    try {
      await downloadMonthlyPdf(year, month, data.days);
      toast.success("PDF gerado. Verifique sua pasta de downloads.");
      setExportOpen(false);
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente de novo.");
    } finally {
      setExporting(false);
    }
  }, [data.days, exportMonth]);

  if (!ready) {
    return (
      <Flex
        minH="100dvh"
        align="center"
        justify="center"
        position="relative"
        overflow="hidden"
      >
        <DiaryBackground />
        <Spinner
          size="xl"
          color="var(--app-body-fg)"
          css={{ borderWidth: "2px" }}
        />
      </Flex>
    );
  }

  return (
    <Flex
      minH="100dvh"
      position="relative"
      overflow="hidden"
      direction="column"
    >
      <DiaryBackground />
      <Box
        as="header"
        position="relative"
        zIndex={1}
        px={{ base: 5, md: 10 }}
        pt={{ base: 6, md: 8 }}
        pb={2}
      >
        <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
          <Flex align="center" gap={3}>
            <Flex
              align="center"
              justify="center"
              w="44px"
              h="44px"
              borderRadius="xl"
              bg={palette.logoFill}
              borderWidth="1px"
              borderColor={palette.logoBorder}
              boxShadow={palette.cardShadow}
            >
              <UtensilsCrossed
                size={22}
                color={palette.logoIcon}
                strokeWidth={1.75}
              />
            </Flex>
            <Box>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                letterSpacing="-0.03em"
                color={palette.text}
              >
                Diário alimentar
              </Text>
              <Text fontSize="sm" color={palette.fgSubtle}>
                Registre o dia de hoje; use as setas ou o calendário para outro
                dia
              </Text>
            </Box>
          </Flex>
          <Flex align="center" gap={2}>
            <Button
              size="sm"
              borderRadius="lg"
              gap={2}
              onClick={() => setExportOpen(true)}
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
              Exportar PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderRadius="lg"
              borderColor={palette.border}
              color={palette.text}
              _hover={{ bg: palette.navHover }}
              onClick={() => void handleSignOut()}
            >
              Sair
            </Button>
            <ThemeToggle />
          </Flex>
        </Flex>
      </Box>

      <Box
        as="main"
        flex="1"
        px={{ base: 5, md: 10 }}
        py={{ base: 4, md: 6 }}
        overflowY="auto"
        position="relative"
        zIndex={1}
        pb={{ base: 12, md: 14 }}
        maxW="1700px"
        w="100%"
        mx="auto"
      >
        <Flex
          align="flex-start"
          gap={{ base: 4, lg: 6 }}
          direction={{ base: "column", lg: "row" }}
        >
          <Box
            w={{ base: "100%", lg: "460px" }}
            flexShrink={0}
            position={{ base: "static", lg: "sticky" }}
            top={{ lg: "16px" }}
          >
            <InlineCalendar
              selectedYmd={selectedYmd}
              onSelectDate={handlePickDate}
            />
          </Box>

          <Box flex="1" minW={0}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <DayToolbar
                year={parts.year}
                month={parts.month}
                day={parts.day}
                isToday={isToday}
                onGoToday={goToday}
              />

              <TodaySummaryCard
                ymd={selectedYmd}
                values={data.days[selectedYmd] ?? {}}
                onSaveSlot={(slot, text) => setMeal(selectedYmd, slot, text)}
              />
            </motion.div>
          </Box>
        </Flex>
      </Box>

      <Button
        position="fixed"
        right={{ base: 4, md: 8 }}
        bottom={{ base: 4, md: 8 }}
        zIndex={25}
        w="52px"
        h="52px"
        borderRadius="full"
        p={0}
        onClick={() => setQuickAddOpen(true)}
        bg={palette.navActive}
        color={palette.text}
        borderWidth="1px"
        borderColor={palette.navActiveBorder}
        boxShadow={palette.cardShadow}
        _hover={{ bg: palette.navHover, borderColor: palette.borderGlow }}
        aria-label="Abrir adição rápida"
      >
        <Plus size={22} strokeWidth={2} />
      </Button>

      {quickAddOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={30}
          bg={palette.backdrop}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          onClick={() => setQuickAddOpen(false)}
        >
          <Box
            w="100%"
            maxW="620px"
            onClick={(e) => e.stopPropagation()}
          >
            <QuickMealEntry
              slots={MEAL_SLOTS}
              onAddEntry={(slot, items, mood) => {
                handleQuickAdd(slot, items, mood);
                setQuickAddOpen(false);
              }}
            />
          </Box>
        </Box>
      )}

      {exportOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={30}
          bg={palette.backdrop}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          onClick={() => {
            if (!exporting) setExportOpen(false);
          }}
        >
          <Box
            w="100%"
            maxW="420px"
            bg={palette.surface}
            borderWidth="1px"
            borderColor={palette.border}
            borderRadius="2xl"
            boxShadow={palette.modalShadow}
            p={5}
            onClick={(e) => e.stopPropagation()}
          >
            <Text
              fontSize="md"
              fontWeight="semibold"
              color={palette.text}
              mb={1}
            >
              Exportar PDF
            </Text>
            <Text fontSize="sm" color={palette.fgSubtle} mb={4}>
              Escolha o período (mês) que deseja exportar.
            </Text>

            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={palette.textMuted}
              mb={1}
            >
              Período
            </Text>
            <Input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
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
              size="sm"
              borderRadius="lg"
              mb={5}
              fontVariantNumeric="tabular-nums"
            />

            <Flex justify="flex-end" gap={2}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="lg"
                borderColor={palette.border}
                color={palette.text}
                _hover={{ bg: palette.navHover }}
                onClick={() => setExportOpen(false)}
                disabled={exporting}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                borderRadius="lg"
                loading={exporting}
                loadingText="Gerando…"
                onClick={() => void handleExport()}
                bg={palette.navActive}
                color={palette.text}
                borderWidth="1px"
                borderColor={palette.navActiveBorder}
                _hover={{
                  bg: palette.navHover,
                  borderColor: palette.borderGlow,
                }}
              >
                Exportar
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Flex>
  );
}
