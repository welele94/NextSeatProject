import { NextExpectedMoment } from "@/types/nextExpectedMoment";
import { RouteCheckpoint } from "@/types/route";
import { messagingMatrix } from "@/features/interpreter/messaging/messagingMatrix";

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
  const message = messagingMatrix[situation];

  if (situation === "stable_progress" && nextCheckpoint) {
    return {
      title: `Next: ${nextCheckpoint.label}`,
      body: `The flight should continue steadily toward ${nextCheckpoint.label}.`,
      minutesUntil: remainingMinutes
    };
  }

  return {
    title: message.nextTitle,
    body: message.nextBody,
    minutesUntil:
      situation === "slightly_extended_route" ||
      situation === "holding_pattern_possible"
        ? undefined
        : remainingMinutes
  };
}
