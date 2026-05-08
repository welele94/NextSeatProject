import { RouteCheckpoint } from "@/types/route";

import { SituationType } from "./types";

type GetSituationMessageParams = {
  situation: SituationType;
  currentCheckpoint?: RouteCheckpoint;
};

export type SituationMessage = {
  title: string;
  body: string;
};

export function getSituationMessage({
  situation,
  currentCheckpoint
}: GetSituationMessageParams): SituationMessage {
  switch (situation) {
    case "descent_expected":
      return {
        title: "Descent is expected later",
        body: "The flight is approaching the final part of the route. Small changes in movement can happen normally during this transition."
      };

    case "arrival_soon":
      return {
        title: "Arrival is getting closer",
        body: "Most of the journey is now behind you. The flight is moving toward its scheduled arrival window."
      };

    case "slightly_extended_route":
      return {
        title: "The route may take a little longer",
        body: "Small route adjustments can happen during flights and are usually part of normal traffic organization."
      };

    case "holding_pattern_possible":
      return {
        title: "The flight may remain in this phase for a while",
        body: "Longer periods of stable flight are common and do not necessarily mean anything unusual."
      };

    case "stable_progress":
    default:
      return {
        title: "The flight is progressing normally",
        body: currentCheckpoint
          ? `You are currently around ${currentCheckpoint.label}. The journey is continuing steadily.`
          : "The journey is continuing steadily along the planned route."
      };
  }
}
