import { NextExpectedMoment } from "@/types/nextExpectedMoment";
import { RouteCheckpoint } from "@/types/route";

import { SituationType } from "../situations/types";

type GetNextExpectedMomentParams = {
  situation: SituationType;
  nextCheckpoint?: RouteCheckpoint;
  remainingMinutes: number;
};

export function getNextExpectedMoment({
  situation,
  nextCheckpoint,
  remainingMinutes
}: GetNextExpectedMomentParams): NextExpectedMoment {
  switch (situation) {
    case "descent_expected":
      return {
        title: "You may notice preparation for arrival soon",
        body: "The flight should continue steadily, and the next noticeable change may be the gradual transition toward descent.",
        minutesUntil: remainingMinutes
      };

    case "arrival_soon":
      return {
        title: "Arrival is the next major moment",
        body: "The next part of the journey is likely to feel more active as the flight moves toward landing.",
        minutesUntil: remainingMinutes
      };

    case "slightly_extended_route":
      return {
        title: "The flight should keep progressing calmly",
        body: "The next few minutes may simply feel like continued steady flight while timing adjusts."
      };

    case "holding_pattern_possible":
      return {
        title: "A slightly longer arrival path may happen",
        body: "The aircraft may continue on a calm, extended path before moving into the final arrival stage."
      };

    case "stable_progress":
    default:
      return {
        title: nextCheckpoint
          ? `Next: ${nextCheckpoint.label}`
          : "The route continues normally",
        body: nextCheckpoint
          ? `The flight will continue steadily toward ${nextCheckpoint.label}.`
          : "The flight will continue steadily along the planned route.",
        minutesUntil: remainingMinutes
      };
  }
}
