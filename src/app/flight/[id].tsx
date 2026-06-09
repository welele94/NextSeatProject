import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AmbientGlobe } from "@/components/AmbientGlobe";
import { NextExpectedMomentCard } from "@/components/NextExpectedMomentCard";
import { SituationInsightCard } from "@/components/SituationInsightCard";
import { getMockFlightById } from "@/data/mockFlights";
import { buildFlightSnapshot } from "@/features/flightSnapshot/buildFlightSnapshot";
import { FlightRhythmState } from "@/features/rhythm/types";
import { formatMinutes } from "@/features/time/formatMinutes";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";

type RhythmPresentation = {
  screenBackground: string;
  heroGap: number;
  heroPaddingTop: number;
  globeScale: number;
  globeOpacity: number;
  primaryTitleSize: number;
  primaryTitleLineHeight: number;
  primaryBodyOpacity: number;
  secondaryGap: number;
  secondaryMarginTop: number;
  nextMomentWrapperStyle: object;
};

export default function FlightDetailScreen() {
  const router = useRouter();
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

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  if (!flight || !flightSnapshot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />

        <Pressable
          onPress={handleBackPress}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Flight not found</Text>
          <Text style={styles.emptyText}>
            This mocked flight is not available in local data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const presentation = rhythmPresentation[flightSnapshot.rhythm];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: presentation.screenBackground }
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable
        onPress={handleBackPress}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backButtonText}>‹ Back</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: presentation.screenBackground }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroSection,
            {
              gap: presentation.heroGap,
              paddingTop: presentation.heroPaddingTop
            }
          ]}
        >
          <Text style={styles.routeLabel}>
            {flight.origin.city} → {flight.destination.city}
          </Text>

          <View
            style={[
              styles.globeFrame,
              {
                opacity: presentation.globeOpacity,
                transform: [{ scale: presentation.globeScale }]
              }
            ]}
          >
            <AmbientGlobe
              progressPercent={flightSnapshot.progress.progressPercent}
            />
          </View>

          <View style={styles.primaryMessageBlock}>
            <Text
              style={[
                styles.primaryTitle,
                {
                  fontSize: presentation.primaryTitleSize,
                  lineHeight: presentation.primaryTitleLineHeight
                }
              ]}
            >
              {flightSnapshot.situationMessage.title}
            </Text>

            <Text
              style={[
                styles.primaryBody,
                { opacity: presentation.primaryBodyOpacity }
              ]}
            >
              {flightSnapshot.situationMessage.body}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.secondarySection,
            {
              gap: presentation.secondaryGap,
              marginTop: presentation.secondaryMarginTop
            }
          ]}
        >
          <View style={presentation.nextMomentWrapperStyle}>
            <NextExpectedMomentCard
              moment={flightSnapshot.nextExpectedMoment}
              initiallyExpanded
            />
          </View>

          <SituationInsightCard
            label="Why is this happening?"
            title={flightSnapshot.situationMessage.title}
            body={`${flightSnapshot.situationMessage.body} About ${formatMinutes(flightSnapshot.progress.remainingMinutes)} remains in the scheduled journey.`}
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
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.72)"
  },
  backButtonText: {
    color: "#41515F",
    fontSize: 15,
    fontWeight: "700"
  },
  content: {
    paddingBottom: 92
  },
  heroSection: {
    paddingHorizontal: 24
  },
  routeLabel: {
    color: "#7A8A96",
    fontSize: 13,
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  globeFrame: {
    alignItems: "center"
  },
  primaryMessageBlock: {
    gap: 14,
    paddingHorizontal: 2
  },
  primaryTitle: {
    color: "#102331",
    fontWeight: "300",
    textAlign: "center"
  },
  primaryBody: {
    color: "#5D6B76",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center"
  },
  secondarySection: {
    paddingHorizontal: 18
  },
  quietMoment: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }]
  },
  standardMoment: {
    opacity: 0.92
  },
  guidedMoment: {
    opacity: 1,
    transform: [{ scale: 1.015 }]
  },
  waitingMoment: {
    opacity: 0.84,
    transform: [{ scale: 0.965 }]
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

const rhythmPresentation: Record<FlightRhythmState, RhythmPresentation> = {
  calm_cruise: {
    screenBackground: "#F7F8F8",
    heroGap: 24,
    heroPaddingTop: 24,
    globeScale: 0.58,
    globeOpacity: 0.68,
    primaryTitleSize: 31,
    primaryTitleLineHeight: 40,
    primaryBodyOpacity: 0.74,
    secondaryGap: 18,
    secondaryMarginTop: 34,
    nextMomentWrapperStyle: styles.quietMoment
  },
  active_transition: {
    screenBackground: "#F6F7F9",
    heroGap: 22,
    heroPaddingTop: 18,
    globeScale: 0.64,
    globeOpacity: 0.82,
    primaryTitleSize: 32,
    primaryTitleLineHeight: 41,
    primaryBodyOpacity: 0.86,
    secondaryGap: 16,
    secondaryMarginTop: 30,
    nextMomentWrapperStyle: styles.standardMoment
  },
  arrival_guidance: {
    screenBackground: "#F6F8F8",
    heroGap: 20,
    heroPaddingTop: 16,
    globeScale: 0.68,
    globeOpacity: 0.9,
    primaryTitleSize: 33,
    primaryTitleLineHeight: 42,
    primaryBodyOpacity: 0.92,
    secondaryGap: 14,
    secondaryMarginTop: 26,
    nextMomentWrapperStyle: styles.guidedMoment
  },
  extended_wait: {
    screenBackground: "#F8F8F6",
    heroGap: 26,
    heroPaddingTop: 22,
    globeScale: 0.56,
    globeOpacity: 0.58,
    primaryTitleSize: 30,
    primaryTitleLineHeight: 39,
    primaryBodyOpacity: 0.72,
    secondaryGap: 20,
    secondaryMarginTop: 38,
    nextMomentWrapperStyle: styles.waitingMoment
  }
};
