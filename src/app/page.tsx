import { redirect } from "next/navigation";
import { DiaryPage } from "@/components/diary/DiaryPage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return <DiaryPage />;
}
