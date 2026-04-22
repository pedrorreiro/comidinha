import type { MealSlotId } from "@/types/diary";

export type MealSlotDef = {
  id: MealSlotId;
  label: string;
  shortLabel: string;
  startHour: number;
  endHour: number;
};

export const MEAL_SLOTS: MealSlotDef[] = [
  {
    id: "cafe_manha",
    label: "Café da manhã",
    shortLabel: "Manhã",
    startHour: 5,
    endHour: 11,
  },
  {
    id: "almoco",
    label: "Almoço",
    shortLabel: "Almoço",
    startHour: 11,
    endHour: 15,
  },
  {
    id: "lanche_tarde",
    label: "Lanche da tarde",
    shortLabel: "Lanche (tarde)",
    startHour: 15,
    endHour: 18,
  },
  {
    id: "jantar",
    label: "Jantar",
    shortLabel: "Jantar",
    startHour: 18,
    endHour: 22,
  },
  {
    id: "ceia",
    label: "Ceia / outro",
    shortLabel: "Ceia",
    startHour: 22,
    endHour: 5,
  },
];

export const getMealSlotForHour = (hour: number): MealSlotId => {
  const normalizedHour = ((hour % 24) + 24) % 24;

  const slot = MEAL_SLOTS.find(({ startHour, endHour }) => {
    if (startHour < endHour) {
      return normalizedHour >= startHour && normalizedHour < endHour;
    }
    // Faixa que cruza meia-noite (ex.: 22:00 -> 05:00)
    return normalizedHour >= startHour || normalizedHour < endHour;
  });

  return slot?.id ?? "cafe_manha";
};

export const getMealSlotForDate = (date = new Date()): MealSlotId =>
  getMealSlotForHour(date.getHours());
