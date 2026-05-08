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
import { calculateFlightProgress } from "@/features/flightCore/calculateFlightProgress";
import { estimateRemainingTime } from "@/features/flightCore/estimateRemainingTime";
import { getCurrentCheckpoint } from "@/features/flightCore/getCurrentCheckpoint";
import { getFlightStatus } from "@/features/flightCore/getFlightStatus";
import { getNextCheckpoint } from "@/features/flightCore/getNextCheckpoint";
import { getNextExpectedMoment } from "@/features/interpreter/expectedMoments/getNextExpectedMoment";
import { getSituationMessage } from "@/features/interpreter/situations/getSituationMessage";
import { resolveSituation } from "@/features/interpreter/situations/resolveSituation";
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

    const remainingMinutes = estimateRemainingTime(
      flight,
      progress.progressPercent
    );

    const situation = resolveSituation({
      flightStatus: status,
      remainingMinutes,
      progressPercent: progress.progressPercent
    });

    const situationMessage = getSituationMessage({
      situation,
      currentCheckpoint
    });

    const nextExpectedMoment = getNextExpectedMoment({
      situation,
      nextCheckpoint,
      remainingMinutes
    });

    return {
      progress: {
        ...progress,
        remainingMinutes
      },
      currentCheckpoint,
      nextCheckpoint,
      status,
      situation,
      situationMessage,
      nextExpectedMoment
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
        <SituationInsightCard
          title={flightState.situationMessage.title}
          body={flightState.situationMessage.body}
        />

        <NextExpectedMomentCard moment={flightState.nextExpectedMoment} />

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