import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { MEAL_SLOTS } from "@/constants/meal-slots";
import {
  daysInMonth,
  formatYmd,
  monthTitlePt,
  longDatePt,
} from "@/lib/dates";
import type { MealSlotId } from "@/types/diary";

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  reportHeader: {
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  reportTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  reportSubtitle: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 8.5,
    color: "#64748b",
    marginBottom: 5,
  },
  reportNote: {
    fontSize: 8.5,
    color: "#64748b",
    lineHeight: 1.35,
    maxWidth: 430,
  },
  dayBlock: {
    marginBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: "#6f94c0",
    paddingLeft: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dayTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 7,
    color: "#0f172a",
  },
  dayTable: {
    borderWidth: 1,
    borderColor: "#dbe4ef",
    borderRadius: 6,
    overflow: "hidden",
    marginLeft: 2,
  },
  slotRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e8eef6",
  },
  slotLabel: {
    width: "33%",
    fontSize: 8.2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#475569",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRightWidth: 1,
    borderRightColor: "#e8eef6",
  },
  slotBody: {
    fontSize: 9.5,
    lineHeight: 1.4,
    color: "#1e293b",
    width: "67%",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  emptyMonthBox: {
    marginTop: 8,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  emptyMonthTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: 6,
    color: "#0f172a",
  },
  emptyMonthText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#334155",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
});

export type MonthlyReportDocumentProps = {
  year: number;
  month: number;
  days: Record<string, Partial<Record<MealSlotId, string>>>;
};

function normalizeSlotContentForPdf(raw?: string): string {
  const text = raw?.trim();
  if (!text) return "—";

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/\]\s*Refeição$/i.test(line))
    .map((line) => line.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length === 0) return "—";
  return lines.map((line) => `• ${line}`).join("\n");
}

function filledSlotsOfDay(dayData?: Partial<Record<MealSlotId, string>>) {
  return MEAL_SLOTS.map((slot) => ({
    slot,
    content: normalizeSlotContentForPdf(dayData?.[slot.id]),
  })).filter((entry) => entry.content !== "—");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function MonthlyReportDocument({
  year,
  month,
  days,
}: MonthlyReportDocumentProps) {
  const n = daysInMonth(year, month);
  const ymdList = Array.from({ length: n }, (_, i) =>
    formatYmd(year, month, i + 1),
  );
  const filledYmdList = ymdList.filter((ymd) => {
    const dayData = days[ymd];
    if (!dayData) return false;
    return MEAL_SLOTS.some((slot) => (dayData[slot.id] ?? "").trim().length > 0);
  });
  const dayChunks = chunk(filledYmdList, 3);
  const monthTitle = (() => {
    const t = monthTitlePt(year, month);
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();

  return (
    <Document
      title={`Diário alimentar — ${monthTitlePt(year, month)}`}
      author="Diário alimentar"
      language="pt-BR"
    >
      {filledYmdList.length === 0 ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>Diário alimentar</Text>
            <Text style={styles.reportSubtitle}>{monthTitle}</Text>
            <Text style={styles.reportMeta}>
              Dias com registro: {filledYmdList.length}
            </Text>
            <Text style={styles.reportNote}>
              Registro das refeições por dia para compartilhar com profissional
              de saúde ou nutricionista.
            </Text>
          </View>
          <View style={styles.emptyMonthBox}>
            <Text style={styles.emptyMonthTitle}>Nenhuma refeição cadastrada</Text>
            <Text style={styles.emptyMonthText}>
              Não encontramos registros para este período. Tente selecionar outro
              mês ou cadastrar refeições antes de exportar novamente.
            </Text>
          </View>
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
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>Diário alimentar</Text>
                <Text style={styles.reportSubtitle}>{monthTitle}</Text>
                <Text style={styles.reportMeta}>
                  Dias com registro: {filledYmdList.length}
                </Text>
                <Text style={styles.reportNote}>
                  Registro das refeições por dia para compartilhar com
                  profissional de saúde ou nutricionista.
                </Text>
              </View>
            )}
            {chunkYmd.map((ymd) => {
              const dayNum = Number(ymd.slice(8, 10));
              const dayData = days[ymd];
              const dayTitle = longDatePt(year, month, dayNum);
              const dayTitleCap =
                dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);
              return (
                <View key={ymd} style={styles.dayBlock}>
                  <Text style={styles.dayTitle}>{dayTitleCap}</Text>
                  <View style={styles.dayTable}>
                    {filledSlotsOfDay(dayData).map(({ slot, content }, idx, arr) => (
                      <View
                        key={slot.id}
                        style={[
                          styles.slotRow,
                          idx === arr.length - 1
                            ? { borderBottomWidth: 0 }
                            : {},
                        ]}
                      >
                        <Text style={styles.slotLabel}>{slot.label}</Text>
                        <Text style={styles.slotBody}>{content}</Text>
                      </View>
                    ))}
                  </View>
                </View>
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
