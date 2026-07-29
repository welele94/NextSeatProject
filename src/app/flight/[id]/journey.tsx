import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GuidanceModeBadge } from "@/components/flight/Sprint10Cards";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing, typography } from "@/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type JourneyStage = {
  label: string;
  icon: IoniconName;
  threshold: number;
};

const journeyStages: JourneyStage[] = [
  { label: "Pre-flight", icon: "clipboard-outline", threshold: 0 },
  { label: "Takeoff", icon: "airplane", threshold: 15 },
  { label: "Cruise", icon: "cloud-outline", threshold: 50 },
  { label: "Descent", icon: "navigate-outline", threshold: 80 },
  { label: "Arrival", icon: "business-outline", threshold: 100 }
];

function splitRoute(routeLabel: string) {
  const parts = routeLabel.split("→").map((part) => part.trim());
  return {
    origin: parts[0] || "Origin",
    destination: parts[1] || "Destination"
  };
}

function getJourneyPercent(phaseLabel: string, progressPercent: number): number {
  const normalized = phaseLabel.toLowerCase();
  if (normalized.includes("arriv")) return 100;
  if (normalized.includes("pre")) return Math.max(Math.round(progressPercent), 6);
  if (normalized.includes("takeoff")) return Math.max(Math.round(progressPercent), 18);
  if (normalized.includes("cruise")) return Math.max(Math.round(progressPercent), 56);
  if (normalized.includes("descent") || normalized.includes("approach")) return Math.max(Math.round(progressPercent), 82);
  return Math.max(Math.round(progressPercent), 4);
}

function getActiveStageIndex(percent: number): number {
  if (percent >= 100) return journeyStages.length - 1;
  if (percent >= 80) return 3;
  if (percent >= 20) return 2;
  if (percent >= 10) return 1;
  return 0;
}

function SkyBackground() {
  return (
    <>
      <View pointerEvents="none" style={styles.skyWash} />
      <View pointerEvents="none" style={styles.cloudLeft} />
      <View pointerEvents="none" style={styles.cloudRight} />
      <View pointerEvents="none" style={styles.horizonCloud} />
    </>
  );
}

function GlobeRoute({ origin, destination, percent }: {
  origin: string;
  destination: string;
  percent: number;
}) {
  const planeLeft = Math.min(Math.max(percent, 12), 88);

  return (
    <View style={styles.globeCard}>
      <View style={styles.globeHeader}>
        <Text style={styles.screenTitle}>Current journey</Text>
        <Text style={styles.screenRoute}>{origin} → {destination}</Text>
        <View style={styles.flightBadge}>
          <Ionicons name="airplane" size={15} color={colors.skyBlueStrong} />
          <Text style={styles.flightBadgeText}>{percent >= 100 ? "Arrived" : "In Flight"}</Text>
        </View>
      </View>

      <View style={styles.globe}> 
        <View style={[styles.landBlob, styles.landNorth]} />
        <View style={[styles.landBlob, styles.landWest]} />
        <View style={[styles.landBlob, styles.landEast]} />
        <View style={[styles.landBlob, styles.landSouth]} />
        <View style={styles.globeCloudOne} />
        <View style={styles.globeCloudTwo} />
        <View style={styles.routeArc} />
        <View style={[styles.globePlane, { left: `${planeLeft}%` }]}> 
          <Ionicons name="airplane" size={28} color={colors.white} />
        </View>
        <View style={[styles.locationMarker, styles.originMarker]}>
          <View style={styles.markerDot} />
          <Text style={styles.markerLabel}>{origin}</Text>
        </View>
        <View style={[styles.locationMarker, styles.destinationMarker]}>
          <View style={styles.markerDot} />
          <Text style={styles.markerLabel}>{destination}</Text>
        </View>
      </View>
    </View>
  );
}

function PhaseProgressCard({ percent, activeIndex }: {
  percent: number;
  activeIndex: number;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.phaseTrack}> 
        <View style={styles.phaseLine} />
        <View style={[styles.phaseLineFill, { width: `${Math.min(percent, 100)}%` }]} />
        {journeyStages.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isArrived = percent >= 100;
          const activeColor = isArrived ? colors.successGreen : colors.skyBlueStrong;
          return (
            <View key={stage.label} style={[styles.stageItem, { left: `${stage.threshold}%` }]}> 
              <View
                style={[
                  styles.stageIcon,
                  (isCompleted || isCurrent) && { backgroundColor: activeColor },
                  isCurrent && styles.stageIconCurrent
                ]}
              >
                <Ionicons name={stage.icon} size={isCurrent ? 24 : 19} color={(isCompleted || isCurrent) ? colors.white : "#8AA3C2"} />
              </View>
              <Text style={[styles.stageLabel, isCurrent && { color: activeColor, fontWeight: "800" }]}>{stage.label}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.progressNumber, { color: percent >= 100 ? colors.successGreen : colors.skyBlueStrong }]}>{percent}%</Text>
      <Text style={styles.progressCaption}>of journey</Text>
    </View>
  );
}

function InfoCard({ icon, title, body, progress }: {
  icon: IoniconName;
  title: string;
  body: string;
  progress?: number;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconCircle}>
        {typeof progress === "number" ? (
          <Text style={styles.infoProgressText}>{progress}%</Text>
        ) : (
          <Ionicons name={icon} size={30} color={colors.skyBlueStrong} />
        )}
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
      <Text style={styles.infoChevron}>›</Text>
    </View>
  );
}

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

  const ui = buildFlightUiSnapshot(snapshot);
  const { origin, destination } = splitRoute(ui.routeLabel);
  const percent = getJourneyPercent(ui.currentPhaseLabel, snapshot.progress.progressPercent);
  const activeIndex = getActiveStageIndex(percent);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SkyBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <GuidanceModeBadge confidenceLevel={ui.confidenceLevel} predictionMode={ui.predictionMode} />
        <GlobeRoute origin={origin} destination={destination} percent={percent} />
        <PhaseProgressCard percent={percent} activeIndex={activeIndex} />
        <InfoCard
          icon="globe-outline"
          title="Flight path"
          body={`Your journey is following the planned route toward ${destination}.`}
        />
        <InfoCard
          icon="analytics-outline"
          title="Estimated progress"
          body={`${percent}% of the journey completed`}
          progress={percent}
        />
        <Text style={styles.timeNote}>{snapshot.flightSummary.timeDisplayNote}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF5FF",
    overflow: "hidden"
  },
  skyWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 520,
    backgroundColor: "#DCEEFF"
  },
  cloudLeft: {
    position: "absolute",
    top: 140,
    left: -110,
    width: 260,
    height: 150,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.68)"
  },
  cloudRight: {
    position: "absolute",
    top: 210,
    right: -120,
    width: 300,
    height: 170,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.62)"
  },
  horizonCloud: {
    position: "absolute",
    top: 420,
    left: -60,
    right: -60,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.54)"
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 132
  },
  globeCard: {
    alignItems: "center",
    gap: spacing.lg,
    paddingTop: spacing.lg
  },
  globeHeader: {
    alignItems: "center",
    gap: spacing.sm
  },
  screenTitle: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: "center"
  },
  screenRoute: {
    ...typography.section,
    color: colors.textPrimary,
    textAlign: "center"
  },
  flightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(18, 102, 227, 0.14)"
  },
  flightBadgeText: {
    ...typography.caption,
    color: colors.skyBlueStrong,
    fontWeight: "800"
  },
  globe: {
    width: 520,
    height: 330,
    borderRadius: 260,
    backgroundColor: "#BFE0FF",
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.75)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.2,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7
  },
  landBlob: {
    position: "absolute",
    backgroundColor: "rgba(245, 250, 255, 0.82)",
    borderRadius: radius.pill
  },
  landNorth: { top: 40, left: 190, width: 190, height: 58, transform: [{ rotate: "8deg" }] },
  landWest: { top: 116, left: 90, width: 170, height: 78, transform: [{ rotate: "-12deg" }] },
  landEast: { top: 116, right: 82, width: 180, height: 86, transform: [{ rotate: "10deg" }] },
  landSouth: { bottom: 28, left: 164, width: 220, height: 72, transform: [{ rotate: "3deg" }] },
  globeCloudOne: { position: "absolute", top: 78, left: 50, width: 180, height: 34, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.42)" },
  globeCloudTwo: { position: "absolute", top: 210, right: 40, width: 200, height: 38, borderRadius: radius.pill, backgroundColor: "rgba(255, 255, 255, 0.36)" },
  routeArc: {
    position: "absolute",
    left: 110,
    right: 110,
    top: 148,
    height: 96,
    borderTopWidth: 4,
    borderColor: colors.skyBlueStrong,
    borderRadius: 180,
    transform: [{ rotate: "2deg" }]
  },
  globePlane: {
    position: "absolute",
    top: 158,
    width: 44,
    height: 44,
    marginLeft: -22,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.skyBlueStrong,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  locationMarker: {
    position: "absolute",
    alignItems: "center",
    gap: 3
  },
  originMarker: { left: 116, top: 176 },
  destinationMarker: { right: 112, top: 178 },
  markerDot: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 5,
    borderColor: colors.white,
    backgroundColor: colors.skyBlueStrong
  },
  markerLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "800",
    backgroundColor: "rgba(255,255,255,0.78)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: "hidden"
  },
  card: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: "rgba(13, 59, 140, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  phaseTrack: {
    height: 88,
    position: "relative",
    justifyContent: "center"
  },
  phaseLine: {
    position: "absolute",
    left: 26,
    right: 26,
    top: 28,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: "#CFDDED"
  },
  phaseLineFill: {
    position: "absolute",
    left: 26,
    top: 28,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.skyBlueStrong
  },
  stageItem: {
    position: "absolute",
    top: 0,
    width: 74,
    marginLeft: -37,
    alignItems: "center",
    gap: spacing.xs
  },
  stageIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FB",
    borderWidth: 3,
    borderColor: colors.white
  },
  stageIconCurrent: {
    width: 56,
    height: 56,
    marginTop: -6,
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  stageLabel: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 14,
    color: colors.textPrimary,
    textAlign: "center"
  },
  progressNumber: {
    ...typography.hero,
    textAlign: "center",
    fontSize: 34,
    lineHeight: 38
  },
  progressCaption: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: -spacing.sm
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1.2,
    borderColor: "rgba(13, 59, 140, 0.18)",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3
  },
  infoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF3FF",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.88)"
  },
  infoProgressText: {
    ...typography.section,
    color: colors.skyBlueStrong,
    fontWeight: "800"
  },
  infoText: { flex: 1, gap: spacing.xs },
  infoTitle: { ...typography.section, color: colors.skyBlueStrong },
  infoBody: { ...typography.body, color: colors.textPrimary },
  infoChevron: { fontSize: 32, lineHeight: 36, color: colors.skyBlueStrong },
  timeNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm
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
