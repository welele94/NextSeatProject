import { NextExpectedMoment } from "@/types/nextExpectedMoment";
import { RouteCheckpoint } from "@/types/route";

import { FlightSituation } from "../situations/types";

type GetNextExpectedMomentParams = {
  situation: FlightSituation;
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
        title: "Descent is expected later",
        body: "The flight is expected to continue toward the final part of the route.",
        minutesUntil: remainingMinutes
      };

    case "arrival_soon":
      return {
        title: "Arrival is expected soon",
        body: "The flight is entering its final transition toward landing.",
        minutesUntil: remainingMinutes
      };

    case "slightly_extended_route":
      return {
        title: "The route may continue a little longer",
        body: "Minor route extensions can happen normally during busy traffic periods."
      };

    case "holding_pattern_possible":
      return {
        title: "The flight may remain steady for a while",
        body: "Longer stable periods can happen during normal traffic organization."
      };

    default:
      return {
        title: "The route continues normally",
        body: nextCheckpoint
          ? `The flight will continue steadily toward ${nextCheckpoint.label}.`
          : "The flight will continue steadily along the planned route.",
        minutesUntil: remainingMinutes
      };
  }
}
