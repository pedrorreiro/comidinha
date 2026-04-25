import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { searchFatSecretFoods } from "@/server/fatsecret";

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
  const query = url.searchParams.get("q")?.trim() ?? "";
  const limit = Number(url.searchParams.get("limit") ?? 8);

  if (query.length < 2) {
    return NextResponse.json({ foods: [] });
  }

  try {
    const foods = await searchFatSecretFoods(query, Number.isFinite(limit) ? limit : 8);
    return NextResponse.json({ foods });
  } catch (error) {
    console.error("Erro na busca FatSecret:", error);
    return NextResponse.json(
      { error: "Não foi possível buscar alimentos agora." },
      { status: 502 },
    );
  }
}
