"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import type { DiaryData, MealSlotId } from "@/types/diary";

const empty: DiaryData = { v: 1, days: {} };

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
          setData(remote);
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

        return { ...prev, days: nextDays };
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
