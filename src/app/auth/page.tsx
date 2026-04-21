import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Flex, Spinner } from "@chakra-ui/react";
import { AuthForm } from "@/components/auth/AuthForm";
import { DiaryBackground } from "@/components/diary/DiaryBackground";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <Flex
      minH="100dvh"
      align="center"
      justify="center"
      px={4}
      position="relative"
      overflow="hidden"
    >
      <DiaryBackground />
      <Suspense
        fallback={
          <Spinner size="lg" color="var(--app-body-fg)" css={{ borderWidth: "2px" }} />
        }
      >
        <AuthForm />
      </Suspense>
    </Flex>
  );
}
