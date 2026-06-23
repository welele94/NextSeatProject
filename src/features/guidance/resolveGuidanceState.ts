import { FlightProgress } from "@/types/flight";

import { FlightStatus } from "@/features/flightCore/getFlightStatus";

import { FlightGuidanceState } from "./types";

type ResolveGuidanceStateInput = {
  progress: FlightProgress;
  status: FlightStatus;
  lastLiveUpdateAt?: string | null;
  userConfirmedPhase?: boolean;
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

export function resolveGuidanceState({
  progress,
  status,
  lastLiveUpdateAt = null,
  userConfirmedPhase = false
}: ResolveGuidanceStateInput): FlightGuidanceState {
  if (userConfirmedPhase) {
    return {
      confidenceLevel: "high",
      predictionMode: "userAdjusted",
      phaseSource: "userConfirmed",
      lastLiveUpdateAt,
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
      predictionMode: "live",
      phaseSource: "liveData",
      lastLiveUpdateAt,
      isOfflinePrediction: false,
      shouldAskForConfirmation: false,
      userFacingLabel: "Live guidance",
      userFacingMessage:
        "This guidance is based on the latest available flight information."
    };
  }

  const shouldAskForConfirmation =
    status === "arrival_window" && progress.remainingMinutes > 20;

  return {
    confidenceLevel: shouldAskForConfirmation ? "low" : "medium",
    predictionMode: "offlineEstimated",
    phaseSource: progress.progressPercent > 65 ? "routeStatistics" : "timeEstimate",
    lastLiveUpdateAt,
    isOfflinePrediction: true,
    shouldAskForConfirmation,
    userFacingLabel: shouldAskForConfirmation
      ? "Quick check"
      : "Estimated guidance",
    userFacingMessage: shouldAskForConfirmation
      ? "To keep guidance accurate, the app may ask what you are noticing now."
      : "You may be offline now, so this is based on the saved schedule and typical flight timing."
  };
}
