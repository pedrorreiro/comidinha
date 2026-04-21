import { NextResponse } from "next/server";
import { MEAL_SLOTS } from "@/constants/meal-slots";
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

  const data = await prisma.diaryMeal.findMany({
    where: { userId: user.id },
    select: { dateYmd: true, slot: true, content: true },
    orderBy: [{ dateYmd: "asc" }, { slot: "asc" }],
  });

  const days: DiaryData["days"] = {};
  for (const row of data) {
    const slot = row.slot as MealSlotId;
    const day = days[row.dateYmd] ?? {};
    day[slot] = row.content;
    days[row.dateYmd] = day;
  }

  return NextResponse.json({ v: 1, days } satisfies DiaryData);
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
    await prisma.diaryMeal.deleteMany({
      where: { userId: user.id, dateYmd, slot },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.diaryMeal.upsert({
    where: {
      userId_dateYmd_slot: { userId: user.id, dateYmd, slot },
    },
    create: {
      userId: user.id,
      dateYmd,
      slot,
      content: text,
      updatedAt: new Date(),
    },
    update: {
      content: text,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
