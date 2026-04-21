import type { MealSlotId } from "@/types/diary";

export type MealSlotDef = {
  id: MealSlotId;
  label: string;
  shortLabel: string;
};

export const MEAL_SLOTS: MealSlotDef[] = [
  { id: "cafe_manha", label: "Café da manhã", shortLabel: "Manhã" },
  { id: "almoco", label: "Almoço", shortLabel: "Almoço" },
  {
    id: "lanche_tarde",
    label: "Lanche da tarde",
    shortLabel: "Lanche (tarde)",
  },
  { id: "jantar", label: "Jantar", shortLabel: "Jantar" },
  { id: "ceia", label: "Ceia / outro", shortLabel: "Ceia" },
];
