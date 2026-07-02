import { FlightProgress } from "@/types/flight";

import { FlightStatus } from "@/features/flightCore/getFlightStatus";

import { FlightGuidanceState, OfflineReadiness } from "./types";

type ResolveGuidanceStateInput = {
  progress: FlightProgress;
  status: FlightStatus;
  lastLiveUpdateAt?: string | null;
  userConfirmedPhase?: boolean;
  hasOfflineFlightPack?: boolean;
  hasRoutePatternSummary?: boolean;
};

function getMinutesSinceLastLiveUpdate(
  lastLiveUpdateAt?: string | null
): number | undefined {
  if (!lastLiveUpdateAt) {
    return undefined;
  }

  const lastUpdateTime = new Date(lastLiveUpdateAt).getTime();

  if (Number.isNaN(lastUpdateTime)) {
    return undefined;
  }

  return Math.max(Math.round((Date.now() - lastUpdateTime) / 60000), 0);
}

function resolveOfflineReadiness({
  hasOfflineFlightPack,
  hasRoutePatternSummary
}: {
  hasOfflineFlightPack: boolean;
  hasRoutePatternSummary: boolean;
}): OfflineReadiness {
  if (hasOfflineFlightPack && hasRoutePatternSummary) {
    return "ready";
  }

  if (hasOfflineFlightPack) {
    return "partial";
  }

  return "notReady";
}

export function resolveGuidanceState({
  progress,
  status,
  lastLiveUpdateAt = null,
  userConfirmedPhase = false,
  hasOfflineFlightPack = true,
  hasRoutePatternSummary = false
}: ResolveGuidanceStateInput): FlightGuidanceState {
  const offlineReadiness = resolveOfflineReadiness({
    hasOfflineFlightPack,
    hasRoutePatternSummary
  });

  if (userConfirmedPhase) {
    return {
      confidenceLevel: "high",
      predictionMode: "userAdjusted",
      phaseSource: "userConfirmed",
      lastLiveUpdateAt,
      offlineReadiness,
      isOfflinePrediction: true,
      shouldAskForConfirmation: false,
      userFacingLabel: "Adjusted guidance",
      userFacingMessage:
        "This guidance has been adjusted using what you confirmed during the flight."
    };
  }

  const minutesSinceLiveUpdate = getMinutesSinceLastLiveUpdate(lastLiveUpdateAt);

  if (minutesSinceLiveUpdate !== undefined && minutesSinceLiveUpdate <= 20) {
    return {
      confidenceLevel: "high",
      predictionMode: offlineReadiness === "ready" ? "readyOffline" : "live",
      phaseSource: "liveData",
      lastLiveUpdateAt,
      offlineReadiness,
      isOfflinePrediction: false,
      shouldAskForConfirmation: false,
      userFacingLabel:
        offlineReadiness === "ready" ? "Ready to fly offline" : "Live guidance",
      userFacingMessage:
        offlineReadiness === "ready"
          ? "The app has saved enough flight information to keep guiding you calmly if you go offline."
          : "This guidance is based on the latest available flight information."
    };
  }

  const shouldAskForConfirmation =
    status === "arrival_window" && progress.remainingMinutes > 20;

  return {
    confidenceLevel: shouldAskForConfirmation ? "low" : "medium",
    predictionMode: "offlineEstimated",
    phaseSource: progress.progressPercent > 65 ? "routeStatistics" : "timeEstimate",
    lastLiveUpdateAt,
    offlineReadiness,
    isOfflinePrediction: true,
    shouldAskForConfirmation,
    confirmationPrompt: shouldAskForConfirmation
      ? {
          title: "Does this still feel accurate?",
          body:
            "This helps the app keep its guidance aligned with what you are noticing.",
          options: [
            { id: "yes", label: "Yes" },
            { id: "notSure", label: "Not sure" },
            { id: "changed", label: "Something changed" }
          ]
        }
      : undefined,
    userFacingLabel: shouldAskForConfirmation
      ? "Quick check"
      : "Estimated guidance",
    userFacingMessage: shouldAskForConfirmation
      ? "To keep guidance accurate, the app may ask what you are noticing now."
      : "You may be offline now, so this is based on the saved schedule and typical flight timing."
  };
}
