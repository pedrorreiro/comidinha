"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || password.length < 6) {
      toast.error("Informe e-mail válido e senha com ao menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        toast.success("Login realizado com sucesso.");
      } else {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        toast.success("Conta criada. Você já pode usar seu diário.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Falha ao autenticar.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      w="100%"
      maxW="420px"
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
      bg="var(--app-input-bg)"
      borderWidth="1px"
      borderColor="var(--app-input-border)"
      boxShadow="0 12px 32px rgba(15, 23, 42, 0.14)"
    >
      <Text fontSize="lg" fontWeight="semibold" color="var(--app-body-fg)" mb={1}>
        {mode === "login" ? "Entrar" : "Criar conta"}
      </Text>
      <Text fontSize="sm" color="var(--app-ph)" mb={5}>
        Cada usuário acessa apenas as próprias refeições.
      </Text>

      <Flex direction="column" gap={3}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          borderRadius="lg"
          size="sm"
          bg="var(--app-input-bg)"
          borderColor="var(--app-input-border)"
          color="var(--app-input-fg)"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha (mín. 6 caracteres)"
          borderRadius="lg"
          size="sm"
          bg="var(--app-input-bg)"
          borderColor="var(--app-input-border)"
          color="var(--app-input-fg)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <Button
          size="sm"
          borderRadius="lg"
          loading={loading}
          onClick={() => void submit()}
          bg="#3d6ea8"
          color="#f8fafc"
          borderWidth="1px"
          borderColor="#5b8ac2"
          _hover={{ bg: "#4b7ab1", borderColor: "#6a96cc" }}
        >
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          borderRadius="lg"
          color="var(--app-ph)"
          _hover={{ bg: "rgba(100, 116, 139, 0.14)", color: "var(--app-body-fg)" }}
          onClick={() =>
            setMode((prev) => (prev === "login" ? "signup" : "login"))
          }
        >
          {mode === "login"
            ? "Não tem conta? Criar agora"
            : "Já tem conta? Fazer login"}
        </Button>
      </Flex>
    </Box>
  );
}
