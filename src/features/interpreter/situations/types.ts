import { FlightStatus } from "@/features/flightCore/getFlightStatus";

export type SituationType =
  | "stable_progress"
  | "descent_expected"
  | "arrival_soon"
  | "slightly_extended_route"
  | "holding_pattern_possible";

export type InterpretationInput = {
  flightStatus: FlightStatus;
  remainingMinutes: number;
  progressPercent: number;
  delayedMinutes?: number;
};

export type SituationExplanation = {
  title: string;
  body: string;
};