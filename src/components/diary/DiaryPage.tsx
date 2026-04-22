"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, FileDown, Plus, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { MEAL_SLOTS } from "@/constants/meal-slots";
import { useDiary } from "@/hooks/useDiary";
import { parseYmd, todayYmd } from "@/lib/dates";
import { downloadMonthlyPdf } from "@/lib/pdf/download-monthly-pdf";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { usePalette } from "@/theme/ThemePaletteContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  AppTutorial,
  type AppTutorialRef,
} from "@/components/tutorial/AppTutorial";
import { DiaryBackground } from "./DiaryBackground";
import { DayToolbar } from "./DayToolbar";
import { dateToMonthInput } from "./ExportMonthBar";
import { InlineCalendar } from "./InlineCalendar";
import { QuickMealEntry } from "./QuickMealEntry";
import { TodaySummaryCard } from "./TodaySummaryCard";

export function DiaryPage() {
  const APP_LOGO_SRC = "/logo.png";
  const palette = usePalette();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { data, setMeal, ready } = useDiary();
  const [selectedYmd, setSelectedYmd] = useState(todayYmd);
  const [exportMonth, setExportMonth] = useState(() =>
    dateToMonthInput(new Date()),
  );
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const tutorialRef = useRef<AppTutorialRef | null>(null);
  const [runTutorial, setRunTutorial] = useState(false);

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message.trim()) return error.message;
    return "Erro inesperado.";
  };

  const TUTORIAL_KEY = "sabre_tutorial_v1_seen";

  useEffect(() => {
    if (localStorage.getItem(TUTORIAL_KEY) !== "true") {
      setRunTutorial(true);
    }
  }, []);

  const handleTutorialDone = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    setRunTutorial(false);
  }, []);

  useEffect(() => {
    const bootProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      const displayName = String(user.user_metadata?.display_name ?? "").trim();
      const imageUrl = String(user.user_metadata?.avatar_url ?? "").trim();
      const imagePath = String(user.user_metadata?.avatar_path ?? "").trim();
      setProfileName(displayName);
      setProfileEmail(user.email ?? "");
      setAvatarUrl(imageUrl || null);
      setAvatarPath(imagePath || null);
    };

    void bootProfile();
  }, [supabase]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (accountMenuRef.current?.contains(target)) return;
      setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [accountMenuOpen]);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
      toast.error(`Não foi possível sair agora. ${getErrorMessage(error)}`);
    }
  }, [router, supabase]);

  const handleProfileSave = useCallback(async () => {
    setProfileSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: profileName.trim(),
          avatar_url: avatarUrl ?? null,
          avatar_path: avatarPath ?? null,
        },
      });
      if (error) throw error;
      toast.success("Perfil atualizado.");
      setProfileOpen(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error(`Não foi possível salvar o perfil. ${getErrorMessage(error)}`);
    } finally {
      setProfileSaving(false);
    }
  }, [avatarPath, avatarUrl, profileName, supabase]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      setAvatarUploading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão inválida");

        const previousPath =
          avatarPath ??
          String(user.user_metadata?.avatar_path ?? "").trim() ??
          "";
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (previousPath && previousPath !== filePath) {
          const { error: removeError } = await supabase.storage
            .from("avatars")
            .remove([previousPath]);
          if (removeError) {
            // Não bloqueia o fluxo principal em caso de falha de remoção.
            console.warn("Falha ao remover avatar antigo:", removeError.message);
          }
        }

        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            avatar_url: publicData.publicUrl,
            avatar_path: filePath,
          },
        });
        if (metadataError) throw metadataError;

        setAvatarPath(filePath);
        setAvatarUrl(publicData.publicUrl);
        toast.success("Foto enviada.");
      } catch (error) {
        console.error("Erro ao enviar foto de perfil:", error);
        toast.error(
          `Falha ao enviar foto. ${getErrorMessage(error)} Verifique o bucket 'avatars'.`,
        );
      } finally {
        setAvatarUploading(false);
      }
    },
    [avatarPath, supabase],
  );


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
      await downloadMonthlyPdf(year, month, data.days, {
        name: profileName,
        avatarUrl,
      });
      toast.success("PDF gerado. Verifique sua pasta de downloads.");
      setExportOpen(false);
    } catch (error) {
      console.error("Erro ao gerar PDF mensal:", error);
      toast.error(`Não foi possível gerar o PDF. ${getErrorMessage(error)}`);
    } finally {
      setExporting(false);
    }
  }, [avatarUrl, data.days, exportMonth, profileName]);

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
      <AppTutorial ref={tutorialRef} run={runTutorial} onDone={handleTutorialDone} />
      <Box
        as="header"
        position="relative"
        zIndex={50}
        px={{ base: 3.5, sm: 5, md: 10 }}
        pt={{ base: 4, md: 8 }}
        pb={2}
      >
        <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
          <Flex align="center" gap={3} pr={{ base: "128px", md: 0 }}>
            <Flex
              align="center"
              justify="center"
              w={{ base: "38px", md: "44px" }}
              h={{ base: "38px", md: "44px" }}
              borderRadius="xl"
              bg={palette.logoFill}
              borderWidth="1px"
              borderColor={palette.logoBorder}
              boxShadow={palette.cardShadow}
              overflow="hidden"
            >
              <Image src={APP_LOGO_SRC} alt="Saborê" w="100%" h="100%" objectFit="cover" />
            </Flex>
            <Box>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="semibold"
                letterSpacing="-0.03em"
                color={palette.text}
              >
                Saborê
              </Text>
              <Text
                display={{ base: "none", md: "block" }}
                fontSize="sm"
                color={palette.fgSubtle}
              >
                Registre o dia de hoje; use as setas ou o calendário para outro
                dia
              </Text>
            </Box>
          </Flex>
          <Flex
            align="center"
            gap={{ base: 1.5, md: 2 }}
            position={{ base: "absolute", md: "relative" }}
            top={{ base: "14px", md: "auto" }}
            right={{ base: "14px", md: "auto" }}
          >
            {/* Calendário no header — só mobile */}
            <Button
              display={{ base: "inline-flex", lg: "none" }}
              size="xs"
              borderRadius="lg"
              onClick={() => setMobileCalendarOpen(true)}
              bg={palette.navActive}
              color={palette.text}
              borderWidth="1px"
              borderColor={palette.navActiveBorder}
              _hover={{ bg: palette.navHover, borderColor: palette.borderGlow }}
              minW="34px"
              w="34px"
              h="34px"
              p={0}
              aria-label="Abrir calendário"
              data-tutorial="calendar-btn"
            >
              <CalendarDays size={16} strokeWidth={1.75} />
            </Button>
            {/* Exportar PDF — só desktop, no header */}
            <Button
              display={{ base: "none", md: "inline-flex" }}
              size="sm"
              borderRadius="lg"
              gap={2}
              onClick={() => setExportOpen(true)}
              bg={palette.navActive}
              color={palette.text}
              borderWidth="1px"
              borderColor={palette.navActiveBorder}
              _hover={{ bg: palette.navHover, borderColor: palette.borderGlow }}
              h="36px"
              px={3}
              fontWeight="semibold"
            >
              <FileDown size={16} strokeWidth={1.75} />
              Exportar PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderRadius="full"
              borderColor={palette.border}
              color={palette.text}
              _hover={{ bg: palette.navHover }}
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              p={0}
              minW={{ base: "34px", md: "38px" }}
              w={{ base: "34px", md: "38px" }}
              h={{ base: "34px", md: "38px" }}
              overflow="hidden"
              data-tutorial="profile-btn"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Foto de perfil"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              ) : (
                <Flex align="center" justify="center" w="100%" h="100%">
                  <UserRound size={16} />
                </Flex>
              )}
            </Button>
            <ThemeToggle />
            {accountMenuOpen && (
              <Box
                ref={accountMenuRef}
                position="absolute"
                top={{ base: "40px", md: "44px" }}
                right={0}
                zIndex={9999}
                bg={palette.surface}
                borderWidth="1px"
                borderColor={palette.border}
                borderRadius="xl"
                boxShadow={palette.cardShadow}
                p={3}
                minW="220px"
              >
                <Text fontSize="xs" color={palette.textMuted} mb={2}>
                  {profileEmail || "Sem e-mail"}
                </Text>
                <Flex direction="column" gap={2}>
                  <Button
                    size="xs"
                    variant="outline"
                    borderRadius="lg"
                    borderColor={palette.border}
                    color={palette.text}
                    _hover={{ bg: palette.navHover }}
                    onClick={() => {
                      setProfileOpen(true);
                      setAccountMenuOpen(false);
                    }}
                  >
                    Editar perfil
                  </Button>
                  <Button
                    display={{ base: "inline-flex", md: "none" }}
                    size="xs"
                    variant="outline"
                    borderRadius="lg"
                    gap={1.5}
                    borderColor={palette.border}
                    color={palette.text}
                    _hover={{ bg: palette.navHover }}
                    onClick={() => {
                      setExportOpen(true);
                      setAccountMenuOpen(false);
                    }}
                    data-tutorial="export-btn"
                  >
                    <FileDown size={13} strokeWidth={1.75} />
                    Exportar PDF
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    borderRadius="lg"
                    gap={1.5}
                    borderColor={palette.border}
                    color={palette.text}
                    _hover={{ bg: palette.navHover }}
                    onClick={() => {
                      setAccountMenuOpen(false);
                      tutorialRef.current?.start();
                    }}
                  >
                    <BookOpen size={13} strokeWidth={1.75} />
                    Ver tour
                  </Button>
                  <Button
                    size="xs"
                    borderRadius="lg"
                    bg={palette.navActive}
                    color={palette.text}
                    borderWidth="1px"
                    borderColor={palette.navActiveBorder}
                    _hover={{ bg: palette.navHover, borderColor: palette.borderGlow }}
                    onClick={() => void handleSignOut()}
                  >
                    Sair
                  </Button>
                </Flex>
              </Box>
            )}
          </Flex>
        </Flex>
      </Box>

      <Box
        as="main"
        flex="1"
        px={{ base: 3.5, sm: 5, md: 10 }}
        py={{ base: 3, md: 6 }}
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
            maxW={{ base: "390px", lg: "460px" }}
            mx={{ base: "auto", lg: 0 }}
            flexShrink={0}
            display={{ base: "none", lg: "block" }}
            position={{ base: "static", lg: "sticky" }}
            top={{ lg: "16px" }}
            data-tutorial="calendar-btn"
          >
            <InlineCalendar
              selectedYmd={selectedYmd}
              onSelectDate={handlePickDate}
            />
          </Box>

          <Box flex="1" minW={0} w="100%">
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
        data-tutorial="quick-add-btn"
        bg="#ffffff"
        color="#0f172a"
        borderWidth="1px"
        borderColor="rgba(15, 23, 42, 0.14)"
        boxShadow="0 16px 28px rgba(15, 23, 42, 0.2)"
        _hover={{ bg: "#f8fafc", borderColor: "rgba(15, 23, 42, 0.22)" }}
        aria-label="Abrir adição rápida"
      >
        <Plus size={22} strokeWidth={2} color="#0f172a" />
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

      {mobileCalendarOpen && (
        <Box
          display={{ base: "flex", lg: "none" }}
          position="fixed"
          inset={0}
          zIndex={30}
          bg={palette.backdrop}
          alignItems="center"
          justifyContent="center"
          px={4}
          onClick={() => setMobileCalendarOpen(false)}
        >
          <Box
            position="relative"
            w="100%"
            maxW="420px"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              position="absolute"
              top={2}
              right={2}
              zIndex={2}
              size="xs"
              variant="ghost"
              borderRadius="full"
              minW="30px"
              w="30px"
              h="30px"
              p={0}
              color={palette.textMuted}
              _hover={{ bg: palette.navHover, color: palette.text }}
              onClick={() => setMobileCalendarOpen(false)}
              aria-label="Fechar calendário"
            >
              <X size={16} />
            </Button>
            <InlineCalendar
              selectedYmd={selectedYmd}
              onSelectDate={(ymd) => {
                handlePickDate(ymd);
                setMobileCalendarOpen(false);
              }}
            />
          </Box>
        </Box>
      )}

      {profileOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={35}
          bg={palette.backdrop}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          onClick={() => setProfileOpen(false)}
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
            <Text fontSize="md" fontWeight="semibold" color={palette.text} mb={1}>
              Meu perfil
            </Text>
            <Text fontSize="sm" color={palette.fgSubtle} mb={4}>
              Defina seu nome e foto de perfil.
            </Text>

            <Flex align="center" gap={3} mb={4}>
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                overflow="hidden"
                borderWidth="1px"
                borderColor={palette.border}
                bg={palette.surfaceSoft}
                align="center"
                justify="center"
                flexShrink={0}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                ) : (
                  <UserRound size={22} />
                )}
              </Flex>
              <Button
                as="label"
                size="sm"
                borderRadius="lg"
                variant="outline"
                borderColor={palette.border}
                color={palette.text}
                _hover={{ bg: palette.navHover }}
                loading={avatarUploading}
              >
                Enviar foto
                <Input
                  type="file"
                  accept="image/*"
                  display="none"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleAvatarUpload(file);
                    e.currentTarget.value = "";
                  }}
                />
              </Button>
            </Flex>

            <Text fontSize="xs" color={palette.textMuted} mb={1}>
              Nome
            </Text>
            <Input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Seu nome"
              borderRadius="lg"
              size="sm"
              mb={4}
            />

            <Text fontSize="xs" color={palette.textMuted} mb={1}>
              E-mail
            </Text>
            <Input value={profileEmail} size="sm" borderRadius="lg" mb={5} disabled />

            <Flex justify="flex-end" gap={2}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="lg"
                borderColor={palette.border}
                color={palette.text}
                _hover={{ bg: palette.navHover }}
                onClick={() => setProfileOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                borderRadius="lg"
                bg={palette.navActive}
                color={palette.text}
                borderWidth="1px"
                borderColor={palette.navActiveBorder}
                _hover={{ bg: palette.navHover, borderColor: palette.borderGlow }}
                onClick={() => void handleProfileSave()}
                loading={profileSaving}
              >
                Salvar
              </Button>
            </Flex>
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
              lang="pt-BR"
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
