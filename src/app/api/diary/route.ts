import { NextResponse } from "next/server";
import { MEAL_SLOTS } from "@/constants/meal-slots";
import { parseFoodEntriesFromText } from "@/lib/diary-food-entry-parser";
import { moodToEmoji, parseMoodFromText } from "@/lib/diary-mood";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DiaryData, MealSlotId } from "@/types/diary";
import { prisma } from "@/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const foodEntries = await prisma.diaryFoodEntry.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      dateYmd: true,
      slot: true,
      foodName: true,
      brandName: true,
      portionDescription: true,
      calories: true,
      moodScore: true,
    },
    orderBy: [{ dateYmd: "asc" }, { slot: "asc" }, { sortOrder: "asc" }],
  });

  const days: DiaryData["days"] = {};
  const moods: DiaryData["moods"] = {};
  const entries: DiaryData["entries"] = {};
  for (const row of foodEntries) {
    const slot = row.slot as MealSlotId;
    const day = entries[row.dateYmd] ?? {};
    const slotEntries = day[slot] ?? [];
    slotEntries.push({
      id: row.id,
      foodName: row.foodName,
      brandName: row.brandName,
      portionDescription: row.portionDescription,
      calories: row.calories,
      moodScore: row.moodScore,
    });
    day[slot] = slotEntries;
    entries[row.dateYmd] = day;

    const moodDay = moods[row.dateYmd] ?? {};
    if (typeof row.moodScore === "number" && typeof moodDay[slot] !== "number") {
      moodDay[slot] = row.moodScore;
      moods[row.dateYmd] = moodDay;
    }
  }

  for (const [dateYmd, dayEntries] of Object.entries(entries)) {
    const day = days[dateYmd] ?? {};
    for (const slot of MEAL_SLOTS) {
      const slotEntries = dayEntries[slot.id] ?? [];
      if (slotEntries.length === 0) continue;

      const mood = moods[dateYmd]?.[slot.id];
      const header = `[${moodToEmoji(mood)}] Refeição`;
      const lines = slotEntries.map((entry) => {
        const base = entry.brandName
          ? `${entry.foodName} (${entry.brandName})`
          : entry.foodName;
        const extras = [
          entry.portionDescription ?? null,
          typeof entry.calories === "number" ? `${Math.round(entry.calories)} kcal` : null,
        ].filter(Boolean);
        return extras.length > 0 ? `${base} - ${extras.join(" - ")}` : base;
      });
      day[slot.id] = [header, ...lines].join("\n");
    }
    days[dateYmd] = day;
  }

  return NextResponse.json({ v: 1, days, entries, moods } satisfies DiaryData);
}

type PutPayload = {
  dateYmd?: string;
  slot?: string;
  text?: string;
};

export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = (await req.json()) as PutPayload;
  const dateYmd = body.dateYmd?.trim();
  const slot = body.slot?.trim() ?? "";
  const text = body.text ?? "";

  if (!dateYmd || !/^\d{4}-\d{2}-\d{2}$/.test(dateYmd)) {
    return NextResponse.json({ error: "dateYmd inválido" }, { status: 400 });
  }

  if (!MEAL_SLOTS.some((mealSlot) => mealSlot.id === slot)) {
    return NextResponse.json({ error: "slot inválido" }, { status: 400 });
  }

  const trimmed = text.trim();
  if (!trimmed) {
    await prisma.diaryFoodEntry.deleteMany({
      where: { userId: user.id, dateYmd, slot },
    });
    return NextResponse.json({ ok: true });
  }

  const foodEntries = parseFoodEntriesFromText(dateYmd, slot as MealSlotId, text);
  const moodScore = parseMoodFromText(text);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.diaryFoodEntry.deleteMany({
      where: { userId: user.id, dateYmd, slot },
    });

    if (foodEntries.length > 0) {
      await tx.diaryFoodEntry.createMany({
        data: foodEntries.map((entry) => ({
          userId: user.id,
          dateYmd: entry.dateYmd,
          slot: entry.slot,
          sortOrder: entry.sortOrder,
          foodName: entry.foodName,
          brandName: entry.brandName,
          portionDescription: entry.portionDescription,
          calories: entry.calories,
          moodScore,
          updatedAt: now,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
