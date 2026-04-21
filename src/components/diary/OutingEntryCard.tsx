"use client";

import { useRef, useState } from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { usePalette } from "@/theme/ThemePaletteContext";

type OutingEntryCardProps = {
  onAddOuting: (place: string, foods: string[]) => void;
};

export function OutingEntryCard({ onAddOuting }: OutingEntryCardProps) {
  const palette = usePalette();
  const [place, setPlace] = useState("");
  const [itemDraft, setItemDraft] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const itemInputRef = useRef<HTMLInputElement | null>(null);

  const addItem = () => {
    const item = itemDraft.trim();
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
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    setItems((prev) =>
      prev.map((item, idx) => (idx === editingIdx ? trimmed : item)),
    );
    setEditingIdx(null);
    setEditDraft("");
  };

  const add = () => {
    const p = place.trim();
    if (!p || items.length === 0) return;
    onAddOuting(p, items);
    setPlace("");
    setItemDraft("");
    setItems([]);
    setEditingIdx(null);
    setEditDraft("");
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
        Registrar refeição fora de casa
      </Text>
      <Text fontSize="xs" color={palette.fgSubtle} mb={4}>
        Informe onde foi e adicione vários itens. Pressione Enter para incluir.
      </Text>

      <Flex direction="column" gap={3}>
        <Input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Onde foi? (ex.: Sorveteria)"
          borderRadius="lg"
          size="sm"
        />
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
          placeholder="Item consumido (ex.: milk-shake de morango)"
          borderRadius="lg"
          size="sm"
          fontSize="sm"
        />
        <Text fontSize="xs" color={palette.textMuted} mt={-1}>
          Dica: Enter adiciona o item rapidamente.
        </Text>
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
                      • {item}
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
            disabled={!place.trim() || items.length === 0}
            bg={palette.navActive}
            color={palette.text}
            borderWidth="1px"
            borderColor={palette.navActiveBorder}
            _hover={{
              bg: palette.navHover,
              borderColor: palette.borderGlow,
            }}
          >
            Salvar refeição fora
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
