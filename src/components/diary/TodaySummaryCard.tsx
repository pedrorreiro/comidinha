"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Input, SimpleGrid, Text } from "@chakra-ui/react";
import { Check, PencilLine, Plus, Trash2, X } from "lucide-react";
import { MEAL_SLOTS } from "@/constants/meal-slots";
import { usePalette } from "@/theme/ThemePaletteContext";
import type { MealSlotId } from "@/types/diary";

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

export function TodaySummaryCard({
  ymd,
  values,
  onSaveSlot,
}: TodaySummaryCardProps) {
  const palette = usePalette();
  const [editingSlot, setEditingSlot] = useState<MealSlotId | null>(null);
  const [moodPickerSlot, setMoodPickerSlot] = useState<MealSlotId | null>(null);
  const [itemDraft, setItemDraft] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [mood, setMood] = useState(3);
  const itemInputRef = useRef<HTMLInputElement | null>(null);
  const moodPopoverRef = useRef<HTMLDivElement | null>(null);

  const normalizeItemText = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toLocaleUpperCase("pt-BR") + trimmed.slice(1);
  };

  useEffect(() => {
    if (!moodPickerSlot) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (moodPopoverRef.current?.contains(target)) return;
      setMoodPickerSlot(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [moodPickerSlot]);

  useEffect(() => {
    startTransition(() => {
      setEditingSlot(null);
      setMoodPickerSlot(null);
      setItemDraft("");
      setItems([]);
      setMood(3);
      setEditingIdx(null);
      setEditDraft("");
    });
  }, [ymd]);

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
    if (list.length === 0) return "";
    const moodEmoji =
      MOOD_OPTIONS.find((option) => option.value === selectedMood)?.emoji ??
      "🙂";
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
    if (parsed.items.length === 0) {
      setMoodPickerSlot(null);
      return;
    }
    onSaveSlot(slot, serializeItemsToText(parsed.items, nextMood));
    setMoodPickerSlot(null);
  };

  return (
    <Box
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      bg={palette.surfaceSoft}
      borderWidth="1px"
      borderColor={palette.border}
      boxShadow={palette.cardShadow}
      mb={6}
    >
      <Text fontSize="sm" fontWeight="semibold" color={palette.text} mb={1}>
        Resumo do dia
      </Text>
      <Text fontSize="xs" color={palette.fgSubtle} mb={3}>
        Registros de {ymd}
      </Text>

      <Box p={0}>
        <SimpleGrid
          columns={{ base: 1, md: 2, xl: 3 }}
          columnGap={{ base: 3, md: 4 }}
          rowGap={{ base: 3, md: 4 }}
        >
          {MEAL_SLOTS.map((slot) => {
            const content = (values[slot.id] ?? "").trim();
            const parsed = parseMealText(content);
            const moodMeta =
              MOOD_OPTIONS.find((option) => option.value === parsed.mood) ??
              MOOD_OPTIONS[3];
            return (
              <Box
                key={slot.id}
                p={{ base: 3.5, md: 4 }}
                borderRadius="xl"
                bg={palette.surface}
                borderWidth="1px"
                borderColor={palette.border}
                boxShadow={palette.cardShadow}
              >
                <Flex justify="space-between" align="center" mb={3} gap={2}>
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    color={palette.textMuted}
                  >
                    {slot.shortLabel}
                  </Text>
                  <Flex
                    align="center"
                    gap={1.5}
                    position="relative"
                    ref={moodPickerSlot === slot.id ? moodPopoverRef : null}
                  >
                    <Button
                      size="2xs"
                      variant="outline"
                      borderRadius="full"
                      minW="36px"
                      h="30px"
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
                      <Text as="span" fontSize="lg" lineHeight="1">
                        {moodMeta.emoji}
                      </Text>
                    </Button>
                    {moodPickerSlot === slot.id && editingSlot !== slot.id && (
                      <Box
                        position="absolute"
                        top="30px"
                        right="0"
                        zIndex={3}
                        p={1.5}
                        borderRadius="xl"
                        bg={palette.surface}
                        borderWidth="1px"
                        borderColor={palette.border}
                        boxShadow={palette.cardShadow}
                      >
                        <Flex gap={1} align="center">
                          {MOOD_OPTIONS.map((option) => {
                            const isActive = option.value === moodMeta.value;
                            return (
                              <Button
                                key={option.value}
                                size="2xs"
                                variant={isActive ? "solid" : "ghost"}
                                borderRadius="full"
                                minW="34px"
                                h="30px"
                                p={0}
                                bg={
                                  isActive ? palette.navActive : "transparent"
                                }
                                color={
                                  isActive ? palette.text : palette.textMuted
                                }
                                _hover={{
                                  bg: palette.navHover,
                                  color: palette.text,
                                }}
                                onClick={() =>
                                  saveMoodFromHeader(slot.id, option.value)
                                }
                                aria-label={`Definir satisfação ${option.label}`}
                              >
                                <Text as="span" fontSize="lg" lineHeight="1">
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
                      minW="auto"
                      px={2}
                      h="26px"
                      color={palette.textMuted}
                      _hover={{ bg: palette.navHover, color: palette.text }}
                      onClick={() => {
                        if (editingSlot === slot.id) {
                          closeEdit();
                          return;
                        }
                        startEdit(slot.id);
                      }}
                      aria-label={
                        editingSlot === slot.id
                          ? `Parar edição de ${slot.label}`
                          : `Editar ${slot.label}`
                      }
                    >
                      {editingSlot === slot.id ? (
                        <Check size={13} />
                      ) : (
                        <PencilLine size={13} />
                      )}
                    </Button>
                  </Flex>
                </Flex>
                {editingSlot === slot.id ? (
                <Box pl={2}>
                    <Flex gap={2} mb={2.5} align="center">
                      <Input
                        ref={itemInputRef}
                        value={itemDraft}
                        onChange={(e) => setItemDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addItem();
                          }
                        }}
                        placeholder="Adicionar item da refeição"
                        size="sm"
                        borderRadius="lg"
                        fontSize="sm"
                        bg={palette.surface}
                        borderColor={palette.border}
                        _focusVisible={{
                          borderColor: palette.borderGlow,
                          boxShadow: "none",
                        }}
                      />
                      <Button
                        size="xs"
                        borderRadius="lg"
                        onClick={addItem}
                        disabled={!itemDraft.trim()}
                        bg={palette.navActive}
                        color={palette.text}
                        borderWidth="1px"
                        borderColor={palette.navActiveBorder}
                        _hover={{
                          bg: palette.navHover,
                          borderColor: palette.borderGlow,
                        }}
                      >
                        <Plus size={14} />
                        Adicionar
                      </Button>
                    </Flex>

                    <Flex
                      justify="space-between"
                      align="center"
                      gap={2}
                      mb={2.5}
                    >
                      <Text fontSize="xs" color={palette.textMuted}>
                        Itens: {items.length}
                      </Text>
                    </Flex>
                    {items.length > 0 && (
                      <Box
                        p={3}
                        borderRadius="lg"
                        bg={palette.surface}
                        borderWidth="1px"
                        borderColor={palette.border}
                        mb={3}
                      >
                        <Flex direction="column" gap={2.5}>
                          {items.map((item, idx) => (
                            <Flex
                              key={`${item}-${idx}`}
                              justify="space-between"
                              align="center"
                              gap={2}
                              p={2}
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
                                  size="xs"
                                  borderRadius="md"
                                  bg={palette.surface}
                                />
                              ) : (
                                <Text fontSize="sm" color={palette.text}>
                                  {item}
                                </Text>
                              )}
                              <Flex gap={1}>
                                {editingIdx === idx ? (
                                  <>
                                    <Button
                                      {...iconButtonStyle}
                                      aria-label="Cancelar edição do item"
                                      onClick={() => {
                                        setEditingIdx(null);
                                        setEditDraft("");
                                      }}
                                    >
                                      <X size={14} />
                                    </Button>
                                    <Button
                                      {...iconButtonStyle}
                                      aria-label="Salvar item"
                                      onClick={saveItemEdit}
                                    >
                                      <Check size={14} />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      {...iconButtonStyle}
                                      aria-label="Editar item"
                                      onClick={() => startItemEdit(idx)}
                                    >
                                      <PencilLine size={14} />
                                    </Button>
                                    <Button
                                      {...iconButtonStyle}
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
                        </Flex>
                      </Box>
                    )}
                </Box>
                ) : (
                <Box pl={2}>
                    {content ? (
                      <Flex direction="column" gap={2}>
                        {parsed.items.map((item, idx) => (
                          <Box
                            key={`${slot.id}-${idx}-${item}`}
                            px={2.5}
                            py={1.5}
                            borderRadius="md"
                            bg={palette.surface}
                            borderWidth="1px"
                            borderColor={palette.border}
                          >
                            <Text
                              fontSize="sm"
                              color={palette.text}
                              lineHeight="1.4"
                            >
                              {item}
                            </Text>
                          </Box>
                        ))}
                      </Flex>
                    ) : (
                      <Text fontSize="sm" color={palette.textMuted}>
                        — Nada registrado
                      </Text>
                    )}
                </Box>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
