import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AirportInfoCard,
  FlightDetailsCard,
  GuidanceModeBadge,
  OfflineReadyCard,
  RoutePatternCard
} from "@/components/flight/Sprint10Cards";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { colors, spacing, typography } from "@/theme";

import { useFlightSnapshot } from "./useFlightSnapshot";

export default function MoreTab() {
  const { snapshot } = useFlightSnapshot();

  if (!snapshot) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  const ui = buildFlightUiSnapshot(snapshot);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Flight details</Text>
          <Text style={styles.body}>
            Optional context, kept calm and separate from the main view.
          </Text>
        </View>

        <GuidanceModeBadge
          confidenceLevel={ui.confidenceLevel}
          predictionMode={ui.predictionMode}
        />

        <FlightDetailsCard
          routeLabel={ui.routeLabel}
          phaseLabel={ui.currentPhaseLabel}
        />

        <AirportInfoCard title="Departure information" info={ui.airportInfo} />
        <AirportInfoCard title="Baggage information" info={ui.baggageInfo} />
        <RoutePatternCard summary={ui.routePatternSummary} />
        <OfflineReadyCard status={ui.offlineGuidanceStatus} />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: 132
  },
  header: {
    gap: spacing.sm
  },
  title: {
    ...typography.title,
    color: colors.textPrimary
  },
  body: {
    ...typography.body,
    color: colors.textSecondary
  }
});
