import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlightOverviewCard } from "@/components/FlightOverviewCard";
import { mockFlights } from "@/data/mockFlights";
import { colors, spacing, typography } from "@/theme"

export default function HomeScreen() {
  const flight = mockFlights[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>Next Seat</Text>
          <Text style={styles.subtitle}>Your flight, explained calmly.</Text>
        </View>

        <View style={styles.sectionIntro}>
          <Text style={styles.sectionEyebrow}>Prepared flight</Text>
          <Text style={styles.sectionTitle}>Continue your flight companion</Text>
          <Text style={styles.sectionBody}>
             One calm view for what is happening, what comes next, and what you
            can safely ignore.
          </Text>
        </View>

        <FlightOverviewCard flight={flight} />

        <Link
          asChild
          href={{
            pathname: "/flight/[id]/overview",
            params: { id: flight.id }
          }}
        >
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Open Next Seat</Text>
          </Pressable>
        </Link>
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
    gap: spacing.xl,
    padding: spacing.xl
  },
  header: {
    gap: spacing.xs,
    paddingTop: spacing.sm
  },
  appName: {
    ...typography.hero,
    color: colors.textPrimary
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary
  },
  sectionIntro: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  sectionEyebrow: {
    ...typography.eyebrow,
    color: colors.textSecondary
  },
  sectionTitle: {
    ...typography.title,
    color: colors.textPrimary
  },
  sectionBody: {
    ...typography.body,
    color: colors.textSecondary
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.primaryBlue
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "700"
  }
});
