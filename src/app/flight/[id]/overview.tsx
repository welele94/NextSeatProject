import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AirportInfoCard,
  ConfirmationPrompt,
  CurrentMomentSummaryCard,
  EndJourneyButton,
  GuidanceModeBadge,
  JourneyProgress,
  NextExpectedMomentCard,
  OfflineReadyCard,
  StatusHeroCard
} from "@/components/flight/Sprint10Cards";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing } from "@/theme";

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

        <JourneyProgress
          routeLabel={ui.routeLabel}
          phaseLabel={ui.currentPhaseLabel}
          progressPercent={snapshot.progress.progressPercent}
          onPress={openJourney}
        />

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
  heroSurface: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
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
  }
});