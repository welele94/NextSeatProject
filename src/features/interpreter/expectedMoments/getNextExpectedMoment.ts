import { messagingMatrix } from "@/features/interpreter/messaging/messagingMatrix";
import { SituationType } from "@/features/interpreter/situations/types";
import {
  ExpectedMomentConfidence,
  ExpectedMomentContext,
  NextExpectedMoment,
  TimingEstimate
} from "@/types/nextExpectedMoment";
import { RouteCheckpoint } from "@/types/route";

type GetNextExpectedMomentParams = {
  situation: SituationType;
  nextCheckpoint?: RouteCheckpoint;
  remainingMinutes: number;
};

function shouldHideMinutes(situation: SituationType): boolean {
  return (
    situation === "pre_flight" ||
    situation === "slightly_extended_route" ||
    situation === "holding_pattern_possible"
  );
}

function getConfidence(situation: SituationType): ExpectedMomentConfidence {
  if (
    situation === "slightly_extended_route" ||
    situation === "holding_pattern_possible"
  ) {
    return "low";
  }

  if (situation === "descent_expected" || situation === "arrival_soon") {
    return "medium";
  }

  return "high";
}

function getContext(situation: SituationType): ExpectedMomentContext {
  switch (situation) {
    case "slightly_extended_route":
    case "holding_pattern_possible":
      return "delay_or_wait";
    case "descent_expected":
    case "arrival_soon":
      return "phase_progression";
    case "pre_flight":
    case "stable_progress":
    default:
      return "schedule_based";
  }
}

function buildTimingEstimate(
  situation: SituationType,
  remainingMinutes: number
): TimingEstimate | undefined {
  if (shouldHideMinutes(situation)) {
    return undefined;
  }

  return {
    minutesUntil: remainingMinutes,
    label: `Around ${remainingMinutes} min remaining`
  };
}

export function getNextExpectedMoment({
  situation,
  nextCheckpoint,
  remainingMinutes
}: GetNextExpectedMomentParams): NextExpectedMoment {
  const message = messagingMatrix[situation];

  if (situation === "stable_progress" && nextCheckpoint) {
    const body = `The flight should continue steadily toward ${nextCheckpoint.label}.`;

    return {
      title: "The route continues normally",
      body,
      description: body,
      confidence: "high",
      context: "route_pattern",
      timingEstimate: buildTimingEstimate(situation, remainingMinutes)
    };
  }

  return {
    title: message.nextTitle,
    body: message.nextBody,
    description: message.nextBody,
    confidence: getConfidence(situation),
    context: getContext(situation),
    timingEstimate: buildTimingEstimate(situation, remainingMinutes)
  };
}
