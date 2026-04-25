"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { parseFoodEntriesFromText } from "@/lib/diary-food-entry-parser";
import { parseMoodFromText } from "@/lib/diary-mood";
import type { DiaryData, MealSlotId } from "@/types/diary";

const empty: DiaryData = { v: 1, days: {}, entries: {}, moods: {} };

export function useDiary() {
  const [data, setData] = useState<DiaryData>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      try {
        const res = await fetch("/api/diary", { cache: "no-store" });
        if (res.status === 401) throw new Error("Não autenticado");
        if (!res.ok) throw new Error("Falha ao carregar do Supabase");

        const remote = (await res.json()) as DiaryData;
        if (!active) return;

        startTransition(() => {
          setData({ ...remote, entries: remote.entries ?? {}, moods: remote.moods ?? {} });
          setReady(true);
        });
      } catch {
        if (!active) return;
        startTransition(() => {
          setData(empty);
          setReady(true);
        });
      }
    };

    void boot();
    return () => {
      active = false;
    };
  }, []);

  const setMeal = useCallback(
    (dateYmd: string, slot: MealSlotId, text: string) => {
      const normalized = text.trim() ? text : "";

      setData((prev) => {
        const trimmed = normalized.trim();
        const prevDay = prev.days[dateYmd] ?? {};
        const nextDay = { ...prevDay };

        if (!trimmed) {
          delete nextDay[slot];
        } else {
          nextDay[slot] = normalized;
        }

        const nextDays = { ...prev.days };
        if (Object.keys(nextDay).length === 0) {
          delete nextDays[dateYmd];
        } else {
          nextDays[dateYmd] = nextDay;
        }

        const nextEntries = { ...prev.entries };
        const prevEntryDay = prev.entries[dateYmd] ?? {};
        const nextEntryDay = { ...prevEntryDay };
        const parsedEntries = parseFoodEntriesFromText(dateYmd, slot, normalized);
        const parsedMood = parseMoodFromText(normalized);

        if (parsedEntries.length === 0) {
          delete nextEntryDay[slot];
        } else {
          nextEntryDay[slot] = parsedEntries.map((entry) => ({
            id: `optimistic-${dateYmd}-${slot}-${entry.sortOrder}`,
            foodName: entry.foodName,
            brandName: entry.brandName,
            portionDescription: entry.portionDescription,
            calories: entry.calories,
            moodScore: parsedMood,
          }));
        }

        if (Object.keys(nextEntryDay).length === 0) {
          delete nextEntries[dateYmd];
        } else {
          nextEntries[dateYmd] = nextEntryDay;
        }

        const nextMoods = { ...prev.moods };
        const prevMoodDay = prev.moods[dateYmd] ?? {};
        const nextMoodDay = { ...prevMoodDay };

        if (typeof parsedMood === "number") {
          nextMoodDay[slot] = parsedMood;
        } else {
          delete nextMoodDay[slot];
        }

        if (Object.keys(nextMoodDay).length === 0) {
          delete nextMoods[dateYmd];
        } else {
          nextMoods[dateYmd] = nextMoodDay;
        }

        return { ...prev, days: nextDays, entries: nextEntries, moods: nextMoods };
      });

      void fetch("/api/diary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateYmd, slot, text: normalized }),
      });
    },
    [],
  );

  return { data, setMeal, ready };
}
