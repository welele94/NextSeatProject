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

function SkyBackground({ accent, soft }: { accent: string; soft: string }) {
  return (
    <>
      <View pointerEvents="none" style={[styles.cloudTop, { backgroundColor: soft }]} />
      <View pointerEvents="none" style={[styles.cloudRight, { backgroundColor: accent }]} />
      <View pointerEvents="none" style={[styles.cloudBottom, { backgroundColor: soft }]} />
    </>
  );
}

export default function OverviewTab() {
  const { snapshot, endJourney } = useFlightSnapshot();

  if (!snapshot) return <SafeAreaView style={styles.safeArea} />;

  const ui = buildFlightUiSnapshot(snapshot);
  const safeSnapshot = snapshot;

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: ui.phaseTheme.pageBackground }]}>
      <SkyBackground accent={ui.phaseTheme.accent} soft={ui.phaseTheme.accentSoft} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.accentBar, { backgroundColor: ui.phaseTheme.accent }]} />

        <GuidanceModeBadge confidenceLevel={ui.confidenceLevel} predictionMode={ui.predictionMode} />

        <View style={[styles.heroSurface, { backgroundColor: ui.phaseTheme.accentSurface, borderColor: ui.phaseTheme.accentBorder }]}>
          <StatusHeroCard
            title={ui.reassuranceMessage.title}
            body={ui.reassuranceMessage.body}
            phaseLabel={ui.currentPhaseLabel}
            guidanceCopy={ui.guidanceCopy}
            onPress={openCurrentMoment}
          />
        </View>

        <View style={[styles.cardAccent, { borderLeftColor: ui.phaseTheme.accent }]}>
          <AirportInfoCard title="Departure information" info={ui.airportInfo} />
        </View>

        <View style={[styles.cardAccent, { borderLeftColor: ui.phaseTheme.accent }]}>
          <JourneyProgress
            routeLabel={ui.routeLabel}
            phaseLabel={ui.currentPhaseLabel}
            progressPercent={snapshot.progress.progressPercent}
          />
        </View>

        <View style={[styles.cardAccent, { borderLeftColor: ui.phaseTheme.accent }]}>
          <NextExpectedMomentCard moment={ui.nextExpectedMoment} onPress={openNextMoment} />
        </View>

        <View style={[styles.cardAccent, { borderLeftColor: ui.phaseTheme.accent }]}>
          <AirportInfoCard title="After landing" info={ui.baggageInfo} />
        </View>

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
  accentBar: {
    width: 52,
    height: 5,
    borderRadius: radius.pill,
    alignSelf: "center",
    opacity: 0.85
  },
  heroSurface: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    overflow: "hidden"
  },
  cardAccent: {
    borderLeftWidth: 4,
    borderRadius: radius.xl
  },
  cloudTop: {
    position: "absolute",
    top: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: radius.pill,
    opacity: 0.7
  },
  cloudRight: {
    position: "absolute",
    top: 190,
    right: -150,
    width: 320,
    height: 320,
    borderRadius: radius.pill,
    opacity: 0.08
  },
  cloudBottom: {
    position: "absolute",
    bottom: -120,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: radius.pill,
    opacity: 0.58
  }
});
