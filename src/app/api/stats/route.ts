import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min

export type PublicStats = {
  foodEntries: number;
  activeDays: number;
  users: number;
};

function floor(value: number, step: number) {
  return Math.floor(value / step) * step;
}

export async function GET() {
  try {
    const [entriesCount, daysResult, usersResult] = await Promise.all([
      prisma.diaryFoodEntry.count(),
      prisma.diaryFoodEntry.findMany({
        distinct: ["userId", "dateYmd"],
        select: { dateYmd: true },
      }),
      prisma.diaryFoodEntry.findMany({
        distinct: ["userId"],
        select: { userId: true },
      }),
    ]);

    // Arredonda para baixo em múltiplos de 10 para não exibir números exatos.
    const stats: PublicStats = {
      foodEntries: floor(entriesCount, 10),
      activeDays: floor(daysResult.length, 10),
      users: floor(usersResult.length, 5),
    };

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { foodEntries: 0, activeDays: 0, users: 0 } satisfies PublicStats,
      { status: 200 },
    );
  }
}
