"use client";

import { Box } from "@chakra-ui/react";

export function DiaryBackground() {
  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={0}
      overflow="hidden"
      pointerEvents="none"
      aria-hidden
      bg="var(--app-body-bg)"
    >
      <Box
        position="absolute"
        top="-20%"
        left="50%"
        w="min(120vw, 900px)"
        css={{ transform: "translateX(-50%)" }}
        h="45vh"
        borderRadius="full"
        bg="radial-gradient(ellipse at 50% 0%, var(--app-mesh-indigo) 0%, transparent 72%)"
        opacity={0.9}
      />
      <Box
        position="absolute"
        top="8%"
        right="-8%"
        w="55vw"
        minW="320px"
        h="40vh"
        borderRadius="full"
        bg="radial-gradient(ellipse at 50% 0%, var(--app-mesh-violet) 0%, transparent 70%)"
        opacity={0.85}
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="38%"
        bg="linear-gradient(to top, var(--app-mesh-teal), transparent)"
        opacity={0.55}
      />
    </Box>
  );
}
