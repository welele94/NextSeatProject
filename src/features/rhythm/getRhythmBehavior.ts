import { FlightRhythmState } from "./types";

export type RhythmBehavior = {
  messageDepth: "short" | "normal" | "supportive";
  nextMomentEmphasis: "low" | "medium" | "high";
  expandablePriority: "low" | "normal" | "high";
};

export function getRhythmBehavior(
  rhythm: FlightRhythmState
): RhythmBehavior {
  switch (rhythm) {
    case "arrival_guidance":
      return {
        messageDepth: "supportive",
        nextMomentEmphasis: "high",
        expandablePriority: "high"
      };

    case "extended_wait":
      return {
        messageDepth: "supportive",
        nextMomentEmphasis: "medium",
        expandablePriority: "high"
      };

    case "active_transition":
      return {
        messageDepth: "normal",
        nextMomentEmphasis: "medium",
        expandablePriority: "normal"
      };

    case "calm_cruise":
    default:
      return {
        messageDepth: "short",
        nextMomentEmphasis: "low",
        expandablePriority: "low"
      };
  }
}
