import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AirportInfoCard,
  ConfirmationPrompt,
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

function SkyBackground() {
  return (
    <>
      <View pointerEvents="none" style={styles.cloudTop} />
      <View pointerEvents="none" style={styles.cloudRight} />
      <View pointerEvents="none" style={styles.cloudBottom} />
    </>
  );
}

export default function OverviewTab() {
  const { snapshot, endJourney } = useFlightSnapshot();

  if (!snapshot) return <SafeAreaView style={styles.safeArea} />;

  const ui = buildFlightUiSnapshot(snapshot);
  const safeSnapshot = snapshot;

  function openNextMoment() {
    router.push({
      pathname: "/flight/[id]/next-moment" as never,
      params: { id: safeSnapshot.flightSummary.id } as never
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SkyBackground />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <GuidanceModeBadge confidenceLevel={ui.confidenceLevel} predictionMode={ui.predictionMode} />

        <StatusHeroCard
          title={ui.reassuranceMessage.title}
          body={ui.reassuranceMessage.body}
          phaseLabel={ui.currentPhaseLabel}
          guidanceCopy={ui.guidanceCopy}
        />

        <AirportInfoCard title="Departure information" info={ui.airportInfo} />

        <JourneyProgress
          routeLabel={ui.routeLabel}
          phaseLabel={ui.currentPhaseLabel}
          progressPercent={snapshot.progress.progressPercent}
        />

        <NextExpectedMomentCard moment={ui.nextExpectedMoment} onPress={openNextMoment} />

        <AirportInfoCard title="After landing" info={ui.baggageInfo} />

        <OfflineReadyCard status={ui.offlineGuidanceStatus} compact />

        {ui.shouldAskForConfirmation ? <ConfirmationPrompt /> : null}
        {ui.shouldShowEndJourney ? <EndJourneyButton onPress={() => void endJourney()} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EAF7FF" },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 132
  },
  cloudTop: {
    position: "absolute",
    top: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    opacity: 0.72
  },
  cloudRight: {
    position: "absolute",
    top: 190,
    right: -150,
    width: 320,
    height: 320,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    opacity: 0.48
  },
  cloudBottom: {
    position: "absolute",
    bottom: -120,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: radius.pill,
    backgroundColor: "#DDF0FF",
    opacity: 0.62
  }
});
