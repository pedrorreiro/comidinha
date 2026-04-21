import { MEAL_SLOTS } from "@/constants/meal-slots";
import { monthTitlePt } from "@/lib/dates";
import type { MealSlotId } from "@/types/diary";

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
) {
  return MEAL_SLOTS.map((slot) => ({
    slot,
    content: normalizeSlotContentForPdf(dayData?.[slot.id]),
  })).filter((entry) => entry.content !== "—");
}

export function hasAnyMealInDay(dayData?: Partial<Record<MealSlotId, string>>) {
  if (!dayData) return false;
  return MEAL_SLOTS.some((slot) => (dayData[slot.id] ?? "").trim().length > 0);
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
