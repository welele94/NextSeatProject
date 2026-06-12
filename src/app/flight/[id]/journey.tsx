import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatMinutes } from "@/features/time/formatMinutes";
import { colors, rhythmUi, spacing, typography } from "@/theme";

import { useFlightSnapshot } from "./useFlightSnapshot";

export default function JourneyTab() {
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

  const rhythm = rhythmUi[snapshot.rhythm];
  const typicalSensations = snapshot.phase.typicalSensations ?? [];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: rhythm.screenBackground }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Journey</Text>
          <Text style={styles.title}>Your route, calmly explained</Text>
          <Text style={styles.body}>
            These details are here for orientation. You do not need to keep
            checking them.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Current phase</Text>
          <Text style={styles.cardTitle}>{snapshot.phase.label}</Text>
          <Text style={styles.cardBody}>{snapshot.phase.passengerMeaning}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Progress</Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${snapshot.journey.completedPercent}%` }
              ]}
            />
          </View>

          <View style={styles.progressMeta}>
            <Text style={styles.metaText}>
              {Math.round(snapshot.journey.completedPercent)}% completed
            </Text>

            <Text style={styles.metaText}>
              {formatMinutes(snapshot.journey.remainingMinutes)} left
            </Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.cardLabel}>Route</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineText}>
              <Text style={styles.timelineTitle}>
                {snapshot.journey.originLabel}
              </Text>
              <Text style={styles.timelineBody}>Departure point</Text>
            </View>
          </View>

          {snapshot.currentCheckpoint ? (
            <View style={styles.timelineItem}>
              <View style={styles.timelineDotActive} />
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>
                  {snapshot.currentCheckpoint.label}
                </Text>
                <Text style={styles.timelineBody}>Current route awareness</Text>
              </View>
            </View>
          ) : null}

          {snapshot.nextCheckpoint ? (
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>
                  {snapshot.nextCheckpoint.label}
                </Text>
                <Text style={styles.timelineBody}>Next route reference</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineText}>
              <Text style={styles.timelineTitle}>
                {snapshot.journey.destinationLabel}
              </Text>
              <Text style={styles.timelineBody}>Arrival point</Text>
            </View>
          </View>
        </View>

        {typicalSensations.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Typical sensations</Text>

            {typicalSensations.map((sensation) => (
              <Text key={sensation} style={styles.listItem}>
                • {sensation}
              </Text>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  timelineCard: {
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
  cardTitle: {
    ...typography.section,
    color: colors.textPrimary
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primaryBlue
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.md
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: colors.border
  },
  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: colors.primaryBlue
  },
  timelineText: {
    flex: 1,
    gap: spacing.xs
  },
  timelineTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700"
  },
  timelineBody: {
    ...typography.caption,
    color: colors.textSecondary
  },
  listItem: {
    ...typography.body,
    color: colors.textSecondary
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