import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlightOverviewCard } from "@/components/FlightOverviewCard";
import { mockFlights } from "@/data/mockFlights";

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
          <Text style={styles.sectionEyebrow}>Flight Mode</Text>
          <Text style={styles.sectionTitle}>Continue your prepared flight</Text>
          <Text style={styles.sectionBody}>
            Flight Mode is the core experience: one flight, one calm flow, one snapshot as the source of truth.
          </Text>
        </View>

        <FlightOverviewCard flight={flight} />

        <Link
          asChild
          href={{
            pathname: "/flight/[id]",
            params: { id: flight.id }
          }}
        >
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Open Flight Mode</Text>
          </Pressable>
        </Link>

        <View style={styles.secondarySections}>
          <Link asChild href="/learn">
            <Pressable style={styles.secondaryCard}>
              <Text style={styles.secondaryTitle}>Learn More</Text>
              <Text style={styles.secondaryBody}>
                Optional calm explanations for common flight sensations.
              </Text>
            </Pressable>
          </Link>

          <Link asChild href="/settings">
            <Pressable style={styles.secondaryCard}>
              <Text style={styles.secondaryTitle}>Settings</Text>
              <Text style={styles.secondaryBody}>
                Preferences and future offline data controls.
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F9"
  },
  content: {
    gap: 18,
    padding: 20
  },
  header: {
    gap: 4,
    paddingTop: 8
  },
  appName: {
    color: "#102331",
    fontSize: 34,
    fontWeight: "800"
  },
  subtitle: {
    color: "#5A6673",
    fontSize: 16
  },
  sectionIntro: {
    gap: 6,
    marginTop: 10
  },
  sectionEyebrow: {
    color: "#7A8A96",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: "#102331",
    fontSize: 22,
    fontWeight: "800"
  },
  sectionBody: {
    color: "#5A6673",
    fontSize: 15,
    lineHeight: 22
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#102331"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  },
  secondarySections: {
    gap: 12,
    marginTop: 8
  },
  secondaryCard: {
    gap: 6,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE5EA",
    borderWidth: 1,
    padding: 16
  },
  secondaryTitle: {
    color: "#102331",
    fontSize: 17,
    fontWeight: "800"
  },
  secondaryBody: {
    color: "#5A6673",
    fontSize: 14,
    lineHeight: 20
  }
});
