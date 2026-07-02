export type ConfidenceLevel = "high" | "medium" | "low";

export type PredictionMode =
  | "live"
  | "readyOffline"
  | "offlineEstimated"
  | "userAdjusted";

export type PhaseSource =
  | "liveData"
  | "routeStatistics"
  | "timeEstimate"
  | "userConfirmed";

export type OfflineReadiness = "ready" | "partial" | "notReady";

export type ConfirmationOptionId = "yes" | "notSure" | "changed";

export type ConfirmationPrompt = {
  title: string;
  body: string;
  options: Array<{
    id: ConfirmationOptionId;
    label: string;
  }>;
};

export type FlightGuidanceState = {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
  phaseSource: PhaseSource;
  lastLiveUpdateAt: string | null;
  offlineReadiness: OfflineReadiness;
  isOfflinePrediction: boolean;
  shouldAskForConfirmation: boolean;
  confirmationPrompt?: ConfirmationPrompt;
  userFacingLabel: string;
  userFacingMessage: string;
};
