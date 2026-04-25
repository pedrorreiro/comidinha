import { Document, Page, Text } from "@react-pdf/renderer";
import { daysInMonth, formatYmd, longDatePt, monthTitlePt } from "@/lib/dates";
import { DayMealsTable } from "@/lib/pdf/components/DayMealsTable";
import { EmptyMonthState } from "@/lib/pdf/components/EmptyMonthState";
import { ReportHeader } from "@/lib/pdf/components/ReportHeader";
import { styles } from "@/lib/pdf/monthly-report-styles";
import {
  chunk,
  filledSlotsOfDay,
  hasAnyMealInDay,
  monthTitleCapPt,
} from "@/lib/pdf/monthly-report-utils";
import type { DiaryFoodEntry, MealSlotId } from "@/types/diary";

export type MonthlyReportDocumentProps = {
  year: number;
  month: number;
  days: Record<string, Partial<Record<MealSlotId, string>>>;
  entries?: Record<string, Partial<Record<MealSlotId, DiaryFoodEntry[]>>>;
  profileName?: string;
  profileAvatarUrl?: string | null;
};

export function MonthlyReportDocument({
  year,
  month,
  days,
  entries = {},
  profileName,
  profileAvatarUrl,
}: MonthlyReportDocumentProps) {
  const n = daysInMonth(year, month);
  const ymdList = Array.from({ length: n }, (_, i) =>
    formatYmd(year, month, i + 1),
  );
  const filledYmdList = ymdList.filter((ymd) => {
    const dayData = days[ymd];
    const dayEntries = entries[ymd];
    return hasAnyMealInDay(dayData, dayEntries);
  });
  const dayChunks = chunk(filledYmdList, 3);
  const monthTitle = monthTitleCapPt(year, month);
  const displayName = profileName?.trim() || "Usuário";
  const avatarUrl = profileAvatarUrl?.trim() || "";

  return (
    <Document
      title={`Diário alimentar — ${monthTitlePt(year, month)}`}
      author="Diário alimentar"
      language="pt-BR"
    >
      {filledYmdList.length === 0 ? (
        <Page size="A4" style={styles.page}>
          <ReportHeader
            monthTitle={monthTitle}
            filledDaysCount={filledYmdList.length}
            displayName={displayName}
            avatarUrl={avatarUrl}
          />
          <EmptyMonthState />
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
            fixed
          />
        </Page>
      ) : (
        dayChunks.map((chunkYmd, pageIdx) => (
          <Page key={pageIdx} size="A4" style={styles.page}>
            {pageIdx === 0 && (
              <ReportHeader
                monthTitle={monthTitle}
                filledDaysCount={filledYmdList.length}
                displayName={displayName}
                avatarUrl={avatarUrl}
              />
            )}
            {chunkYmd.map((ymd) => {
              const dayNum = Number(ymd.slice(8, 10));
              const dayData = days[ymd];
              const dayTitle = longDatePt(year, month, dayNum);
              const dayTitleCap =
                dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);
              const rows = filledSlotsOfDay(dayData, entries[ymd]).map(
                ({ slot, content, entry }, idx) => ({
                  id: entry ? `${slot.id}-${entry.id}` : `${slot.id}-${idx}`,
                  label: slot.label,
                  content,
                  portion: entry?.portionDescription,
                  calories: entry?.calories,
                }),
              );
              const groupedRows = rows.map((row, idx) => ({
                ...row,
                label: idx > 0 && rows[idx - 1]?.label === row.label ? "" : row.label,
              }));

              return (
                <DayMealsTable
                  key={ymd}
                  dayTitle={dayTitleCap}
                  rows={groupedRows}
                />
              );
            })}
            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
              fixed
            />
          </Page>
        ))
      )}
    </Document>
  );
}
