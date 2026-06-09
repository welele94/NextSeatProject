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
        title: "Preparing for the final part",
        body: "The journey is moving toward arrival. Changes in movement can feel different here, and they are expected."
      };

    case "arrival_soon":
      return {
        title: "You are getting close",
        body: "Most of the journey is behind you. The flight is entering its final scheduled window."
      };

    case "slightly_extended_route":
      return {
        title: "The route is taking a little longer",
        body: "The flight is still continuing normally. Small route changes can happen without meaning anything is wrong."
      };

    case "holding_pattern_possible":
      return {
        title: "The flight is staying steady",
        body: "It may remain in this part of the journey for a while. That can be a normal part of the flight flow."
      };

    case "stable_progress":
    default:
      return {
        title: "The flight is continuing calmly",
        body: currentCheckpoint
          ? `You are around ${currentCheckpoint.label}. The journey is moving steadily onward.`
          : "The journey is moving steadily onward."
      };
  }
}
