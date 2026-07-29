import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AirportInfoCard,
  ConfirmationPrompt,
  CurrentMomentSummaryCard,
  EndJourneyButton,
  GuidanceModeBadge,
  NextExpectedMomentCard,
  OfflineReadyCard,
  StatusHeroCard
} from "@/components/flight/Sprint10Cards";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing, typography } from "@/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const journeySteps = ["Pre-flight", "Takeoff", "Cruise", "Descent", "Arrival"];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function asPercent(value: number): DimensionValue {
  return `${clamp(value, 0, 100)}%` as DimensionValue;
}

function isArrivedPhase(phaseLabel: string): boolean {
  return phaseLabel.toLowerCase().includes("arriv");
}

function phaseBadgeIcon(phaseLabel: string): IoniconName {
  const normalized = phaseLabel.toLowerCase();
  if (normalized.includes("arriv")) return "checkmark-circle";
  if (normalized.includes("pre")) return "time-outline";
  if (normalized.includes("cruise")) return "cloud-outline";
  if (normalized.includes("descent") || normalized.includes("approach")) return "navigate-outline";
  return "airplane";
}

function currentJourneyPercent(progressPercent: number): number {
  return clamp(Math.round(progressPercent), 0, 100);
}

function planeMarkerPercent(displayPercent: number): number {
  return clamp(displayPercent, 6, 94);
}

function CurrentJourneyPanel({
  routeLabel,
  phaseLabel,
  progressPercent,
  onPress
}: {
  routeLabel: string;
  phaseLabel: string;
  progressPercent: number;
  onPress: () => void;
}) {
  const displayPercent = currentJourneyPercent(progressPercent);
  const planeLeft = planeMarkerPercent(displayPercent);
  const isSuccess = isArrivedPhase(phaseLabel);
  const accent = isSuccess ? colors.successGreen : colors.skyBlueStrong;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.journeyPanel, pressed && styles.pressed]}
    >
      <View style={styles.journeyPanelHeader}>
        <View style={styles.journeyPanelTitleGroup}>
          <Text style={styles.journeyPanelEyebrow}>Current journey</Text>
          <Text style={styles.journeyPanelRoute}>{routeLabel}</Text>
          <View style={[styles.journeyPanelPhase, isSuccess && styles.journeyPanelPhaseSuccess]}>
            <Ionicons name={phaseBadgeIcon(phaseLabel)} size={13} color={accent} />
            <Text style={[styles.journeyPanelPhaseText, { color: accent }]}>{phaseLabel}</Text>
          </View>
        </View>
        <View style={styles.journeyPanelPercentGroup}>
          <Text style={[styles.journeyPanelPercent, { color: accent }]}>{displayPercent}%</Text>
          <Text style={styles.journeyPanelPercentLabel}>of journey</Text>
        </View>
      </View>

      <View style={styles.journeyPanelTrackWrap}>
        <View style={styles.journeyPanelTrack}>
          <View style={styles.journeyPanelTrackBase} />
          <View style={[styles.journeyPanelTrackFill, { width: asPercent(displayPercent), backgroundColor: accent }]} />
          {journeySteps.map((step, index) => {
            const nodePercent = (index / (journeySteps.length - 1)) * 100;
            const isPast = nodePercent <= displayPercent;
            return (
              <View
                key={step}
                style={[
                  styles.journeyPanelNode,
                  { left: asPercent(nodePercent) },
                  isPast && { borderColor: accent, backgroundColor: colors.white }
                ]}
              />
            );
          })}
          <View style={[styles.journeyPanelPlane, { left: asPercent(planeLeft), backgroundColor: accent }]}> 
            <Ionicons name="airplane" size={18} color={colors.white} />
          </View>
        </View>
        <View style={styles.journeyPanelStepRow}>
          {journeySteps.map((step) => (
            <Text key={step} style={styles.journeyPanelStepLabel}>{step}</Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

function SkyBackground({ accent, isSuccess }: { accent: string; isSuccess: boolean }) {
  return (
    <>
      <View pointerEvents="none" style={styles.skyWash} />
      <View pointerEvents="none" style={[styles.sunGlow, isSuccess && styles.sunGlowSuccess]} />
      <View pointerEvents="none" style={styles.cloudLeftLarge} />
      <View pointerEvents="none" style={styles.cloudLeftSmall} />
      <View pointerEvents="none" style={styles.cloudRightLarge} />
      <View pointerEvents="none" style={styles.cloudRightSmall} />
      <View pointerEvents="none" style={styles.horizonClouds} />
      <View pointerEvents="none" style={[styles.skyPlane, { borderColor: accent }]}> 
        <Ionicons name="airplane" size={21} color={accent} />
      </View>
      <View pointerEvents="none" style={[styles.planeTrail, { backgroundColor: accent }]} />
    </>
  );
}

export default function OverviewTab() {
  const { snapshot, endJourney } = useFlightSnapshot();

  if (!snapshot) return <SafeAreaView style={styles.safeArea} />;

  const ui = buildFlightUiSnapshot(snapshot);
  const safeSnapshot = snapshot;
  const isSuccess = ui.isAfterFlight;

  function openCurrentMoment() {
    router.push({
      pathname: "/flight/[id]/current-moment" as never,
      params: { id: safeSnapshot.flightSummary.id } as never
    });
  }

  function openNextMoment() {
    router.push({
      pathname: "/flight/[id]/next-moment" as never,
      params: { id: safeSnapshot.flightSummary.id } as never
    });
  }

  function openJourney() {
    router.push({
      pathname: "/flight/[id]/journey" as never,
      params: { id: safeSnapshot.flightSummary.id } as never
    });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: ui.phaseTheme.pageBackground }]}> 
      <SkyBackground accent={ui.phaseTheme.accent} isSuccess={isSuccess} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GuidanceModeBadge confidenceLevel={ui.confidenceLevel} predictionMode={ui.predictionMode} />

        <CurrentJourneyPanel
          routeLabel={ui.routeLabel}
          phaseLabel={ui.currentPhaseLabel}
          progressPercent={snapshot.progress.progressPercent}
          onPress={openJourney}
        />

        <View style={styles.heroSurface}>
          <StatusHeroCard
            title={ui.reassuranceMessage.title}
            body={ui.reassuranceMessage.body}
            phaseLabel={ui.currentPhaseLabel}
            guidanceCopy={ui.guidanceCopy}
            onPress={openCurrentMoment}
          />
        </View>

        <AirportInfoCard title="Departure information" info={ui.airportInfo} />
        <AirportInfoCard title="After landing" info={ui.baggageInfo} />
        <CurrentMomentSummaryCard summary={ui.currentMomentSummary} onPress={openCurrentMoment} />
        <NextExpectedMomentCard moment={ui.nextExpectedMoment} onPress={openNextMoment} />
        <OfflineReadyCard status={ui.offlineGuidanceStatus} compact />

        {ui.shouldAskForConfirmation ? <ConfirmationPrompt /> : null}
        {ui.shouldShowEndJourney ? <EndJourneyButton onPress={() => void endJourney()} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EAF5FF", overflow: "hidden" },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 132
  },
  journeyPanel: {
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255, 255, 255, 0.32)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.48)"
  },
  journeyPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg
  },
  journeyPanelTitleGroup: { flex: 1, gap: spacing.xs, paddingLeft: spacing.sm },
  journeyPanelEyebrow: { ...typography.eyebrow, color: colors.primaryBlue, fontWeight: "800" },
  journeyPanelRoute: { ...typography.section, color: colors.textPrimary },
  journeyPanelPhase: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.74)"
  },
  journeyPanelPhaseSuccess: { backgroundColor: colors.successSoft },
  journeyPanelPhaseText: { ...typography.caption, fontWeight: "800", fontSize: 13, lineHeight: 18 },
  journeyPanelPercentGroup: { alignItems: "flex-end", paddingRight: spacing.sm },
  journeyPanelPercent: { ...typography.hero, fontSize: 34, lineHeight: 38 },
  journeyPanelPercentLabel: { ...typography.caption, color: colors.textPrimary, fontSize: 12, lineHeight: 16 },
  journeyPanelTrackWrap: { gap: spacing.sm, paddingHorizontal: spacing.sm },
  journeyPanelTrack: { height: 34, justifyContent: "center", position: "relative" },
  journeyPanelTrackBase: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: "rgba(13, 59, 140, 0.14)"
  },
  journeyPanelTrackFill: {
    position: "absolute",
    left: 0,
    height: 3,
    borderRadius: radius.pill
  },
  journeyPanelNode: {
    position: "absolute",
    top: 12,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "#B9C9DC",
    backgroundColor: colors.white
  },
  journeyPanelPlane: {
    position: "absolute",
    top: 3,
    width: 28,
    height: 28,
    marginLeft: -14,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryBlue,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3
  },
  journeyPanelStepRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs },
  journeyPanelStepLabel: { ...typography.caption, color: colors.textPrimary, fontSize: 11, lineHeight: 14, textAlign: "center", flex: 1 },
  heroSurface: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm
  },
  skyWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 480,
    backgroundColor: "#DCEEFF"
  },
  sunGlow: {
    position: "absolute",
    top: 210,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.58)"
  },
  sunGlowSuccess: {
    backgroundColor: "rgba(219, 255, 228, 0.62)"
  },
  cloudLeftLarge: {
    position: "absolute",
    top: 180,
    left: -90,
    width: 230,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.74)"
  },
  cloudLeftSmall: {
    position: "absolute",
    top: 250,
    left: 20,
    width: 220,
    height: 82,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.58)"
  },
  cloudRightLarge: {
    position: "absolute",
    top: 130,
    right: -100,
    width: 240,
    height: 150,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.72)"
  },
  cloudRightSmall: {
    position: "absolute",
    top: 286,
    right: 8,
    width: 190,
    height: 90,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.5)"
  },
  horizonClouds: {
    position: "absolute",
    top: 360,
    left: -40,
    right: -40,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.55)"
  },
  skyPlane: {
    position: "absolute",
    top: 102,
    right: 54,
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.62,
    transform: [{ rotate: "8deg" }]
  },
  planeTrail: {
    position: "absolute",
    top: 124,
    right: 92,
    width: 122,
    height: 2,
    borderRadius: radius.pill,
    opacity: 0.14,
    transform: [{ rotate: "8deg" }]
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.996 }] }
});