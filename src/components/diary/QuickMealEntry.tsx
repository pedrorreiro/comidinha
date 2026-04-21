"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import type { MealSlotDef } from "@/constants/meal-slots";
import { usePalette } from "@/theme/ThemePaletteContext";
import type { MealSlotId } from "@/types/diary";

type QuickMealEntryProps = {
  slots: MealSlotDef[];
  onAddEntry: (slot: MealSlotId, items: string[], mood: number) => void;
};

export function QuickMealEntry({ slots, onAddEntry }: QuickMealEntryProps) {
  const palette = usePalette();
  const [slot, setSlot] = useState<MealSlotId>(slots[0]?.id ?? "cafe_manha");
  const [mood, setMood] = useState(3);
  const [itemDraft, setItemDraft] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const itemInputRef = useRef<HTMLInputElement | null>(null);

  const normalizeItemText = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toLocaleUpperCase("pt-BR") + trimmed.slice(1);
  };

  const addItem = () => {
    const item = normalizeItemText(itemDraft);
    if (!item) return;
    setItems((prev) => [...prev, item]);
    setItemDraft("");
    itemInputRef.current?.focus();
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) {
      setEditingIdx(null);
      setEditDraft("");
    }
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditDraft(items[idx] ?? "");
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const trimmed = normalizeItemText(editDraft);
    if (!trimmed) return;
    setItems((prev) =>
      prev.map((item, idx) => (idx === editingIdx ? trimmed : item)),
    );
    setEditingIdx(null);
    setEditDraft("");
  };

  const add = () => {
    if (items.length === 0) return;
    onAddEntry(slot, items, mood);
    setItemDraft("");
    setItems([]);
    setEditingIdx(null);
    setEditDraft("");
    itemInputRef.current?.focus();
  };

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderRadius="2xl"
      bg={palette.surfaceSoft}
      borderWidth="1px"
      borderColor={palette.border}
      boxShadow={palette.cardShadow}
    >
      <Text fontSize="sm" fontWeight="semibold" color={palette.text} mb={1}>
        Adição rápida
      </Text>
      <Text fontSize="xs" color={palette.fgSubtle} mb={4}>
        Escolha o momento, o humor e vá adicionando os itens (Enter adiciona).
      </Text>

      <Flex direction="column" gap={3}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          color={palette.textMuted}
          mb={-1}
        >
          Momento da refeição
        </Text>
        <select
          value={slot}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSlot(e.currentTarget.value as MealSlotId)
          }
          style={{
            height: "38px",
            paddingInline: "12px",
            borderRadius: "10px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: palette.border,
            background: palette.panelMuted,
            color: palette.text,
            fontSize: "14px",
          }}
        >
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <Text
          fontSize="xs"
          fontWeight="semibold"
          color={palette.textMuted}
          mb={-1}
        >
          Humor / satisfação
        </Text>
        <select
          value={String(mood)}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setMood(Number(e.currentTarget.value))
          }
          style={{
            height: "38px",
            paddingInline: "12px",
            borderRadius: "10px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: palette.border,
            background: palette.panelMuted,
            color: palette.text,
            fontSize: "14px",
          }}
        >
          <option value="0">😞 Muito ruim</option>
          <option value="1">😕 Ruim</option>
          <option value="2">😐 Médio</option>
          <option value="3">🙂 Bom</option>
          <option value="4">😋 Muito bom</option>
          <option value="5">🤩 Excelente</option>
        </select>

        <Text
          fontSize="xs"
          fontWeight="semibold"
          color={palette.textMuted}
          mb={-1}
        >
          Itens consumidos
        </Text>
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
          placeholder="Ex.: pão integral com ovo"
          borderRadius="lg"
          size="sm"
          fontSize="sm"
        />
        <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
          <Text fontSize="xs" color={palette.textMuted}>
            Itens adicionados: {items.length}
          </Text>
          <Button
            size="xs"
            variant="outline"
            borderRadius="lg"
            borderColor={palette.border}
            color={palette.text}
            _hover={{ bg: palette.navHover }}
            onClick={addItem}
            disabled={!itemDraft.trim()}
          >
            Adicionar item
          </Button>
        </Flex>
        {items.length > 0 && (
          <Box
            p={3}
            borderRadius="lg"
            bg={palette.panelMuted}
            borderWidth="1px"
            borderColor={palette.borderGlow}
          >
            <Flex direction="column" gap={2}>
              {items.map((item, idx) => (
                <Flex
                  key={`${item}-${idx}`}
                  justify="space-between"
                  align="center"
                  gap={3}
                >
                  {editingIdx === idx ? (
                    <Input
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEdit();
                        }
                      }}
                      size="xs"
                      borderRadius="md"
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
                          size="2xs"
                          variant="ghost"
                          color={palette.textMuted}
                          _hover={{ bg: palette.navHover, color: palette.text }}
                          onClick={() => {
                            setEditingIdx(null);
                            setEditDraft("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="2xs"
                          variant="ghost"
                          color={palette.textMuted}
                          _hover={{ bg: palette.navHover, color: palette.text }}
                          onClick={saveEdit}
                        >
                          Salvar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="2xs"
                          variant="ghost"
                          color={palette.textMuted}
                          _hover={{ bg: palette.navHover, color: palette.text }}
                          onClick={() => startEdit(idx)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="2xs"
                          variant="ghost"
                          color={palette.textMuted}
                          _hover={{ bg: palette.navHover, color: palette.text }}
                          onClick={() => removeItem(idx)}
                        >
                          Remover
                        </Button>
                      </>
                    )}
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Box>
        )}

        <Flex justify="flex-end">
          <Button
            size="sm"
            borderRadius="lg"
            onClick={add}
            disabled={items.length === 0}
            bg={palette.navActive}
            color={palette.text}
            borderWidth="1px"
            borderColor={palette.navActiveBorder}
            _hover={{
              bg: palette.navHover,
              borderColor: palette.borderGlow,
            }}
          >
            Adicionar
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
