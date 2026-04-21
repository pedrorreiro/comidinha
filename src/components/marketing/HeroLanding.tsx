"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, FileDown, Sparkles, UtensilsCrossed } from "lucide-react";
import { DiaryBackground } from "@/components/diary/DiaryBackground";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const APP_LOGO_SRC = "/logo.png";

const BRAND_BTN = {
  bg: "#3d6ea8",
  color: "#f8fafc",
  borderWidth: "1px",
  borderColor: "#5b8ac2",
  _hover: { bg: "#4b7ab1", borderColor: "#6a96cc" },
} as const;

function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <Box
      className="auth-logo-box"
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="var(--app-input-border)"
      boxShadow="0 8px 24px rgba(15, 23, 42, 0.1)"
      display="grid"
      placeItems="center"
      overflow="hidden"
      flexShrink={0}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={APP_LOGO_SRC}
        alt=""
        width={size}
        height={size}
        style={{
          width: "78%",
          height: "78%",
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
        }}
      />
    </Box>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Box textAlign="center" maxW="640px" mx="auto" mb={{ base: 10, md: 14 }}>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--app-ph)"
        mb={3}
      >
        {eyebrow}
      </Text>
      <Text
        as="h2"
        fontSize={{ base: "2xl", md: "3xl" }}
        fontWeight="bold"
        letterSpacing="-0.03em"
        color="var(--app-body-fg)"
        mb={3}
      >
        {title}
      </Text>
      <Text fontSize={{ base: "md", md: "lg" }} color="var(--app-ph)" lineHeight="tall">
        {subtitle}
      </Text>
    </Box>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Box
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="var(--app-input-border)"
      bg="var(--app-input-bg)"
      boxShadow="0 12px 40px rgba(15, 23, 42, 0.08)"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "0 16px 48px rgba(15, 23, 42, 0.12)",
      }}
    >
      <Flex
        w="44px"
        h="44px"
        borderRadius="xl"
        align="center"
        justify="center"
        bg="rgba(61, 110, 168, 0.18)"
        color="#7aa3d4"
        mb={4}
      >
        <Icon size={22} strokeWidth={1.75} />
      </Flex>
      <Text fontSize="lg" fontWeight="semibold" color="var(--app-body-fg)" mb={2}>
        {title}
      </Text>
      <Text fontSize="sm" color="var(--app-ph)" lineHeight="tall">
        {description}
      </Text>
    </Box>
  );
}

function StepRow({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <Flex gap={4} align="flex-start">
      <Flex
        w="40px"
        h="40px"
        borderRadius="full"
        align="center"
        justify="center"
        flexShrink={0}
        bg="#3d6ea8"
        color="#f8fafc"
        fontWeight="bold"
        fontSize="sm"
      >
        {step}
      </Flex>
      <Box>
        <Text fontWeight="semibold" color="var(--app-body-fg)" mb={1}>
          {title}
        </Text>
        <Text fontSize="sm" color="var(--app-ph)" lineHeight="tall">
          {text}
        </Text>
      </Box>
    </Flex>
  );
}

export function HeroLanding() {
  const router = useRouter();

  const goAuth = () => router.push("/auth");
  const goSignup = () => router.push("/auth?mode=signup");

  return (
    <Box position="relative" minH="100dvh" overflow="hidden">
      <DiaryBackground />

      <Box position="relative" zIndex={2}>
        {/* Barra superior */}
        <Flex
          as="header"
          px={{ base: 4, md: 8 }}
          py={4}
          align="center"
          justify="space-between"
          maxW="1200px"
          mx="auto"
        >
          <Flex align="center" gap={3}>
            <LogoMark size={40} />
            <Text fontSize="lg" fontWeight="bold" letterSpacing="-0.02em" color="var(--app-body-fg)">
              Saborê
            </Text>
          </Flex>
          <Flex align="center" gap={2}>
            <ThemeToggle />
            <Button
              size="sm"
              variant="ghost"
              borderRadius="lg"
              color="var(--app-ph)"
              fontWeight="medium"
              _hover={{ bg: "rgba(100, 116, 139, 0.14)", color: "var(--app-body-fg)" }}
              onClick={goAuth}
            >
              Entrar
            </Button>
          </Flex>
        </Flex>

        {/* Hero */}
        <Box
          as="section"
          px={{ base: 5, md: 10 }}
          pt={{ base: 6, md: 12 }}
          pb={{ base: 16, md: 24 }}
          textAlign="center"
        >
          <Flex direction="column" align="center" maxW="720px" mx="auto">
            <Flex
              align="center"
              gap={2}
              px={3}
              py={1.5}
              borderRadius="full"
              borderWidth="1px"
              borderColor="var(--app-input-border)"
              bg="var(--app-input-bg)"
              mb={8}
            >
              <Sparkles size={14} color="var(--app-ph)" strokeWidth={2} />
              <Text fontSize="xs" fontWeight="medium" color="var(--app-ph)">
                Diário alimentar pensado para o dia a dia
              </Text>
            </Flex>

            <LogoMark size={96} />

            <Text
              as="h1"
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
              fontWeight="bold"
              letterSpacing="-0.04em"
              lineHeight="1.05"
              color="var(--app-body-fg)"
              mt={8}
              mb={4}
            >
              Registre o que você come,{" "}
              <Box as="span" color="#7aa3d4">
                sem complicação
              </Box>
            </Text>

            <Text
              fontSize={{ base: "md", md: "xl" }}
              color="var(--app-ph)"
              lineHeight="tall"
              maxW="560px"
              mb={10}
            >
              O Saborê organiza café da manhã, almoço, lanches e jantar em um só lugar.
              Acompanhe humor por refeição e exporte o mês em PDF para conversar com seu
              nutricionista.
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={3}
              w="100%"
              justify="center"
              maxW="440px"
            >
              <Button
                size="lg"
                borderRadius="xl"
                fontWeight="semibold"
                px={8}
                {...BRAND_BTN}
                onClick={goSignup}
              >
                Começar grátis
              </Button>
              <Button
                size="lg"
                borderRadius="xl"
                variant="outline"
                fontWeight="semibold"
                borderColor="var(--app-input-border)"
                color="var(--app-body-fg)"
                bg="var(--app-input-bg)"
                _hover={{
                  bg: "rgba(100, 116, 139, 0.12)",
                  borderColor: "var(--app-body-fg)",
                }}
                onClick={goAuth}
              >
                Já tenho conta
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Benefícios */}
        <Box
          as="section"
          className="landing-band"
          px={{ base: 5, md: 10 }}
          py={{ base: 14, md: 20 }}
          borderTopWidth="1px"
          borderColor="var(--app-input-border)"
        >
          <Box maxW="1100px" mx="auto">
            <SectionTitle
              eyebrow="Por que usar"
              title="Tudo que importa no seu prato"
              subtitle="Menos fricção, mais consistência. Você foca em anotar; o app cuida da estrutura."
            />
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={6}
              align="stretch"
            >
              <Box flex="1">
                <FeatureCard
                  icon={UtensilsCrossed}
                  title="Refeições do dia"
                  description="Espaço claro para cada momento: manhã, almoço, lanche e jantar, sem planilhas."
                />
              </Box>
              <Box flex="1">
                <FeatureCard
                  icon={CalendarDays}
                  title="Calendário integrado"
                  description="Navegue entre os dias e veja o que já registrou, com visão rápida do mês."
                />
              </Box>
              <Box flex="1">
                <FeatureCard
                  icon={FileDown}
                  title="PDF mensal"
                  description="Exporte um relatório limpo para levar na consulta ou guardar no histórico."
                />
              </Box>
            </Flex>
          </Box>
        </Box>

        {/* Como funciona */}
        <Box as="section" px={{ base: 5, md: 10 }} py={{ base: 14, md: 20 }}>
          <Box maxW="800px" mx="auto">
            <SectionTitle
              eyebrow="Em poucos passos"
              title="Como o Saborê encaixa na sua rotina"
              subtitle="Três etapas simples — da conta criada ao PDF na mão."
            />
            <Flex direction="column" gap={8}>
              <StepRow
                step="1"
                title="Crie sua conta"
                text="Cadastro rápido com e-mail e senha. Seus dados ficam associados só a você."
              />
              <StepRow
                step="2"
                title="Anote ao longo do dia"
                text="Abra o diário, escolha o dia e preencha cada refeição com o que comeu e como se sentiu."
              />
              <StepRow
                step="3"
                title="Exporte quando precisar"
                text="No fim do mês, gere o PDF e compartilhe com quem acompanha sua alimentação."
              />
            </Flex>
          </Box>
        </Box>

        {/* Rodapé */}
        <Box
          as="footer"
          px={{ base: 5, md: 10 }}
          py={8}
          borderTopWidth="1px"
          borderColor="var(--app-input-border)"
        >
          <Flex
            maxW="1100px"
            mx="auto"
            direction={{ base: "column", sm: "row" }}
            align="center"
            justify="space-between"
            gap={4}
          >
            <Flex align="center" gap={2}>
              <LogoMark size={32} />
              <Text fontSize="sm" fontWeight="semibold" color="var(--app-body-fg)">
                Saborê
              </Text>
            </Flex>
            <Text fontSize="xs" color="var(--app-ph)">
              Diário alimentar simples e privado.
            </Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
