import { DiaryPage } from "@/components/diary/DiaryPage";
import { HeroLanding } from "@/components/marketing/HeroLanding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <HeroLanding />;
  }

  return <DiaryPage />;
}
