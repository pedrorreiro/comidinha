import { MEAL_SLOTS, type MealSlotDef } from "@/constants/meal-slots";
import { monthTitlePt } from "@/lib/dates";
import type { DiaryFoodEntry, MealSlotId } from "@/types/diary";

export type PdfMealRow = {
  slot: MealSlotDef;
  content: string;
  entry: DiaryFoodEntry | null;
};

export function normalizeSlotContentForPdf(raw?: string): string {
  const text = raw?.trim();
  if (!text) return "—";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/\]\s*Refeição$/i.test(line))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length === 0) return "—";
  return lines.map((line) => `• ${line}`).join("\n");
}

export function filledSlotsOfDay(
  dayData?: Partial<Record<MealSlotId, string>>,
  dayEntries?: Partial<Record<MealSlotId, DiaryFoodEntry[]>>,
): PdfMealRow[] {
  return MEAL_SLOTS.flatMap((slot) => {
    const entries = dayEntries?.[slot.id] ?? [];
    if (entries.length > 0) {
      const rows: PdfMealRow[] = entries.map((entry) => ({
        slot,
        entry,
        content: entry.brandName
          ? `${entry.foodName} (${entry.brandName})`
          : entry.foodName,
      }));
      return rows;
    }

    const content = normalizeSlotContentForPdf(dayData?.[slot.id]);
    if (content === "—") return [];
    return [{ slot, content, entry: null } satisfies PdfMealRow];
  });
}

export function hasAnyMealInDay(
  dayData?: Partial<Record<MealSlotId, string>>,
  dayEntries?: Partial<Record<MealSlotId, DiaryFoodEntry[]>>,
) {
  return MEAL_SLOTS.some(
    (slot) =>
      (dayData?.[slot.id] ?? "").trim().length > 0 ||
      (dayEntries?.[slot.id]?.length ?? 0) > 0,
  );
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function monthTitleCapPt(year: number, month: number) {
  const title = monthTitlePt(year, month);
  return title.charAt(0).toUpperCase() + title.slice(1);
}
