"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { DiaryBackground } from "@/components/diary/DiaryBackground";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setReady(Boolean(session));
    };

    void boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSave = async () => {
    if (password.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada com sucesso.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir sua senha.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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

      <Box
        w="100%"
        maxW="420px"
        position="relative"
        zIndex={2}
        isolation="isolate"
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        bg="var(--app-input-bg)"
        borderWidth="1px"
        borderColor="var(--app-input-border)"
        boxShadow="0 12px 32px rgba(15, 23, 42, 0.14)"
      >
        <Text fontSize="lg" fontWeight="semibold" color="var(--app-body-fg)" mb={4}>
          Redefinir senha
        </Text>

        {ready ? (
          <Flex direction="column" gap={3}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              borderRadius="lg"
              size="sm"
              bg="var(--app-input-bg)"
              borderColor="var(--app-input-border)"
              color="var(--app-input-fg)"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nova senha"
              borderRadius="lg"
              size="sm"
              bg="var(--app-input-bg)"
              borderColor="var(--app-input-border)"
              color="var(--app-input-fg)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSave();
                }
              }}
            />
            <Button
              size="sm"
              borderRadius="lg"
              loading={loading}
              onClick={() => void handleSave()}
              bg="#3d6ea8"
              color="#f8fafc"
              borderWidth="1px"
              borderColor="#5b8ac2"
              _hover={{ bg: "#4b7ab1", borderColor: "#6a96cc" }}
            >
              Salvar nova senha
            </Button>
          </Flex>
        ) : (
          <Flex direction="column" gap={3}>
            <Text fontSize="sm" color="var(--app-ph)">
              Abra este link diretamente pelo e-mail de recuperação para poder
              definir uma nova senha.
            </Text>
            <Button
              size="sm"
              borderRadius="lg"
              variant="ghost"
              color="var(--app-ph)"
              _hover={{ bg: "rgba(100, 116, 139, 0.14)", color: "var(--app-body-fg)" }}
              onClick={() => router.replace("/")}
            >
              Voltar para login
            </Button>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
