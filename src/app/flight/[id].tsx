import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  background: string;
  heroGap: number;
  heroPaddingTop: number;
  globeScale: number;
  globeOpacity: number;
  titleSize: number;
  titleLineHeight: number;
  bodyOpacity: number;
  nextEmphasized: boolean;
  sectionGap: number;
  sectionMarginTop: number;
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

  const snapshot = useMemo(() => {
    if (!flight) {
      return undefined;
    }

    return buildFlightSnapshot(flight, currentTime);
  }, [flight, currentTime]);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  if (!snapshot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />

        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Flight not found</Text>
          <Text style={styles.emptyText}>
            This flight is not available on this device.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const presentation = rhythmPresentation[snapshot.rhythm];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: presentation.background }
      ]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable onPress={handleBackPress} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back</Text>
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { backgroundColor: presentation.background }
        ]}
      >
        <View
          style={[
            styles.hero,
            {
              gap: presentation.heroGap,
              paddingTop: presentation.heroPaddingTop
            }
          ]}
        >
          <Text style={styles.routeLabel}>
            {snapshot.journey.routeLabel}
          </Text>

          <Text
            style={[
              styles.heroTitle,
              {
                fontSize: presentation.titleSize,
                lineHeight: presentation.titleLineHeight
              }
            ]}
          >
            {snapshot.reassurance.title}
          </Text>

          <Text
            style={[
              styles.heroBody,
              { opacity: presentation.bodyOpacity }
            ]}
          >
            {snapshot.reassurance.body}
          </Text>

          <View
            style={[
              styles.globeWrapper,
              {
                opacity: presentation.globeOpacity,
                transform: [{ scale: presentation.globeScale }]
              }
            ]}
          >
            <AmbientGlobe
              progressPercent={snapshot.progress.progressPercent}
            />
          </View>
        </View>

        <View
          style={[
            styles.sections,
            {
              gap: presentation.sectionGap,
              marginTop: presentation.sectionMarginTop
            }
          ]}
        >
          <NextExpectedMomentCard
            moment={snapshot.expectedMoment}
            emphasized={presentation.nextEmphasized}
          />

          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Journey progress</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      Math.max(snapshot.journey.completedPercent, 0),
                      100
                    )}%`
                  }
                ]}
              />
            </View>

            <View style={styles.progressMeta}>
              <Text style={styles.progressText}>
                {snapshot.phase.label}
              </Text>

              <Text style={styles.progressText}>
                About {formatMinutes(snapshot.journey.remainingMinutes)} left
              </Text>
            </View>
          </View>

          <SituationInsightCard
            title={snapshot.phase.passengerMeaning}
            body={`${snapshot.phase.description} ${snapshot.reassurance.body}`}
          />

          <SituationInsightCard
            label="Optional details"
            title="Route awareness"
            body={`The journey is from ${snapshot.journey.originLabel} to ${snapshot.journey.destinationLabel}. These details are here if you want them, but you do not need to monitor them.`}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.78)"
  },
  backButtonText: {
    color: "#0D3B8C",
    fontSize: 15,
    fontWeight: "800"
  },
  content: {
    paddingBottom: 96
  },
  hero: {
    paddingHorizontal: 24,
    alignItems: "center"
  },
  routeLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#16213E",
    fontWeight: "700",
    textAlign: "center"
  },
  heroBody: {
    color: "#64748B",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center"
  },
  globeWrapper: {
    alignItems: "center",
    marginTop: -8
  },
  sections: {
    paddingHorizontal: 18
  },
  progressCard: {
    gap: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: 1,
    borderColor: "#E5EAF0"
  },
  progressLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E5EAF0",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0D3B8C"
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  progressText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600"
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 8
  },
  emptyTitle: {
    color: "#16213E",
    fontSize: 24,
    fontWeight: "800"
  },
  emptyText: {
    color: "#64748B",
    fontSize: 16,
    lineHeight: 24
  }
});

const rhythmPresentation: Record<FlightRhythmState, RhythmPresentation> = {
  calm_cruise: {
    background: "#F8FAFC",
    heroGap: 14,
    heroPaddingTop: 20,
    globeScale: 0.56,
    globeOpacity: 0.55,
    titleSize: 31,
    titleLineHeight: 39,
    bodyOpacity: 0.76,
    nextEmphasized: false,
    sectionGap: 16,
    sectionMarginTop: 18
  },
  active_transition: {
    background: "#F8FAFC",
    heroGap: 15,
    heroPaddingTop: 18,
    globeScale: 0.62,
    globeOpacity: 0.74,
    titleSize: 32,
    titleLineHeight: 40,
    bodyOpacity: 0.86,
    nextEmphasized: true,
    sectionGap: 15,
    sectionMarginTop: 16
  },
  arrival_guidance: {
    background: "#F3ECFF",
    heroGap: 14,
    heroPaddingTop: 16,
    globeScale: 0.6,
    globeOpacity: 0.7,
    titleSize: 33,
    titleLineHeight: 41,
    bodyOpacity: 0.9,
    nextEmphasized: true,
    sectionGap: 14,
    sectionMarginTop: 14
  },
  extended_wait: {
    background: "#FFF3E2",
    heroGap: 18,
    heroPaddingTop: 22,
    globeScale: 0.52,
    globeOpacity: 0.48,
    titleSize: 30,
    titleLineHeight: 38,
    bodyOpacity: 0.78,
    nextEmphasized: false,
    sectionGap: 18,
    sectionMarginTop: 22
  }
};