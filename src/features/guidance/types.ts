export type ConfidenceLevel = "high" | "medium" | "low";

export type PredictionMode = "live" | "offlineEstimated" | "userAdjusted";

export type PhaseSource =
  | "liveData"
  | "routeStatistics"
  | "timeEstimate"
  | "userConfirmed";

export type FlightGuidanceState = {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
  phaseSource: PhaseSource;
  lastLiveUpdateAt: string | null;
  isOfflinePrediction: boolean;
  shouldAskForConfirmation: boolean;
  userFacingLabel: string;
  userFacingMessage: string;
};
