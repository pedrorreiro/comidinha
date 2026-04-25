import type { DiaryFoodEntry, MealSlotId } from "@/types/diary";

type ParsedFoodEntry = {
  foodName: string;
  brandName: string | null;
  portionDescription: string | null;
  calories: number | null;
};

export type PersistableFoodEntry = ParsedFoodEntry & {
  dateYmd: string;
  slot: MealSlotId;
  sortOrder: number;
};

const CALORIES_RE = /(?:^|\s-\s)(\d+(?:[,.]\d+)?)\s*kcal\b/i;

function parseNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function splitFoodAndBrand(rawName: string) {
  const match = rawName.match(/^(.*?)\s+\(([^)]+)\)$/);
  if (!match) return { foodName: rawName.trim(), brandName: null };

  return {
    foodName: match[1]?.trim() || rawName.trim(),
    brandName: match[2]?.trim() || null,
  };
}

export function parseFoodEntryLine(line: string): ParsedFoodEntry | null {
  const cleaned = line
    .trim()
    .replace(/^[-•]\s*/, "")
    .replace(/^\[[^\]]+\]\s*/, "")
    .trim();

  if (!cleaned || /\]\s*Refeição$/i.test(cleaned) || /^Refeição$/i.test(cleaned)) return null;

  const parts = cleaned.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
  const namePart = parts[0];
  if (!namePart) return null;

  const caloriesMatch = cleaned.match(CALORIES_RE);
  const { foodName, brandName } = splitFoodAndBrand(namePart);
  const portionDescription =
    parts
      .slice(1)
      .filter((part) => !/^\d+(?:[,.]\d+)?\s*kcal\b/i.test(part))
      .join(" - ")
      .trim() || null;

  return {
    foodName,
    brandName,
    portionDescription,
    calories: parseNumber(caloriesMatch?.[1]),
  };
}

export function parseFoodEntriesFromText(
  dateYmd: string,
  slot: MealSlotId,
  text: string,
): PersistableFoodEntry[] {
  return text
    .split("\n")
    .map(parseFoodEntryLine)
    .filter((entry): entry is ParsedFoodEntry => Boolean(entry))
    .map((entry, index) => ({
      ...entry,
      dateYmd,
      slot,
      sortOrder: index,
    }));
}
