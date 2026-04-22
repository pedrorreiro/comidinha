"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { driver } from "driver.js";
import type { Driver } from "driver.js";
import "driver.js/dist/driver.css";

export type AppTutorialRef = { start: () => void };

type Props = { run: boolean; onDone: () => void };

/** Retorna o primeiro elemento visível que bate com o seletor. */
function findVisible(selector: string): Element {
  const all = document.querySelectorAll(selector);
  for (const el of all) {
    const h = el as HTMLElement;
    if (h.offsetWidth > 0 && h.offsetHeight > 0) return el;
  }
  // Fallback: retorna o primeiro mesmo que não visível
  const fallback = all[0];
  if (!fallback) throw new Error(`Tutorial: elemento "${selector}" não encontrado.`);
  return fallback;
}

function buildDriver(onDone: () => void): Driver {
  let instance: Driver;

  instance = driver({
    overlayOpacity: 0.4,
    allowClose: false,
    showButtons: ["next", "previous"],
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Próximo →",
    prevBtnText: "← Anterior",
    doneBtnText: "Entendido ✓",
    popoverClass: "sabre-tour-popover",
    onDestroyed: onDone,
    onPopoverRender: (popover, { state }) => {
      const totalSteps = instance.getConfig().steps?.length ?? 0;
      const isLast = (state.activeIndex ?? 0) === totalSteps - 1;

      // Remove botão anterior de iterações passadas
      popover.footer
        .querySelectorAll(".sabre-tour-skip-btn")
        .forEach((el) => el.remove());

      if (isLast) return;

      const btn = document.createElement("button");
      btn.textContent = "Pular tour";
      btn.className = "sabre-tour-skip-btn";
      btn.addEventListener("click", () => instance.destroy());
      // Insere como primeiro filho do grupo de botões (antes de ← e →)
      popover.footerButtons.insertBefore(
        btn,
        popover.footerButtons.firstChild,
      );
    },
    steps: [
      {
        popover: {
          title: "👋 Bem-vindo ao Saborê!",
          description:
            "Este tour rápido mostra as principais funcionalidades do app. Clique em <strong>Próximo</strong> para começar.",
        },
      },
      {
        element: () => findVisible('[data-tutorial="meal-tabs"]'),
        popover: {
          title: "🍽️ Abas de refeição",
          description:
            "Navegue pelos períodos do dia clicando nas abas. O app seleciona automaticamente a aba do horário atual.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: () => findVisible('[data-tutorial="meal-mood-btn"]'),
        popover: {
          title: "😊 Registre o humor",
          description:
            "Toque no emoji para indicar como você se sentiu nesta refeição — útil para identificar padrões ao longo do tempo.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: () => findVisible('[data-tutorial="meal-edit-btn"]'),
        popover: {
          title: "✏️ Adicionar itens",
          description:
            "Clique aqui para editar o que você comeu. É possível adicionar, renomear ou remover itens da refeição.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: () => findVisible('[data-tutorial="calendar-btn"]'),
        popover: {
          title: "📅 Navegar por datas",
          description:
            "Acesse o calendário para consultar ou preencher refeições de outros dias.",
          side: "right",
          align: "start",
        },
      },
      {
        element: () => findVisible('[data-tutorial="quick-add-btn"]'),
        popover: {
          title: "⚡ Adição rápida",
          description:
            "O botão + abre um modo rápido para registrar itens e humor em poucos toques.",
          side: "top",
          align: "end",
        },
      },
      {
        element: () => findVisible('[data-tutorial="profile-btn"]'),
        popover: {
          title: "👤 Perfil",
          description:
            "Aqui você edita nome e foto, exporta o diário em PDF e pode sair da conta.",
          side: "bottom",
          align: "end",
        },
      },
    ],
  });

  return instance;
}

export const AppTutorial = forwardRef<AppTutorialRef, Props>(
  function AppTutorial({ run, onDone }, ref) {
    const driverRef = useRef<Driver | null>(null);

    const start = () => {
      driverRef.current?.destroy();
      driverRef.current = buildDriver(onDone);
      driverRef.current.drive();
    };

    useImperativeHandle(ref, () => ({ start }));

    useEffect(() => {
      if (!run) return;
      const t = setTimeout(start, 900);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [run]);

    useEffect(() => {
      return () => driverRef.current?.destroy();
    }, []);

    return null;
  },
);
