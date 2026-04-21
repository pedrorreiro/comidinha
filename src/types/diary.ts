export type MealSlotId =
  | "cafe_manha"
  | "almoco"
  | "lanche_tarde"
  | "jantar"
  | "ceia";

export type DiaryData = {
  v: 1;
  /** chave YYYY-MM-DD */
  days: Record<string, Partial<Record<MealSlotId, string>>>;
};
