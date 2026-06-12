import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NextExpectedMomentCard } from "@/components/NextExpectedMomentCard";
import { formatMinutes } from "@/features/time/formatMinutes";
import { colors, rhythmUi, spacing, typography } from "@/theme";

import { useFlightSnapshot } from "./useFlightSnapshot";

export default function OverviewTab() {
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

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: rhythm.screenBackground }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { gap: rhythm.contentGap }
        ]}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: rhythm.heroBackground,
              padding: rhythm.heroPadding
            }
          ]}
        >
          <Text style={styles.routeLabel}>{snapshot.journey.routeLabel}</Text>

          <Text style={styles.heroTitle}>{snapshot.reassurance.title}</Text>

          <Text style={styles.heroBody}>{snapshot.reassurance.body}</Text>
        </View>

        <View style={styles.routeAwarenessCard}>
          <Text style={styles.cardLabel}>Route awareness</Text>

          <Text style={styles.cardTitle}>
            {snapshot.journey.originLabel} to {snapshot.journey.destinationLabel}
          </Text>

          <Text style={styles.cardBody}>
            You are on the prepared route for this flight. You do not need to
            monitor every detail.
          </Text>
        </View>

        <NextExpectedMomentCard
          moment={snapshot.expectedMoment}
          emphasized={rhythm.emphasizeNextMoment}
        />

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.cardLabel}>Journey progress</Text>

            <Text style={styles.progressPercent}>
              {Math.round(snapshot.journey.completedPercent)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${snapshot.journey.completedPercent}%` }
              ]}
            />
          </View>

          <View style={styles.progressMeta}>
            <Text style={styles.metaText}>{snapshot.phase.label}</Text>

            <Text style={styles.metaText}>
              About {formatMinutes(snapshot.journey.remainingMinutes)} left
            </Text>
          </View>
        </View>
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
    padding: spacing.xl,
    paddingBottom: 108
  },
  heroCard: {
    gap: spacing.md,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border
  },
  routeLabel: {
    ...typography.eyebrow,
    color: colors.textSecondary
  },
  heroTitle: {
    ...typography.hero,
    color: colors.textPrimary
  },
  heroBody: {
    ...typography.body,
    color: colors.textSecondary
  },
  routeAwarenessCard: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  progressCard: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
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
  progressPercent: {
    ...typography.section,
    color: colors.primaryBlue
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