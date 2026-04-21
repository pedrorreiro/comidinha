/* eslint-disable jsx-a11y/alt-text */
import { Image, Text, View } from "@react-pdf/renderer";
import { styles } from "@/lib/pdf/monthly-report-styles";

type ReportHeaderProps = {
  monthTitle: string;
  filledDaysCount: number;
  displayName: string;
  avatarUrl?: string;
};

function initialsFromName(name?: string): string {
  const clean = (name ?? "").trim();
  if (!clean) return "US";
  const parts = clean.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? "" : "";
  return `${first}${last}`.toUpperCase() || "US";
}

export function ReportHeader({
  monthTitle,
  filledDaysCount,
  displayName,
  avatarUrl,
}: ReportHeaderProps) {
  return (
    <View style={styles.reportHeader}>
      <View style={styles.reportHeaderTop}>
        <Text style={styles.reportTitle}>Diário alimentar</Text>
        <Text style={styles.reportSubtitle}>{monthTitle}</Text>
      </View>
      <View style={styles.reportHeaderTop}>
        <View style={styles.profileChip}>
          {avatarUrl ? (
            <Image src={avatarUrl} style={styles.profileAvatar} />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <Text style={styles.profileAvatarInitials}>
                {initialsFromName(displayName)}
              </Text>
            </View>
          )}
          <Text style={styles.profileName}>{displayName}</Text>
        </View>
      </View>
      <Text style={styles.reportMeta}>Dias com registro: {filledDaysCount}</Text>
      <Text style={styles.reportNote}>
        Registro das refeições por dia para compartilhar com profissional de saúde
        ou nutricionista.
      </Text>
    </View>
  );
}
