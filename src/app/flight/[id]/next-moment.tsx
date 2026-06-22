import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

function getNextMomentTitle(snapshot: FlightSnapshot): string {
  const minutesUntil = snapshot.expectedMoment.timingEstimate?.minutesUntil;

  if (snapshot.phase.id === "cruise" && minutesUntil !== undefined) {
    return `Descent likely in ${formatCompactMinutes(minutesUntil)}`;
  }

  if (snapshot.phase.id === "descent" || snapshot.phase.id === "approach") {
    return "Arrival preparation may begin soon";
  }

  return snapshot.expectedMoment.title;
}

function getNextMomentBody(snapshot: FlightSnapshot): string {
  if (snapshot.phase.id === "descent") {
    return "It is normal to feel the aircraft change slightly as it begins preparing for arrival.";
  }

  if (snapshot.phase.id === "approach") {
    return "It is normal for this part of the flight to feel busier as the aircraft lines up for arrival.";
  }

  return snapshot.expectedMoment.body;
}

export default function NextMomentScreen() {
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

  const safeSnapshot = snapshot;
  const title = getNextMomentTitle(safeSnapshot);
  const body = getNextMomentBody(safeSnapshot);

  function goToLearn() {
    router.push({
      pathname: "/flight/[id]/learn" as never,
      params: {
        id: safeSnapshot.flightSummary.id
      } as never
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.cloudTopLeft} />
      <View pointerEvents="none" style={styles.cloudBottomRight} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="pulse-outline" size={44} color={colors.white} />
          </View>

          <Text style={styles.label}>Next expected moment</Text>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.body}>{body}</Text>

          <Pressable
            onPress={goToLearn}
            style={({ pressed }) => [
              styles.learnButton,
              pressed && styles.learnButtonPressed
            ]}
          >
            <Text style={styles.learnButtonText}>Learn more</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const softGreen = "#EEF9F3";
const greenText = "#2F8066";
const greenCircle = "#92D2BB";
const greenBorder = "#A9DCCB";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: softGreen
  },

  cloudTopLeft: {
    position: "absolute",
    top: -110,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    opacity: 0.58
  },

  cloudBottomRight: {
    position: "absolute",
    right: -130,
    bottom: 90,
    width: 320,
    height: 320,
    borderRadius: radius.pill,
    backgroundColor: "#DDF4E8",
    opacity: 0.8
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: 108
  },

  centerContent: {
    alignItems: "center",
    gap: spacing.xl
  },

  iconCircle: {
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: greenCircle,
    marginBottom: spacing.md
  },

  label: {
    ...typography.section,
    color: greenText,
    textAlign: "center"
  },

  title: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: "center",
    maxWidth: 340
  },

  body: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "center",
    maxWidth: 310
  },

  learnButton: {
    width: "100%",
    maxWidth: 280,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: greenBorder,
    backgroundColor: colors.white,
    marginTop: spacing["3xl"]
  },

  learnButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }]
  },

  learnButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700"
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
