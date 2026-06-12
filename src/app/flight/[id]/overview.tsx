import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { FlightSnapshot } from "@/features/flightSnapshot/types";
import { colors, radius, rhythmUi, spacing, typography } from "@/theme";

import { useFlightSnapshot } from "./useFlightSnapshot";

function formatCompactMinutes(minutes: number): string{
  const safeMinutes = Math.max(Math.round(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0){
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0){
    return `${hours}h`;
  }

  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`; 
}

function getNextExpectedMomentCopy(snapshot: FlightSnapshot): string{
  const minutesUntil = snapshot.expectedMoment.timingEstimate?.minutesUntil;

  if (snapshot.phase.id === "cruise" && minutesUntil !== undefined){
    return `The descent may begin in about ${formatCompactMinutes(minutesUntil)}`;
  }
  if (snapshot.phase.id === "descent" || snapshot.phase.id === "approach"){
    return `Preparation for arrival is about to begin.`;
  }
  if (minutesUntil !== undefined){
    return `Your flight next phase may begin in about ${formatCompactMinutes(minutesUntil)}`
  }

  return snapshot.expectedMoment.title;
  
}


export default function OverviewTab() {
  const { snapshot } = useFlightSnapshot();
  const { height } = useWindowDimensions();

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
  const heroMinHeight = Math.round(height * 0.44);
  const nextMomentCopy = getNextExpectedMomentCopy(snapshot);

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
            styles.hero,
            {
              minHeight: heroMinHeight,
              backgroundColor: rhythm.heroBackground,
              padding: rhythm.heroPadding
            }
          ]}
        >
          <View pointerEvents="none" style={styles.heroGlowTop} />
          <View pointerEvents="none" style={styles.heroGlowBottom} />

          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>☺</Text>
          </View>

          <Text style={styles.heroTitle}>O voo está a decorrer normalmente</Text>

          <Text style={styles.heroBody}>Tudo dentro do esperado.</Text>
        </View>

        <View style={styles.routeContext}>
          <View style={styles.routeRow}>
            <View style={styles.airportBlock}>
              <Text style={styles.airportPin}>⌖</Text>
              <Text style={styles.airportCode}>
                {snapshot.flightSummary.originCode}
              </Text>
            </View>

            <View style={styles.flightPath}>
              <View style={styles.pathLine} />
              <View style={styles.planeBadge}>
                <Text style={styles.planeIcon}>✈</Text>
              </View>
            </View>

            <View style={styles.airportBlock}>
              <Text style={styles.airportPin}>⌖</Text>
              <Text style={styles.airportCode}>
                {snapshot.flightSummary.destinationCode}
              </Text>
            </View>
          </View>

          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleLabel}>Partida</Text>
              <Text style={styles.scheduleTime}>
                {snapshot.flightSummary.scheduledDepartureLabel}
              </Text>
            </View>

            <View style={[styles.scheduleItem, styles.scheduleItemRight]}>
              <Text style={styles.scheduleLabel}>Chegada prevista</Text>
              <Text style={styles.scheduleTime}>
                {snapshot.flightSummary.scheduledArrivalLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.nextMomentCard}>
          <View style={styles.nextMomentText}>
            <Text style={styles.cardLabel}>Próximo momento esperado</Text>
            <Text style={styles.nextMomentTitle}>{nextMomentCopy}</Text>
          </View>

          <Text style={styles.chevron}>›</Text>
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

  hero: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.border
  },

  heroGlowTop: {
    position: "absolute",
    top: -70,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: radius.pill,
    backgroundColor: colors.cruiseBlue,
    opacity: 0.85
  },

  heroGlowBottom: {
    position: "absolute",
    right: -90,
    bottom: -100,
    width: 260,
    height: 260,
    borderRadius: radius.pill,
    backgroundColor: colors.successGreen,
    opacity: 0.45
  },

  heroIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.cruiseBlue,
    marginBottom: spacing.md
  },

  heroIconText: {
    color: colors.primaryBlue,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700"
  },

  heroTitle: {
    ...typography.title,
    color: colors.textPrimary,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: 280
  },

  heroBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 260
  },

  routeContext: {
    gap: spacing.lg,
    paddingHorizontal: spacing.sm
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },

  airportBlock: {
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 44
  },

  airportPin: {
    color: colors.primaryBlue,
    fontSize: 18,
    lineHeight: 20
  },

  airportCode: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "700"
  },

  flightPath: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },

  pathLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.border
  },

  planeBadge: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primaryBlue
  },

  planeIcon: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 24
  },

  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg
  },

  scheduleItem: {
    flex: 1,
    gap: spacing.xs
  },

  scheduleItemRight: {
    alignItems: "flex-end"
  },

  scheduleLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600"
  },

  scheduleTime: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700"
  },

  nextMomentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },

  nextMomentText: {
    flex: 1,
    gap: spacing.sm
  },

  cardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600"
  },

  nextMomentTitle: {
    ...typography.section,
    color: colors.textPrimary,
    fontWeight: "700"
  },

  chevron: {
    color: colors.primaryBlue,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "500"
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