import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFatSecretFoodDetails } from "@/server/fatsecret";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const foodId = url.searchParams.get("id")?.trim();

  if (!foodId) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  try {
    const food = await getFatSecretFoodDetails(foodId);
    return NextResponse.json({ food });
  } catch (error) {
    console.error("Erro nos detalhes FatSecret:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as porções do alimento." },
      { status: 502 },
    );
  }
}
