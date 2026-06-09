import { messagingMatrix } from "@/features/interpreter/messaging/messagingMatrix";
import { SituationType } from "@/features/interpreter/situations/types";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";
import { RouteCheckpoint } from "@/types/route";

type GetNextExpectedMomentParams = {
  situation: SituationType;
  nextCheckpoint?: RouteCheckpoint;
  remainingMinutes: number;
};

function shouldHideMinutes(situation: SituationType): boolean {
  return (
    situation === "slightly_extended_route" ||
    situation === "holding_pattern_possible"
  );
}

export function getNextExpectedMoment({
  situation,
  nextCheckpoint,
  remainingMinutes
}: GetNextExpectedMomentParams): NextExpectedMoment {
  const message = messagingMatrix[situation];

  if (situation === "stable_progress" && nextCheckpoint) {
    return {
      title: "The route continues normally",
      body: `The flight should continue steadily toward ${nextCheckpoint.label}.`,
      minutesUntil: remainingMinutes
    };
  }

  return {
    title: message.nextTitle,
    body: message.nextBody,
    minutesUntil: shouldHideMinutes(situation) ? undefined : remainingMinutes
  };
}
