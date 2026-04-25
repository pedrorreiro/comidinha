"use client";

import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { Box, Button, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import type { FoodDetails, FoodSearchResult, FoodServing } from "@/types/food";
import { usePalette } from "@/theme/ThemePaletteContext";

type FoodSearchInputProps = {
  inputRef?: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPickFood: (entry: string) => void;
  placeholder: string;
  size?: "sm" | "md";
  borderRadius?: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

function servingMeta(serving: FoodServing) {
  const metric =
    serving.metricAmount && serving.metricUnit
      ? ` (${formatNumber(serving.metricAmount)} ${serving.metricUnit})`
      : "";
  const calories = serving.calories ? ` - ${Math.round(serving.calories)} kcal` : "";

  return `${serving.description}${metric}${calories}`;
}

function formatFoodEntry(food: FoodDetails, serving?: FoodServing) {
  const brand = food.brandName ? ` (${food.brandName})` : "";
  if (!serving) return `${food.name}${brand}`;

  return `${food.name}${brand} - ${servingMeta(serving)}`;
}

function sortServings(servings: FoodServing[]) {
  return [...servings].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    if (a.description === "100 g" || a.description === "100 ml") return -1;
    if (b.description === "100 g" || b.description === "100 ml") return 1;
    return 0;
  });
}

export function FoodSearchInput({
  inputRef,
  value,
  onChange,
  onKeyDown,
  onPickFood,
  placeholder,
  size = "sm",
  borderRadius = "lg",
}: FoodSearchInputProps) {
  const palette = usePalette();
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDetails | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const query = value.trim();

  useEffect(() => {
    if (query.length < 2) {
      const clearTimeoutId = window.setTimeout(() => {
        setResults([]);
        setSearching(false);
      }, 0);

      return () => window.clearTimeout(clearTimeoutId);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/foods/search?q=${encodeURIComponent(query)}&limit=6`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!res.ok) throw new Error("Falha ao buscar alimentos");

        const payload = (await res.json()) as { foods?: FoodSearchResult[] };
        setResults(payload.foods ?? []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Erro ao buscar alimentos:", err);
        setResults([]);
        setError("Busca indisponível agora.");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const visibleServings = useMemo(
    () => (selectedFood ? sortServings(selectedFood.servings).slice(0, 6) : []),
    [selectedFood],
  );

  const pickResult = async (food: FoodSearchResult) => {
    setLoadingDetailsId(food.id);
    setError(null);

    try {
      const res = await fetch(`/api/foods/details?id=${encodeURIComponent(food.id)}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Falha ao carregar porções");

      const payload = (await res.json()) as { food?: FoodDetails };
      if (!payload.food) throw new Error("Alimento sem detalhes");

      if (payload.food.servings.length === 0) {
        onPickFood(formatFoodEntry(payload.food));
        setResults([]);
        return;
      }

      setSelectedFood(payload.food);
      setResults([]);
    } catch (err) {
      console.error("Erro ao carregar porções:", err);
      setError("Não foi possível carregar as porções.");
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const pickServing = (serving?: FoodServing) => {
    if (!selectedFood) return;
    onPickFood(formatFoodEntry(selectedFood, serving));
    setSelectedFood(null);
    setResults([]);
  };

  return (
    <Box position="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          setSelectedFood(null);
          setError(null);
          onChange(e.target.value);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        borderRadius={borderRadius}
        size={size}
        fontSize="sm"
        autoComplete="off"
      />

      {(searching || results.length > 0 || error || selectedFood) && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          zIndex={20}
          p={2}
          borderRadius="xl"
          bg={palette.surface}
          borderWidth="1px"
          borderColor={palette.border}
          boxShadow={palette.cardShadow}
        >
          {searching && (
            <Flex align="center" gap={2} px={2} py={1.5}>
              <Spinner size="xs" />
              <Text fontSize="xs" color={palette.textMuted}>
                Buscando no FatSecret...
              </Text>
            </Flex>
          )}

          {error && (
            <Text fontSize="xs" color={palette.textMuted} px={2} py={1.5}>
              {error}
            </Text>
          )}

          {!searching && !selectedFood && results.length > 0 && (
            <Flex direction="column" gap={1}>
              {results.map((food) => (
                <Button
                  key={food.id}
                  size="xs"
                  variant="ghost"
                  justifyContent="flex-start"
                  h="auto"
                  py={2}
                  px={2}
                  borderRadius="lg"
                  color={palette.text}
                  loading={loadingDetailsId === food.id}
                  _hover={{ bg: palette.navHover }}
                  onClick={() => void pickResult(food)}
                >
                  <Box textAlign="left">
                    <Text fontSize="xs" fontWeight="semibold">
                      {food.name}
                      {food.brandName ? ` (${food.brandName})` : ""}
                    </Text>
                    {food.description && (
                      <Text fontSize="2xs" color={palette.textMuted} lineClamp={1}>
                        {food.description}
                      </Text>
                    )}
                  </Box>
                </Button>
              ))}
            </Flex>
          )}

          {selectedFood && (
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color={palette.text} mb={1}>
                Escolha uma porção
              </Text>
              <Flex gap={1.5} wrap="wrap">
                {visibleServings.map((serving) => (
                  <Button
                    key={serving.id}
                    size="xs"
                    variant="outline"
                    borderRadius="full"
                    borderColor={palette.border}
                    color={palette.text}
                    _hover={{ bg: palette.navHover }}
                    onClick={() => pickServing(serving)}
                  >
                    {servingMeta(serving)}
                  </Button>
                ))}
                <Button
                  size="xs"
                  variant="ghost"
                  borderRadius="full"
                  color={palette.textMuted}
                  _hover={{ bg: palette.navHover, color: palette.text }}
                  onClick={() => pickServing()}
                >
                  Sem porção
                </Button>
              </Flex>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
