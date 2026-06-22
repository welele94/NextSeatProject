import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import type { FlightSnapshot } from "@/features/flightSnapshot/types";
import { colors, radius, spacing, typography } from "@/theme";

import { useFlightSnapshot } from "./useFlightSnapshot";

function formatCompactMinutes(minutes: number): string {
  const safeMinutes = Math.max(Math.round(minutes), 0);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
}

function getNextExpectedMomentCopy(snapshot: FlightSnapshot): string {
  const minutesUntil = snapshot.expectedMoment.timingEstimate?.minutesUntil;

  if (snapshot.phase.id === "cruise" && minutesUntil !== undefined) {
    return `Descent likely in ${formatCompactMinutes(minutesUntil)}`;
  }

  if (snapshot.phase.id === "descent" || snapshot.phase.id === "approach") {
    return "Preparation for arrival is about to begin.";
  }

  return snapshot.expectedMoment.title;
}

function SkyBackground() {
  return (
    <>
      <View pointerEvents="none" style={styles.cloudLargeTopLeft} />
      <View pointerEvents="none" style={styles.cloudMediumTopRight} />
      <View pointerEvents="none" style={styles.cloudLargeMiddleRight} />
      <View pointerEvents="none" style={styles.cloudSmallMiddleLeft} />
      <View pointerEvents="none" style={styles.cloudBottomLeft} />
      <View pointerEvents="none" style={styles.cloudBottomRight} />
    </>
  );
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

  const heroMinHeight = Math.round(height * 0.42);
  const nextMomentCopy = getNextExpectedMomentCopy(snapshot);
  const heroTitle = snapshot.reassurance.title;
  const heroBody = snapshot.reassurance.body;

  const flightSummary = snapshot.flightSummary as typeof snapshot.flightSummary & {
    originCode?: string;
    destinationCode?: string;
    scheduledDepartureLabel?: string;
    scheduledArrivalLabel?: string;
  };

  function openNextMoment() {
    if (!snapshot) {
      return;
    }

    router.push({
      pathname: "/flight/[id]/next-moment" as never,
      params: {
        id: snapshot.flightSummary.id
      } as never
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SkyBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.hero, { minHeight: heroMinHeight }]}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>☺</Text>
          </View>

          <Text style={styles.heroTitle}>{heroTitle}</Text>

          <Text style={styles.heroBody}>{heroBody}</Text>
        </View>

        <View style={styles.routeContext}>
          <View style={styles.routeRow}>
            <View style={styles.airportBlock}>
              <Text style={styles.airportMarker}>⌖</Text>
              <Text style={styles.airportCode}>
                {flightSummary.originCode ?? "LIS"}
              </Text>
            </View>

            <View style={styles.flightPath}>
              <View style={styles.pathLine} />
              <View style={styles.planeBadge}>
                <Text style={styles.planeIcon}>✈</Text>
              </View>
            </View>

            <View style={styles.airportBlock}>
              <Text style={styles.airportMarker}>⌖</Text>
              <Text style={styles.airportCode}>
                {flightSummary.destinationCode ?? "OPO"}
              </Text>
            </View>
          </View>

          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleLabel}>Departure</Text>
              <Text style={styles.scheduleTime}>
                {flightSummary.scheduledDepartureLabel ?? "08:10"}
              </Text>
            </View>

            <View style={[styles.scheduleItem, styles.scheduleItemRight]}>
              <Text style={styles.scheduleLabel}>Expected arrival</Text>
              <Text style={styles.scheduleTime}>
                {flightSummary.scheduledArrivalLabel ?? "09:10"}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={openNextMoment}
          style={({ pressed }) => [
            styles.nextMomentButton,
            pressed && styles.nextMomentButtonPressed
          ]}
        >
          <View style={styles.nextMomentText}>
            <Text style={styles.nextMomentLabel}>Next expected moment</Text>
            <Text style={styles.nextMomentTitle}>{nextMomentCopy}</Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const skyBlue = "#EAF7FF";
const cloudWhite = "#FFFFFF";
const cloudBlue = "#DDF0FF";
const cloudMint = "#E2F7ED";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: skyBlue
  },

  cloudLargeTopLeft: {
    position: "absolute",
    top: -80,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: radius.pill,
    backgroundColor: cloudWhite,
    opacity: 0.78
  },

  cloudMediumTopRight: {
    position: "absolute",
    top: 48,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    backgroundColor: cloudBlue,
    opacity: 0.55
  },

  cloudLargeMiddleRight: {
    position: "absolute",
    top: 260,
    right: -135,
    width: 300,
    height: 300,
    borderRadius: radius.pill,
    backgroundColor: cloudWhite,
    opacity: 0.58
  },

  cloudSmallMiddleLeft: {
    position: "absolute",
    top: 380,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    backgroundColor: cloudMint,
    opacity: 0.42
  },

  cloudBottomLeft: {
    position: "absolute",
    bottom: 70,
    left: -110,
    width: 240,
    height: 240,
    borderRadius: radius.pill,
    backgroundColor: cloudWhite,
    opacity: 0.54
  },

  cloudBottomRight: {
    position: "absolute",
    bottom: -80,
    right: -90,
    width: 250,
    height: 250,
    borderRadius: radius.pill,
    backgroundColor: cloudBlue,
    opacity: 0.58
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: 120,
    gap: spacing["3xl"]
  },

  hero: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl
  },

  heroIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "#DDF0FF",
    marginBottom: spacing.lg
  },

  heroIconText: {
    color: colors.primaryBlue,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "700"
  },

  heroTitle: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
    maxWidth: 320
  },

  heroBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 300
  },

  routeContext: {
    gap: spacing.lg
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

  airportMarker: {
    color: colors.primaryBlue,
    fontSize: 16,
    lineHeight: 18
  },

  airportCode: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "700"
  },

  flightPath: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center"
  },

  pathLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: "#BFD8EA"
  },

  planeBadge: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primaryBlue
  },

  planeIcon: {
    color: colors.white,
    fontSize: 25,
    lineHeight: 28
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

  nextMomentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#BFD8EA",
    backgroundColor: "#FFFFFF99"
  },

  nextMomentButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }]
  },

  nextMomentText: {
    flex: 1,
    gap: spacing.sm
  },

  nextMomentLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600"
  },

  nextMomentTitle: {
    ...typography.section,
    color: colors.textPrimary
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
