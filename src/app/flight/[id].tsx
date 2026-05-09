import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmbientGlobe } from "@/components/AmbientGlobe";
import { NextExpectedMomentCard } from "@/components/NextExpectedMomentCard";
import { SituationInsightCard } from "@/components/SituationInsightCard";
import { getMockFlightById } from "@/data/mockFlights";
import { buildFlightSnapshot } from "@/features/flightSnapshot/buildFlightSnapshot";
import { formatMinutes } from "@/features/time/formatMinutes";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";

export default function FlightDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentTime, setCurrentTime] = useState(() => getCurrentTimestamp());
  const flight = getMockFlightById(id);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(getCurrentTimestamp()),
      60000
    );

    return () => clearInterval(timer);
  }, []);

  const flightSnapshot = useMemo(() => {
    if (!flight) {
      return undefined;
    }

    return buildFlightSnapshot(flight, currentTime);
  }, [currentTime, flight]);

  if (!flight || !flightSnapshot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: "Flight not found" }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Flight not found</Text>
          <Text style={styles.emptyText}>
            This mocked flight is not available in local data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.routeLabel}>
            {flight.origin.city} → {flight.destination.city}
          </Text>

          <AmbientGlobe
            progressPercent={flightSnapshot.progress.progressPercent}
          />

          <View style={styles.primaryMessageBlock}>
            <Text style={styles.primaryTitle}>
              {flightSnapshot.situationMessage.title}
            </Text>

            <Text style={styles.primaryBody}>
              {flightSnapshot.situationMessage.body}
            </Text>
          </View>
        </View>

        <View style={styles.secondarySection}>
          <NextExpectedMomentCard
            moment={flightSnapshot.nextExpectedMoment}
          />

          <SituationInsightCard
            title="Journey progress"
            body={`About ${formatMinutes(
              flightSnapshot.progress.remainingMinutes
            )} remaining in the scheduled journey.`}
          />
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
    paddingBottom: 80
  },
  heroSection: {
    paddingTop: 28,
    paddingHorizontal: 28,
    gap: 28
  },
  routeLabel: {
    color: "#7A8A96",
    fontSize: 14,
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  primaryMessageBlock: {
    gap: 18,
    paddingHorizontal: 4
  },
  primaryTitle: {
    color: "#102331",
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 46,
    textAlign: "center"
  },
  primaryBody: {
    color: "#5D6B76",
    fontSize: 17,
    lineHeight: 28,
    textAlign: "center"
  },
  secondarySection: {
    gap: 18,
    marginTop: 42,
    paddingHorizontal: 20
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
    padding: 24
  },
  emptyTitle: {
    color: "#102331",
    fontSize: 24,
    fontWeight: "800"
  },
  emptyText: {
    color: "#5A6673",
    fontSize: 16,
    lineHeight: 23
  }
});
