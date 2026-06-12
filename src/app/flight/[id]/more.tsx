import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography } from "@/theme";

import { useFlightSnapshot } from "./useFlightSnapshot";

export default function MoreTab() {
  const { snapshot } = useFlightSnapshot();

  if (!snapshot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Flight not found</Text>
          <Text style={styles.emptyBody}>
            This flight is not available on this device.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>More</Text>
          <Text style={styles.title}>Optional details</Text>
          <Text style={styles.body}>
            These details are available if you want them, but they are not
            something you need to monitor.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Flight</Text>

          <DetailRow label="Flight number" value={snapshot.flightSummary.flightNumber} />
          <DetailRow label="Airline" value={snapshot.flightSummary.airline} />
          <DetailRow label="Aircraft" value={snapshot.flightSummary.aircraftLabel} />
          <DetailRow label="Route" value={snapshot.flightSummary.routeLabel} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Journey context</Text>

          <DetailRow label="Current part" value={snapshot.phase.label} />
          <DetailRow label="What it means" value={snapshot.phase.passengerMeaning} />
          <DetailRow
            label="Progress"
            value={`${Math.round(snapshot.progress.progressPercent)}% complete`}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Route references</Text>

          <DetailRow
            label="Current checkpoint"
            value={snapshot.currentCheckpoint?.label ?? "Not available"}
          />

          <DetailRow
            label="Next checkpoint"
            value={snapshot.nextCheckpoint?.label ?? "Not available"}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: 108
  },
  header: {
    gap: spacing.sm
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.textSecondary
  },
  title: {
    ...typography.title,
    color: colors.textPrimary
  },
  body: {
    ...typography.body,
    color: colors.textSecondary
  },
  card: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardLabel: {
    ...typography.eyebrow,
    color: colors.textSecondary
  },
  detailRow: {
    gap: spacing.xs
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary
  }
});
