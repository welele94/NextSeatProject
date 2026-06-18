import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { FlightSnapshot } from "@/features/flightSnapshot/types";

import { formatMinutes } from "@/features/time/formatMinutes";
import { colors, radius, rhythmUi, spacing, typography } from "@/theme";
import type { JourneyPhase, JourneyPhaseId } from "@/types/journey";


import { useFlightSnapshot } from "./useFlightSnapshot";


type JourneyTimelineStepId = "pre_flight" | JourneyPhaseId | "after_flight";

type JourneyStepState = "completed" | "current" | "upcoming";

type JourneyStep = {
  id: JourneyTimelineStepId;
  title: string;
  time?: string;
  state: JourneyStepState;
};

const journeyOrder: JourneyTimelineStepId[] = [
  "pre_flight",
  "departure",
  "climb",
  "cruise",
  "descent",
  "approach",
  "arrival",
  "after_flight"
];

const journeyLabels: Record<JourneyTimelineStepId, string> = {
  pre_flight: "Pre-flight",
  departure: "Departure",
  climb: "Climb",
  cruise: "Cruise",
  descent: "Descent",
  approach: "Approach",
  arrival: "Arrival",
  after_flight: "After flight"
};

function addMinutesTotimeLabel(
  timeLabel: string | undefined,
  minutesToAdd: number
): string | undefined {
  if(!timeLabel || /^\d{2}:\d{2}$/.test(timeLabel)){
    return undefined;
  }

  const [hours, minutes] = timeLabel.split(":").map(Number);
  const date = new Date();

  date.setHours(hours);
  date.setMinutes(minutes + minutesToAdd);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const nextHours = String(date.getHours()).padStart(2, "0");
  const nextMinutes = String(date.getMinutes()).padStart(2,"0");

  return `${nextHours}:${nextMinutes}`;

};

function getCurrentTimelineStep(snapshot: FlightSnapshot): JourneyTimelineStepId{
  if (snapshot.progress.isBeforeDeparture){
    return "pre_flight";
  }

  if (snapshot.progress.isAfterArrival){
    return "after_flight";
  }

  return snapshot.phase.id;
}

function getCurrentJourneyIndex(snapshot: FlightSnapshot): number {
  const currentStep = getCurrentTimelineStep(snapshot);
  const index = journeyOrder.indexOf(currentStep);

  return index >= 0 ? index : 0;
};

function buildJourneySteps(snapshot: FlightSnapshot): JourneyStep[]{
  const currentIndex = getCurrentJourneyIndex(snapshot);

  const flightSummary = snapshot.flightSummary as typeof snapshot.flightSummary & {
    scheduledDepartureLabel?: string;
    scheduledArrivalLabel?: string;
  };

  const departureTime = flightSummary.scheduledDepartureLabel ?? "08:10";
  const arrivalTime = flightSummary.scheduledArrivalLabel ?? "09:10";

  const timeByStep: Record<JourneyTimelineStepId, string | undefined> = {
    pre_flight: "Before departure",
    departure: departureTime,
    climb: addMinutesTotimeLabel(departureTime, 15),
    cruise: addMinutesTotimeLabel(departureTime, 30),
    descent: "Later",
    approach: "Later",
    arrival: `Expected ${arrivalTime}`,
    after_flight: "After landing"

  };

  return journeyOrder.map((stepId, index) => {
    const state = 
    index < currentIndex
      ? "completed"
      : index === currentIndex
        ? "current" : "upcoming";

    return {
      id: stepId,
      title: journeyLabels[stepId],
      time: timeByStep[stepId],
      state
    }
  })
}

export default function JourneyTab(){
  const { snapshot} = useFlightSnapshot();

  if (!snapshot){
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Flight not found</Text>
          <Text style={styles.emptyBody}>
            This flight is not available on this device.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const steps = buildJourneySteps(snapshot);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.screenTitle}>Your journey</Text>

        <JourneyTimeline steps={steps} />
      </ScrollView>
    </SafeAreaView>
  )

  function JourneyTimeline({steps}: {steps: JourneyStep[] }){
    return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.state === "completed";
        const isCurrent = step.state === "current";
        const isUpcoming = step.state === "upcoming";

        return (
          <View key={step.id} style={styles.timelineRow}>
            <View style={styles.markerColumn}>
              {!isLast ? (
                <View
                  style={[
                    styles.timelineLine,
                    isCompleted && styles.timelineLineCompleted,
                    isCurrent && styles.timelineLineCurrent
                  ]}
                />
              ) : null}

              <View
                style={[
                  styles.timelineDot,
                  isCompleted && styles.timelineDotCompleted,
                  isCurrent && styles.timelineDotCurrent,
                  isUpcoming && styles.timelineDotUpcoming
                ]}
              />
            </View>

            <View style={styles.stepContent}>
              <View style={styles.stepText}>
                <Text
                  style={[
                    styles.stepTitle,
                    isUpcoming && styles.stepTitleUpcoming
                  ]}
                >
                  {step.title}
                </Text>

                {step.time ? (
                  <Text
                    style={[
                      styles.stepTime,
                      isUpcoming && styles.stepTimeUpcoming
                    ]}
                  >
                    {step.time}
                  </Text>
                ) : null}
              </View>

              {isCompleted || isCurrent ? (
                <View
                  style={[
                    styles.badge,
                    isCompleted && styles.completedBadge,
                    isCurrent && styles.currentBadge
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isCompleted && styles.completedBadgeText,
                      isCurrent && styles.currentBadgeText
                    ]}
                  >
                    {isCompleted ? "Completed" : "Current"}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
}

const styles = StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: colors.surface
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["4xl"],
    paddingBottom: 108
  },

  screenTitle: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing["4xl"]
  },

  timeline: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center"
  },

  timelineRow: {
    minHeight: 72,
    flexDirection: "row"
  },

  markerColumn: {
    width: 34,
    alignItems: "center",
    position: "relative"
  },

  timelineLine: {
    position: "absolute",
    top: 16,
    bottom: -16,
    width: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.border
  },

  timelineLineCompleted: {
    backgroundColor: "#8BC6B4"
  },

  timelineLineCurrent: {
    backgroundColor: "#9DB9EA"
  },

  timelineDot: {
    zIndex: 1,
    marginTop: 2,
    borderRadius: radius.pill
  },

  timelineDotCompleted: {
    width: 12,
    height: 12,
    backgroundColor: "#8BC6B4"
  },

  timelineDotCurrent: {
    width: 14,
    height: 14,
    backgroundColor: colors.primaryBlue
  },

  timelineDotUpcoming: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: "#9CAFC3",
    backgroundColor: colors.surface
  },

  stepContent: {
    flex: 1,
    minHeight: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingLeft: spacing.md
  },

  stepText: {
    flex: 1,
    gap: spacing.xs
  },

  stepTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700"
  },

  stepTitleUpcoming: {
    color: colors.textPrimary
  },

  stepTime: {
    ...typography.caption,
    color: colors.textSecondary
  },

  stepTimeUpcoming: {
    color: "#9CAFC3"
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill
  },

  completedBadge: {
    backgroundColor: colors.successGreen
  },

  currentBadge: {
    backgroundColor: colors.cruiseBlue
  },

  badgeText: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700"
  },

  completedBadgeText: {
    color: "#4F9D80"
  },

  currentBadgeText: {
    color: colors.primaryBlue
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
})