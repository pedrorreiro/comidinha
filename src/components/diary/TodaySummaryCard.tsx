"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Coffee,
  Croissant,
  Moon,
  PencilLine,
  Plus,
  Soup,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { getMealSlotForDate, MEAL_SLOTS } from "@/constants/meal-slots";
import { usePalette } from "@/theme/ThemePaletteContext";
import type { MealSlotId } from "@/types/diary";
import { FoodSearchInput } from "./FoodSearchInput";

type TodaySummaryCardProps = {
  ymd: string;
  values: Partial<Record<MealSlotId, string>>;
  onSaveSlot: (slot: MealSlotId, text: string) => void;
};

const MOOD_OPTIONS = [
  { value: 0, emoji: "😞", label: "Muito ruim" },
  { value: 1, emoji: "😕", label: "Ruim" },
  { value: 2, emoji: "😐", label: "Médio" },
  { value: 3, emoji: "🙂", label: "Bom" },
  { value: 4, emoji: "😋", label: "Muito bom" },
  { value: 5, emoji: "🤩", label: "Excelente" },
] as const;

const EMOJI_TO_MOOD: Record<string, number> = {
  "😞": 0,
  "😕": 1,
  "😐": 2,
  "🙂": 3,
  "😋": 4,
  "🤩": 5,
};

const MOBILE_TAB_LABELS: Record<MealSlotId, string> = {
  cafe_manha: "Manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche",
  jantar: "Jantar",
  ceia: "Ceia",
};

const SLOT_ICONS: Record<MealSlotId, LucideIcon> = {
  cafe_manha: Coffee,
  almoco: Soup,
  lanche_tarde: Croissant,
  jantar: UtensilsCrossed,
  ceia: Moon,
};

export function TodaySummaryCard({
  ymd,
  values,
  onSaveSlot,
}: TodaySummaryCardProps) {
  const palette = usePalette();
  const [activeMobileSlot, setActiveMobileSlot] = useState<MealSlotId>(() =>
    getMealSlotForDate(),
  );
  const [editingSlot, setEditingSlot] = useState<MealSlotId | null>(null);
  const [moodPickerSlot, setMoodPickerSlot] = useState<MealSlotId | null>(null);
  const [itemDraft, setItemDraft] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [mood, setMood] = useState(3);
  const itemInputRef = useRef<HTMLInputElement | null>(null);
  const moodPopoverMobileRef = useRef<HTMLDivElement | null>(null);
  const moodPopoverDesktopRef = useRef<HTMLDivElement | null>(null);

  const normalizeItemText = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toLocaleUpperCase("pt-BR") + trimmed.slice(1);
  };

  useEffect(() => {
    if (!moodPickerSlot) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const insideMobile = moodPopoverMobileRef.current?.contains(target);
      const insideDesktop = moodPopoverDesktopRef.current?.contains(target);
      if (insideMobile || insideDesktop) return;
      setMoodPickerSlot(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [moodPickerSlot]);

  useEffect(() => {
    startTransition(() => {
      setActiveMobileSlot(getMealSlotForDate());
      setEditingSlot(null);
      setMoodPickerSlot(null);
      setItemDraft("");
      setItems([]);
      setMood(3);
      setEditingIdx(null);
      setEditDraft("");
    });
  }, [ymd]);

  const switchMobileSlot = (slotId: MealSlotId) => {
    if (editingSlot) closeEdit();
    setMoodPickerSlot(null);
    setActiveMobileSlot(slotId);
  };

  const parseMealText = (text: string): { items: string[]; mood: number } => {
    const moodMatch = text.match(/\[([^\]]+)\]\s*Refeição/i);
    const moodFromEmoji = moodMatch?.[1]
      ? EMOJI_TO_MOOD[moodMatch[1]]
      : undefined;

    const items = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/\]\s*Refeição$/i.test(line))
      .map((line) =>
        line
          .replace(/^[-•]\s*/, "")
          .replace(/^\[[^\]]+\]\s*/, "")
          .trim(),
      )
      .filter(Boolean);

    return {
      items,
      mood: moodFromEmoji ?? 3,
    };
  };

  const serializeItemsToText = (
    list: string[],
    selectedMood: number,
  ): string => {
    const moodEmoji =
      MOOD_OPTIONS.find((option) => option.value === selectedMood)?.emoji ??
      "🙂";
    if (list.length === 0) return `[${moodEmoji}] Refeição`;
    return [`[${moodEmoji}] Refeição`, ...list].join("\n");
  };

  const iconButtonStyle = {
    size: "2xs" as const,
    variant: "ghost" as const,
    borderRadius: "md",
    color: palette.textMuted,
    _hover: { bg: palette.navHover, color: palette.text },
  };

  const startEdit = (slot: MealSlotId) => {
    const parsed = parseMealText(values[slot] ?? "");
    setEditingSlot(slot);
    setItemDraft("");
    setItems(parsed.items);
    setMood(parsed.mood);
    setEditingIdx(null);
    setEditDraft("");
    setTimeout(() => itemInputRef.current?.focus(), 0);
  };

  const closeEdit = () => {
    setEditingSlot(null);
    setMoodPickerSlot(null);
    setItemDraft("");
    setItems([]);
    setMood(3);
    setEditingIdx(null);
    setEditDraft("");
  };

  const persistEditingItems = (nextItems: string[]) => {
    if (!editingSlot) return;
    onSaveSlot(editingSlot, serializeItemsToText(nextItems, mood));
  };

  const addItem = () => {
    if (!editingSlot) return;
    const item = normalizeItemText(itemDraft);
    if (!item) return;
    const nextItems = [...items, item];
    setItems(nextItems);
    persistEditingItems(nextItems);
    setItemDraft("");
    itemInputRef.current?.focus();
  };

  const addPickedFood = (entry: string) => {
    if (!editingSlot) return;
    const item = normalizeItemText(entry);
    if (!item) return;
    const nextItems = [...items, item];
    setItems(nextItems);
    persistEditingItems(nextItems);
    setItemDraft("");
    itemInputRef.current?.focus();
  };

  const removeItem = (idx: number) => {
    if (!editingSlot) return;
    const nextItems = items.filter((_, i) => i !== idx);
    setItems(nextItems);
    persistEditingItems(nextItems);
    if (editingIdx === idx) {
      setEditingIdx(null);
      setEditDraft("");
    }
  };

  const startItemEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditDraft(items[idx] ?? "");
  };

  const saveItemEdit = () => {
    if (!editingSlot || editingIdx === null) return;
    const trimmed = normalizeItemText(editDraft);
    if (!trimmed) return;
    const nextItems = items.map((item, idx) =>
      idx === editingIdx ? trimmed : item,
    );
    setItems(nextItems);
    persistEditingItems(nextItems);
    setEditingIdx(null);
    setEditDraft("");
  };

  const saveMoodFromHeader = (slot: MealSlotId, nextMood: number) => {
    const parsed = parseMealText(values[slot] ?? "");
    onSaveSlot(slot, serializeItemsToText(parsed.items, nextMood));
    setMoodPickerSlot(null);
  };

  const filledSlotsCount = MEAL_SLOTS.reduce((count, slot) => {
    const text = (values[slot.id] ?? "").trim();
    if (!text) return count;
    const parsed = parseMealText(text);
    return parsed.items.length > 0 ? count + 1 : count;
  }, 0);

  return (
    <Box
      pt={{ base: 5, md: 5 }}
      pb={{ base: 5, md: 5 }}
      px={{ base: 5, md: 5 }}
      borderRadius="2xl"
      bg={palette.surfaceSoft}
      borderWidth="1px"
      borderColor={palette.border}
      boxShadow={palette.cardShadow}
      mb={6}
    >
      <Flex
        justify="space-between"
        align="center"
        mb={{ base: 5, md: 4 }}
      >
        <Box>
          <Text
            fontSize={{ base: "md", md: "sm" }}
            fontWeight="semibold"
            color={palette.text}
            mb={0.5}
          >
            Resumo do dia
          </Text>
          <Text fontSize="xs" color={palette.fgSubtle}>
            {filledSlotsCount === 0
              ? "Nenhuma refeição registrada ainda"
              : `${filledSlotsCount} de ${MEAL_SLOTS.length} refeições registradas`}
          </Text>
        </Box>
      </Flex>

      {/* Mobile: tab strip + slot único em foco */}
      <Box display={{ base: "block", md: "none" }}>
        {/* Tab bar estilo React Native */}
        <Flex
          mx={-5}
          mb={6}
          borderBottomWidth="1px"
          borderColor={palette.border}
          data-tutorial="meal-tabs"
        >
          {MEAL_SLOTS.map((slot) => {
            const slotContent = (values[slot.id] ?? "").trim();
            const slotParsed = slotContent ? parseMealText(slotContent) : null;
            const hasMeals = slotParsed ? slotParsed.items.length > 0 : false;
            const slotMood = slotParsed
              ? MOOD_OPTIONS.find((o) => o.value === slotParsed.mood) ??
                MOOD_OPTIONS[3]
              : null;
            const isActiveTab = activeMobileSlot === slot.id;
            const Icon = SLOT_ICONS[slot.id];

            return (
              <Flex
                key={slot.id}
                as="button"
                direction="column"
                align="center"
                justify="center"
                flex="1"
                pt={2}
                pb="10px"
                gap={1}
                position="relative"
                cursor="pointer"
                color={isActiveTab ? palette.text : palette.textMuted}
                borderBottomWidth="2px"
                borderColor={isActiveTab ? palette.text : "transparent"}
                mb="-1px"
                transition="color 0.15s"
                onClick={() => switchMobileSlot(slot.id)}
                aria-current={isActiveTab ? "true" : undefined}
                _focusVisible={{ outline: "none" }}
              >
                {/* Dot indicator de conteúdo */}
                {hasMeals && slotMood && (
                  <Box
                    position="absolute"
                    top="6px"
                    right="calc(50% - 16px)"
                    fontSize="10px"
                    lineHeight="1"
                  >
                    {slotMood.emoji}
                  </Box>
                )}
                <Icon
                  size={22}
                  strokeWidth={isActiveTab ? 2 : 1.5}
                />
                <Text
                  fontSize="10px"
                  fontWeight={isActiveTab ? "semibold" : "normal"}
                  letterSpacing="0.01em"
                >
                  {MOBILE_TAB_LABELS[slot.id]}
                </Text>
              </Flex>
            );
          })}
        </Flex>

        {/* Conteúdo do slot ativo */}
        {(() => {
          const slot = MEAL_SLOTS.find((s) => s.id === activeMobileSlot)!;
          const content = (values[slot.id] ?? "").trim();
          const parsed = parseMealText(content);
          const moodMeta =
            MOOD_OPTIONS.find((option) => option.value === parsed.mood) ??
            MOOD_OPTIONS[3];
          const isEditing = editingSlot === slot.id;

          return (
            <Box>
              {/* Header do slot ativo */}
              <Flex justify="space-between" align="center" mb={4} gap={2}>
                <Text fontSize="md" fontWeight="semibold" color={palette.text}>
                  {slot.label}
                </Text>
                <Flex
                  align="center"
                  gap={2}
                  position="relative"
                  ref={moodPickerSlot === slot.id ? moodPopoverMobileRef : null}
                  data-tutorial="meal-mood-btn"
                >
                  <Button
                    size="2xs"
                    variant="ghost"
                    borderRadius="full"
                    minW="40px"
                    h="36px"
                    p={0}
                    color={palette.textMuted}
                    _hover={{ bg: palette.navHover, color: palette.text }}
                    onClick={() =>
                      setMoodPickerSlot((current) =>
                        current === slot.id ? null : slot.id,
                      )
                    }
                    aria-label={`Alterar satisfação de ${slot.label}`}
                  >
                    <Text as="span" fontSize="xl" lineHeight="1">
                      {moodMeta.emoji}
                    </Text>
                  </Button>
                  {moodPickerSlot === slot.id && (
                    <Box
                      position="absolute"
                      top="44px"
                      right="0"
                      zIndex={10}
                      p={2}
                      borderRadius="xl"
                      bg={palette.surface}
                      borderWidth="1px"
                      borderColor={palette.border}
                      boxShadow={palette.cardShadow}
                    >
                      <Flex gap={1.5} align="center">
                        {MOOD_OPTIONS.map((option) => {
                          const isActive = option.value === moodMeta.value;
                          return (
                            <Button
                              key={option.value}
                              size="2xs"
                              variant={isActive ? "solid" : "ghost"}
                              borderRadius="full"
                              minW="40px"
                              h="36px"
                              p={0}
                              bg={isActive ? palette.navActive : "transparent"}
                              color={isActive ? palette.text : palette.textMuted}
                              _hover={{ bg: palette.navHover, color: palette.text }}
                              onClick={() => saveMoodFromHeader(slot.id, option.value)}
                              aria-label={`Definir satisfação ${option.label}`}
                            >
                              <Text as="span" fontSize="xl" lineHeight="1">
                                {option.emoji}
                              </Text>
                            </Button>
                          );
                        })}
                      </Flex>
                    </Box>
                  )}
                  <Button
                    size="2xs"
                    variant="ghost"
                    borderRadius="md"
                    minW="36px"
                    h="36px"
                    color={palette.textMuted}
                    _hover={{ bg: palette.navHover, color: palette.text }}
                    onClick={() => (isEditing ? closeEdit() : startEdit(slot.id))}
                    aria-label={
                      isEditing
                        ? `Parar edição de ${slot.label}`
                        : `Editar ${slot.label}`
                    }
                    data-tutorial="meal-edit-btn"
                  >
                    {isEditing ? <Check size={15} /> : <PencilLine size={15} />}
                  </Button>
                </Flex>
              </Flex>

              {/* Modo edição */}
              {isEditing ? (
                <Box>
                  <Box mb={2.5}>
                    <FoodSearchInput
                      inputRef={itemInputRef}
                      value={itemDraft}
                      onChange={setItemDraft}
                      onPickFood={addPickedFood}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addItem();
                        }
                      }}
                      placeholder="O que você comeu?"
                      size="md"
                      borderRadius="xl"
                    />
                  </Box>
                  <Button
                    size="sm"
                    borderRadius="xl"
                    onClick={addItem}
                    disabled={!itemDraft.trim()}
                    bg={palette.navActive}
                    color={palette.text}
                    borderWidth="1px"
                    borderColor={palette.navActiveBorder}
                    w="100%"
                    mb={items.length > 0 ? 4 : 0}
                    _hover={{
                      bg: palette.navHover,
                      borderColor: palette.borderGlow,
                    }}
                  >
                    <Plus size={14} />
                    Adicionar
                  </Button>

                  {items.map((item, idx) => (
                    <Flex
                      key={`${item}-${idx}`}
                      py={2.5}
                      justify="space-between"
                      align="center"
                      gap={2}
                    >
                      {editingIdx === idx ? (
                        <Input
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveItemEdit();
                            }
                          }}
                          size="sm"
                          borderRadius="lg"
                          flex="1"
                        />
                      ) : (
                        <Text
                          fontSize="sm"
                          color={palette.text}
                          lineHeight="1.45"
                          flex="1"
                        >
                          {item}
                        </Text>
                      )}
                      <Flex gap={1} flexShrink={0}>
                        {editingIdx === idx ? (
                          <>
                            <Button
                              {...iconButtonStyle}
                              minW="36px"
                              h="36px"
                              aria-label="Cancelar"
                              onClick={() => {
                                setEditingIdx(null);
                                setEditDraft("");
                              }}
                            >
                              <X size={14} />
                            </Button>
                            <Button
                              {...iconButtonStyle}
                              minW="36px"
                              h="36px"
                              aria-label="Salvar"
                              onClick={saveItemEdit}
                            >
                              <Check size={14} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              {...iconButtonStyle}
                              minW="36px"
                              h="36px"
                              aria-label="Editar item"
                              onClick={() => startItemEdit(idx)}
                            >
                              <PencilLine size={14} />
                            </Button>
                            <Button
                              {...iconButtonStyle}
                              minW="36px"
                              h="36px"
                              aria-label="Remover item"
                              onClick={() => removeItem(idx)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        )}
                      </Flex>
                    </Flex>
                  ))}
                </Box>
              ) : (
                /* Modo leitura */
                content ? (
                  <Flex direction="column" gap={2.5}>
                    {parsed.items.map((item, idx) => (
                      <Flex
                        key={`${slot.id}-${idx}-${item}`}
                        align="baseline"
                        gap={2}
                      >
                        <Text
                          as="span"
                          fontSize="xs"
                          color={palette.textMuted}
                          flexShrink={0}
                        >
                          ·
                        </Text>
                        <Text fontSize="sm" color={palette.text} lineHeight="1.5">
                          {item}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Text fontSize="sm" color={palette.textMuted}>
                    Nada registrado
                  </Text>
                )
              )}
            </Box>
          );
        })()}
      </Box>

      {/* Desktop: tab navigation maior + painel único */}
      <Box display={{ base: "none", md: "block" }}>
        <Flex
          gap={2}
          mb={5}
          p={1.5}
          borderRadius="xl"
          bg={palette.surface}
          borderWidth="1px"
          borderColor={palette.border}
          data-tutorial="meal-tabs"
        >
          {MEAL_SLOTS.map((slot) => {
            const slotContent = (values[slot.id] ?? "").trim();
            const slotParsed = slotContent ? parseMealText(slotContent) : null;
            const hasMeals = slotParsed ? slotParsed.items.length > 0 : false;
            const slotMood = slotParsed
              ? MOOD_OPTIONS.find((o) => o.value === slotParsed.mood) ?? MOOD_OPTIONS[3]
              : null;
            const isActiveTab = activeMobileSlot === slot.id;
            const Icon = SLOT_ICONS[slot.id];

            return (
              <Button
                key={slot.id}
                flex="1"
                h="54px"
                borderRadius="lg"
                variant="ghost"
                onClick={() => switchMobileSlot(slot.id)}
                bg={isActiveTab ? palette.navActive : "transparent"}
                borderWidth="1px"
                borderColor={isActiveTab ? palette.navActiveBorder : "transparent"}
                color={isActiveTab ? palette.text : palette.textMuted}
                _hover={{ bg: palette.navHover, color: palette.text }}
                gap={2}
              >
                <Icon size={18} strokeWidth={isActiveTab ? 2 : 1.7} />
                <Text fontSize="sm" fontWeight={isActiveTab ? "semibold" : "medium"}>
                  {MOBILE_TAB_LABELS[slot.id]}
                </Text>
                {hasMeals && slotMood && (
                  <Text as="span" fontSize="sm" lineHeight="1">
                    {slotMood.emoji}
                  </Text>
                )}
              </Button>
            );
          })}
        </Flex>

        {(() => {
          const slot = MEAL_SLOTS.find((s) => s.id === activeMobileSlot)!;
          const content = (values[slot.id] ?? "").trim();
          const parsed = parseMealText(content);
          const moodMeta =
            MOOD_OPTIONS.find((option) => option.value === parsed.mood) ??
            MOOD_OPTIONS[3];
          const isEditing = editingSlot === slot.id;

          return (
            <Box
              p={5}
              borderRadius="xl"
              bg={palette.surface}
              borderWidth="1px"
              borderColor={palette.border}
              boxShadow={palette.cardShadow}
            >
              <Flex justify="space-between" align="center" mb={4} gap={2}>
                <Text fontSize="lg" fontWeight="semibold" color={palette.text}>
                  {slot.label}
                </Text>
                <Flex
                  align="center"
                  gap={2}
                  position="relative"
                  ref={moodPickerSlot === slot.id ? moodPopoverDesktopRef : null}
                  data-tutorial="meal-mood-btn"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    minW="44px"
                    h="36px"
                    px={2}
                    bg={palette.surface}
                    borderColor={palette.border}
                    color={palette.textMuted}
                    _hover={{ bg: palette.navHover, color: palette.text }}
                    onClick={() =>
                      setMoodPickerSlot((current) =>
                        current === slot.id ? null : slot.id,
                      )
                    }
                    aria-label={`Alterar satisfação de ${slot.label}`}
                  >
                    <Text as="span" fontSize="xl" lineHeight="1">
                      {moodMeta.emoji}
                    </Text>
                  </Button>
                  {moodPickerSlot === slot.id && (
                    <Box
                      position="absolute"
                      top="42px"
                      right="0"
                      zIndex={3}
                      p={2}
                      borderRadius="xl"
                      bg={palette.surface}
                      borderWidth="1px"
                      borderColor={palette.border}
                      boxShadow={palette.cardShadow}
                    >
                      <Flex gap={1.5} align="center">
                        {MOOD_OPTIONS.map((option) => {
                          const isActive = option.value === moodMeta.value;
                          return (
                            <Button
                              key={option.value}
                              size="sm"
                              variant={isActive ? "solid" : "ghost"}
                              borderRadius="full"
                              minW="40px"
                              h="36px"
                              p={0}
                              bg={isActive ? palette.navActive : "transparent"}
                              color={isActive ? palette.text : palette.textMuted}
                              _hover={{ bg: palette.navHover, color: palette.text }}
                              onClick={() => saveMoodFromHeader(slot.id, option.value)}
                              aria-label={`Definir satisfação ${option.label}`}
                            >
                              <Text as="span" fontSize="xl" lineHeight="1">
                                {option.emoji}
                              </Text>
                            </Button>
                          );
                        })}
                      </Flex>
                    </Box>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    borderRadius="md"
                    minW="40px"
                    h="36px"
                    color={palette.textMuted}
                    _hover={{ bg: palette.navHover, color: palette.text }}
                    onClick={() => (isEditing ? closeEdit() : startEdit(slot.id))}
                    aria-label={
                      isEditing
                        ? `Parar edição de ${slot.label}`
                        : `Editar ${slot.label}`
                    }
                    data-tutorial="meal-edit-btn"
                  >
                    {isEditing ? <Check size={16} /> : <PencilLine size={16} />}
                  </Button>
                </Flex>
              </Flex>

              {isEditing ? (
                <Box>
                  <Flex gap={2} mb={3} align="center">
                    <Box flex="1">
                      <FoodSearchInput
                        inputRef={itemInputRef}
                        value={itemDraft}
                        onChange={setItemDraft}
                        onPickFood={addPickedFood}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addItem();
                          }
                        }}
                        placeholder="Adicionar item da refeição"
                        size="md"
                        borderRadius="lg"
                      />
                    </Box>
                    <Button
                      size="sm"
                      borderRadius="lg"
                      onClick={addItem}
                      disabled={!itemDraft.trim()}
                      bg={palette.navActive}
                      color={palette.text}
                      borderWidth="1px"
                      borderColor={palette.navActiveBorder}
                      _hover={{ bg: palette.navHover, borderColor: palette.borderGlow }}
                    >
                      <Plus size={15} />
                      Adicionar
                    </Button>
                  </Flex>

                  {items.length > 0 && (
                    <Text fontSize="sm" color={palette.textMuted} mb={2}>
                      Itens: {items.length}
                    </Text>
                  )}

                  {items.length > 0 && (
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={palette.surface}
                      borderWidth="1px"
                      borderColor={palette.border}
                      mb={1}
                    >
                      <Flex direction="column" gap={2.5}>
                        {items.map((item, idx) => (
                          <Flex
                            key={`${item}-${idx}`}
                            justify="space-between"
                            align="center"
                            gap={2}
                            p={2.5}
                            borderRadius="md"
                            bg={palette.panelMuted}
                            borderWidth="1px"
                            borderColor={palette.border}
                          >
                            {editingIdx === idx ? (
                              <Input
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    saveItemEdit();
                                  }
                                }}
                                size="sm"
                                borderRadius="md"
                                bg={palette.surface}
                              />
                            ) : (
                              <Text fontSize="sm" color={palette.text} lineHeight="1.45">
                                {item}
                              </Text>
                            )}
                            <Flex gap={1} flexShrink={0}>
                              {editingIdx === idx ? (
                                <>
                                  <Button {...iconButtonStyle} aria-label="Cancelar edição do item" onClick={() => { setEditingIdx(null); setEditDraft(""); }}>
                                    <X size={14} />
                                  </Button>
                                  <Button {...iconButtonStyle} aria-label="Salvar item" onClick={saveItemEdit}>
                                    <Check size={14} />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button {...iconButtonStyle} aria-label="Editar item" onClick={() => startItemEdit(idx)}>
                                    <PencilLine size={14} />
                                  </Button>
                                  <Button {...iconButtonStyle} aria-label="Remover item" onClick={() => removeItem(idx)}>
                                    <Trash2 size={14} />
                                  </Button>
                                </>
                              )}
                            </Flex>
                          </Flex>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  {content ? (
                    <Flex direction="column" gap={2.5}>
                      {parsed.items.map((item, idx) => (
                        <Flex key={`${slot.id}-${idx}-${item}`} align="baseline" gap={2}>
                          <Text as="span" fontSize="sm" color={palette.textMuted} flexShrink={0}>
                            ·
                          </Text>
                          <Text fontSize="md" color={palette.text} lineHeight="1.55">
                            {item}
                          </Text>
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    <Text fontSize="md" color={palette.textMuted}>
                      Nada registrado
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          );
        })()}
      </Box>
    </Box>
  );
}
