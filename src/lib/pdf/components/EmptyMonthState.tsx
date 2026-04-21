import { Text, View } from "@react-pdf/renderer";
import { styles } from "@/lib/pdf/monthly-report-styles";

export function EmptyMonthState() {
  return (
    <View style={styles.emptyMonthBox}>
      <Text style={styles.emptyMonthTitle}>Nenhuma refeição cadastrada</Text>
      <Text style={styles.emptyMonthText}>
        Não encontramos registros para este período. Tente selecionar outro mês ou
        cadastrar refeições antes de exportar novamente.
      </Text>
    </View>
  );
}
