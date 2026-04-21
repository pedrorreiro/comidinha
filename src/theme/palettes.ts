/** Tema dos gráficos embutido em cada paleta (escuro / claro) */

export type ChartPalette = {
  grid: string;
  axis: string;
  label: string;
  tooltipBg: string;
  tooltipBorder: string;
  pieStroke: string;
  cursorFill: string;
  readonly series: readonly string[];
};

export type StatAccent = {
  border: string;
  iconBg: string;
  iconColor: string;
  value: string;
};

/** Tabelas e listas (substitui whiteAlpha / gray fixos) */
export type TableTokens = {
  border: string;
  headerFg: string;
  rowHoverBg: string;
  mutedCellFg: string;
  emptyFg: string;
};

export type AppPalette = {
  canvas: string;
  text: string;
  textMuted: string;
  /** Subtítulos / texto de apoio um pouco mais suave que textMuted */
  fgSubtle: string;
  /** Títulos de seção secundários (ex.: «Registrar gasto») */
  headingSub: string;
  table: TableTokens;
  /** Linha de lista com fundo (assinaturas) */
  listRowBg: string;
  listRowHoverBg: string;
  /** Painéis internos (orçamento, inputs em caixa) */
  panelMuted: string;
  /** Fundo «ok» do painel de orçamento livre */
  insightOkBg: string;
  /** Overlay de modal */
  backdrop: string;
  /** Hover em botão secundário do modal */
  controlHoverBg: string;
  /** Mensagem informativa positiva (ex.: dentro do orçamento) */
  infoAccentFg: string;
  meshIndigo: string;
  meshTeal: string;
  meshViolet: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  borderGlow: string;
  sidebarBg: string;
  sidebarBorder: string;
  navActive: string;
  navActiveBorder: string;
  navHover: string;
  logoFill: string;
  logoBorder: string;
  logoIcon: string;
  progressTrack: string;
  progressFill: string;
  statusOn: string;
  emphasis: string;
  cardShadow: string;
  modalShadow: string;
  salaryBoxBg: string;
  /** Fundo de estados vazios (ex.: área tracejada dos gráficos) */
  dashedEmptyBg: string;
  statEntrada: StatAccent;
  statSpent: StatAccent;
  statBalance: StatAccent;
  statLivres: StatAccent;
  chart: ChartPalette;
};

export const darkPalette: AppPalette = {
  canvas: "#0e1118",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  fgSubtle: "rgba(203, 213, 225, 0.72)",
  headingSub: "rgba(241, 245, 249, 0.92)",
  table: {
    border: "rgba(255, 255, 255, 0.1)",
    headerFg: "rgba(248, 250, 252, 0.72)",
    rowHoverBg: "rgba(255, 255, 255, 0.05)",
    mutedCellFg: "#94a3b8",
    emptyFg: "rgba(148, 163, 184, 0.75)",
  },
  listRowBg: "rgba(255, 255, 255, 0.03)",
  listRowHoverBg: "rgba(255, 255, 255, 0.06)",
  panelMuted: "rgba(255, 255, 255, 0.04)",
  insightOkBg: "rgba(100, 145, 200, 0.1)",
  backdrop: "rgba(0, 0, 0, 0.72)",
  controlHoverBg: "rgba(255, 255, 255, 0.08)",
  infoAccentFg: "#a5b4fc",
  meshIndigo: "rgba(100, 145, 205, 0.14)",
  meshTeal: "rgba(75, 140, 130, 0.11)",
  meshViolet: "rgba(130, 115, 175, 0.09)",
  surface: "#161b26",
  surfaceSoft: "#131820",
  border: "rgba(100, 145, 185, 0.18)",
  borderGlow: "rgba(110, 165, 175, 0.14)",
  sidebarBg: "#0f1219",
  sidebarBorder: "rgba(85, 125, 165, 0.16)",
  navActive: "rgba(70, 115, 165, 0.18)",
  navActiveBorder: "rgba(100, 155, 200, 0.28)",
  navHover: "rgba(80, 130, 190, 0.12)",
  logoFill: "linear-gradient(155deg, #1c2535 0%, #182028 100%)",
  logoBorder: "rgba(110, 150, 195, 0.25)",
  logoIcon: "#a8c4e4",
  progressTrack: "rgba(255, 255, 255, 0.07)",
  progressFill: "#5d8aa6",
  statusOn: "#8eb89a",
  emphasis: "#c8dae8",
  cardShadow: "0 2px 10px rgba(5, 15, 35, 0.45)",
  modalShadow: "0 20px 48px rgba(5, 12, 28, 0.58)",
  salaryBoxBg: "rgba(45, 75, 115, 0.14)",
  dashedEmptyBg: "rgba(255, 255, 255, 0.03)",
  statEntrada: {
    border: "rgba(130, 175, 220, 0.42)",
    iconBg: "rgba(120, 165, 210, 0.16)",
    iconColor: "#9ec5eb",
    value: "#d4e5f7",
  },
  statSpent: {
    border: "rgba(200, 130, 155, 0.38)",
    iconBg: "rgba(195, 125, 150, 0.14)",
    iconColor: "#e8b4c4",
    value: "#f3d6de",
  },
  statBalance: {
    border: "rgba(115, 165, 135, 0.4)",
    iconBg: "rgba(110, 160, 130, 0.15)",
    iconColor: "#a8d4b8",
    value: "#d4efe0",
  },
  statLivres: {
    border: "rgba(200, 165, 110, 0.42)",
    iconBg: "rgba(195, 155, 95, 0.14)",
    iconColor: "#e8c896",
    value: "#f2e4c8",
  },
  chart: {
    grid: "rgba(120, 155, 190, 0.1)",
    axis: "#8b9cb8",
    label: "#a8b8d0",
    tooltipBg: "#161b26",
    tooltipBorder: "rgba(120, 160, 200, 0.22)",
    pieStroke: "rgba(148, 163, 184, 0.18)",
    cursorFill: "rgba(255, 255, 255, 0.04)",
    series: [
      "#6b8fae",
      "#7d9e86",
      "#b8889c",
      "#c9a66c",
      "#7d8fb8",
      "#88a89c",
      "#a67d85",
      "#b8a07d",
    ],
  },
};

export const lightPalette: AppPalette = {
  canvas: "#f0f3f9",
  text: "#0f172a",
  textMuted: "#64748b",
  fgSubtle: "#64748b",
  headingSub: "#1e293b",
  table: {
    border: "rgba(15, 23, 42, 0.1)",
    headerFg: "#475569",
    rowHoverBg: "rgba(15, 23, 42, 0.04)",
    mutedCellFg: "#64748b",
    emptyFg: "#94a3b8",
  },
  listRowBg: "rgba(15, 23, 42, 0.03)",
  listRowHoverBg: "rgba(15, 23, 42, 0.06)",
  panelMuted: "rgba(15, 23, 42, 0.04)",
  insightOkBg: "rgba(59, 130, 246, 0.08)",
  backdrop: "rgba(15, 23, 42, 0.45)",
  controlHoverBg: "rgba(15, 23, 42, 0.06)",
  infoAccentFg: "#4338ca",
  meshIndigo: "rgba(70, 110, 180, 0.09)",
  meshTeal: "rgba(60, 130, 120, 0.07)",
  meshViolet: "rgba(110, 95, 155, 0.06)",
  surface: "#ffffff",
  surfaceSoft: "#fafbfd",
  border: "rgba(15, 23, 42, 0.1)",
  borderGlow: "rgba(30, 64, 120, 0.1)",
  sidebarBg: "#eef2f8",
  sidebarBorder: "rgba(15, 23, 42, 0.08)",
  navActive: "rgba(59, 130, 180, 0.14)",
  navActiveBorder: "rgba(37, 99, 235, 0.22)",
  navHover: "rgba(59, 130, 180, 0.1)",
  logoFill: "linear-gradient(155deg, #e8eef8 0%, #dce8f4 100%)",
  logoBorder: "rgba(37, 99, 235, 0.18)",
  logoIcon: "#3d6ea8",
  progressTrack: "rgba(15, 23, 42, 0.08)",
  progressFill: "#4a7a96",
  statusOn: "#4d7c59",
  emphasis: "#1e3a5f",
  cardShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
  modalShadow: "0 24px 48px rgba(15, 23, 42, 0.12)",
  salaryBoxBg: "rgba(59, 130, 180, 0.1)",
  dashedEmptyBg: "rgba(15, 23, 42, 0.04)",
  statEntrada: {
    border: "rgba(59, 130, 246, 0.35)",
    iconBg: "rgba(59, 130, 246, 0.12)",
    iconColor: "#2563eb",
    value: "#1e40af",
  },
  statSpent: {
    border: "rgba(219, 39, 119, 0.32)",
    iconBg: "rgba(219, 39, 119, 0.08)",
    iconColor: "#db2777",
    value: "#9f1239",
  },
  statBalance: {
    border: "rgba(22, 163, 74, 0.35)",
    iconBg: "rgba(22, 163, 74, 0.1)",
    iconColor: "#16a34a",
    value: "#166534",
  },
  statLivres: {
    border: "rgba(217, 119, 6, 0.38)",
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#d97706",
    value: "#92400e",
  },
  chart: {
    grid: "rgba(15, 23, 42, 0.08)",
    axis: "#64748b",
    label: "#475569",
    tooltipBg: "#ffffff",
    tooltipBorder: "rgba(15, 23, 42, 0.12)",
    pieStroke: "rgba(15, 23, 42, 0.1)",
    cursorFill: "rgba(15, 23, 42, 0.06)",
    series: [
      "#4a6fa8",
      "#5a8a62",
      "#a8667a",
      "#b8924a",
      "#5c6ba8",
      "#5c8578",
      "#9a5c68",
      "#a89468",
    ],
  },
};
