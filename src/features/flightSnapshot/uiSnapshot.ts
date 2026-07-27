import type { FlightSnapshot } from "./types";
import type { NextExpectedMoment } from "@/types/nextExpectedMoment";

export type ConfidenceLevel = "high" | "medium" | "low";
export type PredictionMode = "live" | "offline-estimated" | "user-adjusted";

export type RoutePatternSummary = {
  title: string;
  body: string;
  typicalDurationLabel?: string;
  typicalDescentLabel?: string;
  reassurance: string;
};

export type OfflineGuidanceStatus = {
  isReady: boolean;
  items: Array<{ label: string; isReady: boolean }>;
};

export type FlightDetailsSnapshot = {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
  phaseSource: "schedule" | "live" | "user-confirmed";
  lastLiveUpdateAt?: string;
  routePatternSummary?: RoutePatternSummary;
  offlineGuidanceStatus: OfflineGuidanceStatus;
  shouldAskForConfirmation: boolean;
};

export type FlightUiSnapshot = {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
  currentPhaseLabel: string;
  routeLabel: string;
  reassuranceMessage: {
    title: string;
    body: string;
  };
  nextExpectedMoment: NextExpectedMoment;
  routePatternSummary?: RoutePatternSummary;
  offlineGuidanceStatus: OfflineGuidanceStatus;
  shouldAskForConfirmation: boolean;
  guidanceCopy: string;
};

const mockDetails: FlightDetailsSnapshot = {
  confidenceLevel: "high",
  predictionMode: "offline-estimated",
  phaseSource: "schedule",
  lastLiveUpdateAt: "Saved before departure",
  shouldAskForConfirmation: false,
  routePatternSummary: {
    title: "Recent route pattern",
    body: "Recent flights on this route followed a normal timing pattern.",
    typicalDurationLabel: "Around 1h05m",
    typicalDescentLabel: "Usually 30-35 min before arrival",
    reassurance: "Small timing differences are normal and expected."
  },
  offlineGuidanceStatus: {
    isReady: true,
    items: [
      { label: "Flight information saved", isReady: true },
      { label: "Takeoff explanation ready", isReady: true },
      { label: "Next expected moment prepared", isReady: true },
      { label: "Offline guidance available", isReady: true }
    ]
  }
};

function getGuidanceCopy(details: FlightDetailsSnapshot): string {
  if (details.predictionMode === "user-adjusted") {
    return "Based on your latest confirmation, the guidance has been adjusted calmly.";
  }

  if (details.predictionMode === "offline-estimated") {
    return "Based on the saved flight plan, your flight appears to be following the expected pattern.";
  }

  if (details.confidenceLevel === "low") {
    return "The latest information is limited, so Next Seat is keeping the guidance gentle and general.";
  }

  return "Based on the latest available information, your flight appears to be following the expected pattern.";
}

function buildCompletedFlightUi(snapshot: FlightSnapshot): Pick<
  FlightUiSnapshot,
  "currentPhaseLabel" | "reassuranceMessage" | "nextExpectedMoment" | "guidanceCopy"
> {
  const destination = snapshot.flightSummary.destinationLabel;

  return {
    currentPhaseLabel: "Arrived",
    reassuranceMessage: {
      title: "You've arrived",
      body: `Your flight has landed in ${destination}. The journey is complete.`
    },
    nextExpectedMoment: {
      title: `Welcome to ${destination}`,
      body: "The aircraft is now completing its arrival at the gate.",
      description:
        "You may notice the seatbelt sign switching off, passengers collecting their belongings, and the doors opening once the aircraft is safely parked.",
      confidence: "high",
      context: "general_guidance"
    },
    guidanceCopy:
      "Your flight has arrived. Next Seat will keep the final guidance simple while you prepare to leave the aircraft."
  };
}

export function buildFlightUiSnapshot(
  snapshot: FlightSnapshot,
  details: FlightDetailsSnapshot = mockDetails
): FlightUiSnapshot {
  const completedUi =
    snapshot.status === "completed" ? buildCompletedFlightUi(snapshot) : undefined;

  return {
    confidenceLevel: details.confidenceLevel,
    predictionMode: details.predictionMode,
    currentPhaseLabel: completedUi?.currentPhaseLabel ?? snapshot.phase.label,
    routeLabel: snapshot.flightSummary.routeLabel,
    reassuranceMessage: completedUi?.reassuranceMessage ?? snapshot.reassurance,
    nextExpectedMoment: completedUi?.nextExpectedMoment ?? snapshot.expectedMoment,
    routePatternSummary: details.routePatternSummary,
    offlineGuidanceStatus: details.offlineGuidanceStatus,
    shouldAskForConfirmation: details.shouldAskForConfirmation,
    guidanceCopy: completedUi?.guidanceCopy ?? getGuidanceCopy(details)
  };
}
