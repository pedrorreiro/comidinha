import type { DiaryData } from "@/types/diary";

const STORAGE_KEY = "diario-alimentar-v1";

const emptyState = (): DiaryData => ({ v: 1, days: {} });

export function loadDiary(): DiaryData {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as DiaryData;
    if (parsed?.v !== 1 || typeof parsed.days !== "object" || !parsed.days) {
      return emptyState();
    }
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveDiary(data: DiaryData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}
