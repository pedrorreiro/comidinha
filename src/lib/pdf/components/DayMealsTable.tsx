import { Text, View } from "@react-pdf/renderer";
import { styles } from "@/lib/pdf/monthly-report-styles";

type DayMealsTableProps = {
  dayTitle: string;
  rows: Array<{
    id: string;
    label: string;
    content: string;
    portion?: string | null;
    calories?: number | null;
  }>;
};

export function DayMealsTable({ dayTitle, rows }: DayMealsTableProps) {
  return (
    <View style={styles.dayBlock}>
      <Text style={styles.dayTitle}>{dayTitle}</Text>
      <View style={styles.dayTable}>
        {rows.map((row, idx) => (
          <View
            key={row.id}
            style={[styles.slotRow, idx === rows.length - 1 ? { borderBottomWidth: 0 } : {}]}
          >
            <Text style={styles.slotLabel}>{row.label}</Text>
            <View style={styles.slotBody}>
              <Text>{row.content}</Text>
              {(row.portion || typeof row.calories === "number") && (
                <Text style={styles.slotMeta}>
                  {[
                    row.portion ? `Porção: ${row.portion}` : null,
                    typeof row.calories === "number"
                      ? `${Math.round(row.calories)} kcal`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
