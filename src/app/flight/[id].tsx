import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlightOverviewCard } from "@/components/FlightOverviewCard";
import { FlightProgressCard } from "@/components/FlightProgressCard";
import { NextExpectedMomentCard } from "@/components/NextExpectedMomentCard";
import { RouteCheckpointList } from "@/components/RouteCheckpointList";
import { SituationInsightCard } from "@/components/SituationInsightCard";
import { getMockFlightById } from "@/data/mockFlights";
import { buildFlightSnapshot } from "@/features/flightSnapshot/buildFlightSnapshot";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";

function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

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
      <Stack.Screen options={{ title: flight.flightNumber }} />
      <ScrollView contentContainerStyle={styles.content}>
        <SituationInsightCard
          title={flightSnapshot.situationMessage.title}
          body={flightSnapshot.situationMessage.body}
        />

        <NextExpectedMomentCard
          moment={flightSnapshot.nextExpectedMoment}
        />

        <Text style={styles.statusLabel}>
          Status: {formatStatusLabel(flightSnapshot.status)}
        </Text>

        <FlightOverviewCard flight={flight} />

        <FlightProgressCard
          progressPercent={flightSnapshot.progress.progressPercent}
          elapsedMinutes={flightSnapshot.progress.elapsedMinutes}
          remainingMinutes={flightSnapshot.progress.remainingMinutes}
        />

        <RouteCheckpointList
          currentCheckpoint={flightSnapshot.currentCheckpoint}
          nextCheckpoint={flightSnapshot.nextCheckpoint}
        />
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
    gap: 14,
    padding: 20
  },
  statusLabel: {
    color: "#5A6673",
    fontSize: 13,
    fontWeight: "600"
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