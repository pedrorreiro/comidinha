export type FoodServing = {
  id: string;
  description: string;
  metricAmount: number | null;
  metricUnit: string | null;
  calories: number | null;
  carbohydrate: number | null;
  protein: number | null;
  fat: number | null;
  isDefault: boolean;
};

export type FoodSearchResult = {
  id: string;
  name: string;
  type: string | null;
  brandName: string | null;
  description: string | null;
  servings: FoodServing[];
};

export type FoodDetails = FoodSearchResult & {
  url: string | null;
};
