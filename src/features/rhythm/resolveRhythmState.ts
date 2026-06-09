import { SituationType } from "@/features/interpreter/situations/types";
import { FlightStatus } from "@/features/flightCore/getFlightStatus";

import { FlightRhythmState } from "./types";

type ResolveRhythmStateInput = {
  flightStatus: FlightStatus;
  situation: SituationType;
  remainingMinutes: number;
  progressPercent: number;
};

/**
 * Rhythm is an experience pacing layer.
 * It does not explain the flight and it does not control UI directly.
 * It only describes how the experience should feel right now.
 */
export function resolveRhythmState({
  flightStatus,
  situation,
  remainingMinutes,
  progressPercent
}: ResolveRhythmStateInput): FlightRhythmState {
  if (
    situation === "holding_pattern_possible" ||
    situation === "slightly_extended_route"
  ) {
    return "extended_wait";
  }

  if (
    situation === "arrival_soon" ||
    situation === "descent_expected" ||
    flightStatus === "arrival_window" ||
    progressPercent >= 80 ||
    remainingMinutes <= 30
  ) {
    return "arrival_guidance";
  }

  if (flightStatus === "before_departure" || flightStatus === "early_flight") {
    return "active_transition";
  }

  return "calm_cruise";
}
