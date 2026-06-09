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
        body: "The journey is moving toward arrival. Some changes may become easier to notice."
      };

    case "arrival_soon":
      return {
        title: "You are getting close",
        body: "Most of the journey is behind you. The flight is entering its final scheduled window."
      };

    case "slightly_extended_route":
      return {
        title: "The route is taking a little longer",
        body: "The flight is still continuing normally. A small timing change does not mean something is wrong."
      };

    case "holding_pattern_possible":
      return {
        title: "The flight is staying steady",
        body: "It may remain in this part of the journey for a while. The experience can still be calm and normal."
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
