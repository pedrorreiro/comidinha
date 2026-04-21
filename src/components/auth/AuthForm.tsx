"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
const APP_LOGO_SRC = "/logo.png";
const AUTH_TEXT_COLOR = "var(--app-body-fg)";
const AUTH_SUBTLE_TEXT_COLOR = "var(--app-ph)";
const AUTH_FORM_BG = "var(--app-input-bg)";
const AUTH_INPUT_BG = "var(--app-input-bg)";
const AUTH_INPUT_TEXT = "var(--app-input-fg)";
const AUTH_BORDER = "var(--app-input-border)";

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
      className="auth-form"
      w="100%"
      maxW="420px"
      position="relative"
      zIndex={2}
      isolation="isolate"
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
      bg={AUTH_FORM_BG}
      borderWidth="1px"
      borderColor={AUTH_BORDER}
      boxShadow="0 12px 32px rgba(15, 23, 42, 0.14)"
    >
      <div
        data-auth-visible
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "24px",
          opacity: 1,
          visibility: "visible",
        }}
      >
        <div
          className="auth-logo-box"
          data-auth-visible
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "16px",
            marginBottom: "16px",
            border: `1px solid ${AUTH_BORDER}`,
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={APP_LOGO_SRC}
            alt="Logo do Diário Alimentar"
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
            }}
          />
        </div>
        <div
          data-auth-visible
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: AUTH_TEXT_COLOR,
            textAlign: "center",
            display: "block",
            lineHeight: 1.2,
            opacity: 1,
            visibility: "visible",
          }}
        >
          Diário Alimentar
        </div>
      </div>
      <div
        data-auth-visible
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: AUTH_TEXT_COLOR,
          marginBottom: "14px",
          display: "block",
          lineHeight: 1.2,
          opacity: 1,
          visibility: "visible",
        }}
      >
        {mode === "login" ? "Entrar" : "Criar conta"}
      </div>

      <Flex direction="column" gap={3}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          borderRadius="lg"
          size="sm"
          bg={AUTH_INPUT_BG}
          borderColor={AUTH_BORDER}
          color={AUTH_INPUT_TEXT}
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          borderRadius="lg"
          size="sm"
          bg={AUTH_INPUT_BG}
          borderColor={AUTH_BORDER}
          color={AUTH_INPUT_TEXT}
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
          color={AUTH_SUBTLE_TEXT_COLOR}
          _hover={{ bg: "rgba(100, 116, 139, 0.14)", color: AUTH_TEXT_COLOR }}
          onClick={() =>
            setMode((prev) => (prev === "login" ? "signup" : "login"))
          }
        >
          {mode === "login"
            ? "Criar conta"
            : "Já tenho conta"}
        </Button>
      </Flex>
    </Box>
  );
}
