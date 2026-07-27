import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  GuidanceModeBadge,
  NextExpectedMomentCard
} from "@/components/flight/Sprint10Cards";
import { buildFlightUiSnapshot } from "@/features/flightSnapshot/uiSnapshot";
import { useFlightSnapshot } from "@/features/flightSnapshot/useFlightSnapshot";
import { colors, radius, spacing, typography } from "@/theme";

export default function NextMomentScreen() {
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
        <GuidanceModeBadge
          confidenceLevel={ui.confidenceLevel}
          predictionMode={ui.predictionMode}
        />

        <Text style={styles.screenTitle}>Next expected moment</Text>

        <NextExpectedMomentCard moment={ui.nextExpectedMoment} expanded />

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/flight/[id]/learn" as never,
              params: { id: snapshot.flightSummary.id } as never
            })
          }
          style={styles.learnButton}
        >
          <Text style={styles.learnButtonText}>Learn more</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF9F3"
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: 132
  },
  screenTitle: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: "center"
  },
  learnButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#A9DCCB",
    backgroundColor: colors.white
  },
  learnButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700"
  }
});
