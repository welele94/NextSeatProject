import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlightOverviewCard } from "@/components/FlightOverviewCard";
import { FlightProgressCard } from "@/components/FlightProgressCard";
import { ReassuranceCard } from "@/components/ReassuranceCard";
import { RouteCheckpointList } from "@/components/RouteCheckpointList";
import { getMockFlightById } from "@/data/mockFlights";
import { calculateFlightProgress } from "@/features/flightCore/calculateFlightProgress";
import { estimateRemainingTime } from "@/features/flightCore/estimateRemainingTime";
import { getCurrentCheckpoint } from "@/features/flightCore/getCurrentCheckpoint";
import { getFlightContextMessage } from "@/features/flightCore/getFlightContextMessage";
import { getFlightStatus } from "@/features/flightCore/getFlightStatus";
import { getNextCheckpoint } from "@/features/flightCore/getNextCheckpoint";
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

  const flightState = useMemo(() => {
    if (!flight) {
      return undefined;
    }

    const progress = calculateFlightProgress(flight, currentTime);

    const currentCheckpoint = getCurrentCheckpoint(
      flight.checkpoints,
      progress.progressPercent
    );

    const nextCheckpoint = getNextCheckpoint(
      flight.checkpoints,
      progress.progressPercent
    );

    const status = getFlightStatus(
      progress.progressPercent,
      progress.isBeforeDeparture,
      progress.isAfterArrival
    );

    const message = getFlightContextMessage(
      progress,
      currentCheckpoint,
      nextCheckpoint,
      status
    );

    return {
      progress: {
        ...progress,
        remainingMinutes: estimateRemainingTime(
          flight,
          progress.progressPercent
        )
      },
      currentCheckpoint,
      nextCheckpoint,
      status,
      message
    };
  }, [currentTime, flight]);

  if (!flight || !flightState) {
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
        <ReassuranceCard
          title={flightState.message.title}
          body={flightState.message.body}
        />

        <Text style={styles.statusLabel}>
          Status: {formatStatusLabel(flightState.status)}
        </Text>

        <FlightOverviewCard flight={flight} />

        <FlightProgressCard
          progressPercent={flightState.progress.progressPercent}
          elapsedMinutes={flightState.progress.elapsedMinutes}
          remainingMinutes={flightState.progress.remainingMinutes}
        />

        <RouteCheckpointList
          currentCheckpoint={flightState.currentCheckpoint}
          nextCheckpoint={flightState.nextCheckpoint}
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