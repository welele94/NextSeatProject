export type JourneyPhaseId =
  | "departure"
  | "climb"
  | "cruise"
  | "descent"
  | "approach"
  | "arrival";

export type JourneyPhaseIntensity = "low" | "medium" | "high";

export interface JourneyPhase {
  id: JourneyPhaseId;
  label: string;
  description: string;
  expectedProgressRange: {
    startPercent: number;
    endPercent: number;
  };
  intensity: JourneyPhaseIntensity;
  passengerMeaning: string;
  typicalSensations?: string[];
}

export interface JourneyInformation {
  originLabel: string;
  destinationLabel: string;
  routeLabel: string;
  aircraftLabel?: string;
  estimatedDurationMinutes: number;
  remainingMinutes: number;
  completedPercent: number;
}
