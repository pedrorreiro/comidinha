import type { FoodDetails, FoodSearchResult, FoodServing } from "@/types/food";

const TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
const API_URL = "https://platform.fatsecret.com/rest/server.api";
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

type FatSecretToken = {
  accessToken: string;
  expiresAt: number;
};

type FatSecretServing = {
  serving_id?: string;
  serving_description?: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  calories?: string;
  carbohydrate?: string;
  protein?: string;
  fat?: string;
  is_default?: string;
};

type FatSecretFood = {
  food_id?: string;
  food_name?: string;
  food_type?: string;
  food_url?: string;
  brand_name?: string;
  food_description?: string;
  servings?: {
    serving?: FatSecretServing | FatSecretServing[];
  };
};

type FatSecretSearchResponse = {
  foods?: {
    food?: FatSecretFood | FatSecretFood[];
  };
  error?: {
    code?: string | number;
    message?: string;
  };
};

type FatSecretDetailsResponse = {
  food?: FatSecretFood;
  error?: {
    code?: string | number;
    message?: string;
  };
};

type FatSecretTokenError = {
  error?: string;
  error_description?: string;
};

let tokenCache: FatSecretToken | null = null;

function getCredentials() {
  const clientId = process.env.FATSECRET_CLIENT_ID?.trim();
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais do FatSecret não configuradas.");
  }

  return { clientId, clientSecret };
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeServing(serving: FatSecretServing): FoodServing | null {
  const id = serving.serving_id?.trim();
  const description = serving.serving_description?.trim();

  if (!id || !description) return null;

  return {
    id,
    description,
    metricAmount: toNumber(serving.metric_serving_amount),
    metricUnit: serving.metric_serving_unit?.trim() || null,
    calories: toNumber(serving.calories),
    carbohydrate: toNumber(serving.carbohydrate),
    protein: toNumber(serving.protein),
    fat: toNumber(serving.fat),
    isDefault: serving.is_default === "1",
  };
}

function normalizeServings(food: FatSecretFood): FoodServing[] {
  return toArray(food.servings?.serving)
    .map(normalizeServing)
    .filter((serving): serving is FoodServing => Boolean(serving));
}

function normalizeFood(food: FatSecretFood): FoodSearchResult | null {
  const id = food.food_id?.trim();
  const name = food.food_name?.trim();

  if (!id || !name) return null;

  return {
    id,
    name,
    type: food.food_type?.trim() || null,
    brandName: food.brand_name?.trim() || null,
    description: food.food_description?.trim() || null,
    servings: normalizeServings(food),
  };
}

function assertFatSecretOk<T extends { error?: { code?: string | number; message?: string } }>(
  payload: T,
) {
  if (!payload.error) return;

  const code = payload.error.code ? ` (${payload.error.code})` : "";
  throw new Error(`FatSecret retornou erro${code}: ${payload.error.message ?? "sem detalhes"}`);
}

function getLocalizationParams() {
  const scope = process.env.FATSECRET_SCOPE?.trim() || "basic";
  if (!scope.split(/\s+/).includes("localization")) return {};

  const region = process.env.FATSECRET_REGION?.trim();
  const language = process.env.FATSECRET_LANGUAGE?.trim();

  return {
    ...(region ? { region } : {}),
    ...(region && language ? { language } : {}),
  };
}

async function getAccessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret } = getCredentials();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: process.env.FATSECRET_SCOPE?.trim() || "basic",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const payload = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  } & FatSecretTokenError;

  if (!res.ok) {
    const detail = payload.error_description ?? payload.error;
    throw new Error(
      `Falha ao autenticar no FatSecret (${res.status})${detail ? `: ${detail}` : ""}.`,
    );
  }

  if (!payload.access_token) {
    throw new Error("FatSecret não retornou access_token.");
  }

  const expiresInMs = Math.max(payload.expires_in ?? 0, 60) * 1000;
  tokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + expiresInMs - TOKEN_EXPIRY_BUFFER_MS,
  };

  return tokenCache.accessToken;
}

async function requestFatSecret<T>(params: Record<string, string>) {
  const accessToken = await getAccessToken();
  const body = new URLSearchParams({
    format: "json",
    ...params,
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Falha na chamada ao FatSecret (${res.status}).`);
  }

  return (await res.json()) as T;
}

export async function searchFatSecretFoods(query: string, limit = 8) {
  const payload = await requestFatSecret<FatSecretSearchResponse>({
    method: "foods.search",
    search_expression: query,
    max_results: String(Math.min(Math.max(limit, 1), 20)),
    ...getLocalizationParams(),
  });

  assertFatSecretOk(payload);

  return toArray(payload.foods?.food)
    .map(normalizeFood)
    .filter((food): food is FoodSearchResult => Boolean(food));
}

export async function getFatSecretFoodDetails(foodId: string): Promise<FoodDetails> {
  const payload = await requestFatSecret<FatSecretDetailsResponse>({
    method: "food.get.v4",
    food_id: foodId,
  });

  assertFatSecretOk(payload);

  const food = payload.food ? normalizeFood(payload.food) : null;
  if (!food) {
    throw new Error("Alimento não encontrado no FatSecret.");
  }

  return {
    ...food,
    url: payload.food?.food_url?.trim() || null,
  };
}
