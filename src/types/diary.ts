export type MealSlotId =
  | "cafe_manha"
  | "almoco"
  | "lanche_tarde"
  | "jantar"
  | "ceia";

export type DiaryFoodEntry = {
  id: string;
  foodName: string;
  brandName: string | null;
  portionDescription: string | null;
  calories: number | null;
  moodScore: number | null;
};

export type DiaryData = {
  v: 1;
  /** chave YYYY-MM-DD */
  days: Record<string, Partial<Record<MealSlotId, string>>>;
  entries: Record<string, Partial<Record<MealSlotId, DiaryFoodEntry[]>>>;
  moods: Record<string, Partial<Record<MealSlotId, number>>>;
};
