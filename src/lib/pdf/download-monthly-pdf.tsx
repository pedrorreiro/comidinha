import { pdf } from "@react-pdf/renderer";
import type { MealSlotId } from "@/types/diary";
import { MonthlyReportDocument } from "./monthly-report-document";

export async function downloadMonthlyPdf(
  year: number,
  month: number,
  days: Record<string, Partial<Record<MealSlotId, string>>>,
): Promise<void> {
  const blob = await pdf(
    <MonthlyReportDocument year={year} month={month} days={days} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `diario-alimentar-${year}-${String(month).padStart(2, "0")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
