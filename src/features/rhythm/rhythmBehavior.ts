import { FlightRhythmState } from "./types";

export type RhythmBehavior = {
  emphasis: "low" | "medium" | "guided";
  scanningMode: "minimal" | "focused" | "steady";
  copyDensity: "short" | "balanced";
  nextMomentPriority: "quiet" | "normal" | "prominent";
  reassuranceTone: "background" | "steady" | "guiding";
};

export const rhythmBehaviorRules: Record<FlightRhythmState, RhythmBehavior> = {
  calm_cruise: {
    emphasis: "low",
    scanningMode: "minimal",
    copyDensity: "short",
    nextMomentPriority: "quiet",
    reassuranceTone: "background"
  },
  active_transition: {
    emphasis: "medium",
    scanningMode: "focused",
    copyDensity: "balanced",
    nextMomentPriority: "normal",
    reassuranceTone: "steady"
  },
  arrival_guidance: {
    emphasis: "guided",
    scanningMode: "focused",
    copyDensity: "balanced",
    nextMomentPriority: "prominent",
    reassuranceTone: "guiding"
  },
  extended_wait: {
    emphasis: "low",
    scanningMode: "steady",
    copyDensity: "short",
    nextMomentPriority: "quiet",
    reassuranceTone: "steady"
  }
};

export function getRhythmBehavior(
  rhythm: FlightRhythmState
): RhythmBehavior {
  return rhythmBehaviorRules[rhythm];
}
