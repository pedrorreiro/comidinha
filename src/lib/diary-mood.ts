const EMOJI_TO_MOOD: Record<string, number> = {
  "😞": 0,
  "😕": 1,
  "😐": 2,
  "🙂": 3,
  "😋": 4,
  "🤩": 5,
};

const MOOD_TO_EMOJI: Record<number, string> = {
  0: "😞",
  1: "😕",
  2: "😐",
  3: "🙂",
  4: "😋",
  5: "🤩",
};

export function parseMoodFromText(text: string): number | null {
  const match = text.match(/\[([^\]]+)\]\s*Refeição/i);
  if (!match?.[1]) return null;
  const mood = EMOJI_TO_MOOD[match[1]];
  return typeof mood === "number" ? mood : null;
}

export function moodLabelPt(score: number): string {
  if (score >= 4.5) return "Excelente";
  if (score >= 3.5) return "Muito bom";
  if (score >= 2.5) return "Bom";
  if (score >= 1.5) return "Médio";
  if (score >= 0.5) return "Ruim";
  return "Muito ruim";
}

export function moodToEmoji(score: number | null | undefined): string {
  if (typeof score !== "number") return "🙂";
  return MOOD_TO_EMOJI[Math.round(score)] ?? "🙂";
}
