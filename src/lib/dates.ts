export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function todayYmd(): string {
  const t = new Date();
  return formatYmd(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

export function parseYmd(
  ymd: string,
): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!month || month > 12 || !day) return null;
  if (day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/** Avança ou retrocede dias a partir de uma data YYYY-MM-DD. */
export function addDaysYmd(ymd: string, deltaDays: number): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  const dt = new Date(p.year, p.month - 1, p.day + deltaDays);
  return formatYmd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

/** month: 1–12 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function monthTitlePt(year: number, month: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function weekdayShortPt(year: number, month: number, day: number): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(
    new Date(year, month - 1, day),
  );
}

export function longDatePt(year: number, month: number, day: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
