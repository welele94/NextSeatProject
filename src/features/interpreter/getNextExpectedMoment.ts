import { FlightStatus } from "@/features/flightCore/getFlightStatus";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";
import { RouteCheckpoint } from "@/types/route";

type GetNextExpectedMomentParams = {
  status: FlightStatus;
  nextCheckpoint?: RouteCheckpoint;
  remainingMinutes: number;
};

export function getNextExpectedMoment({
  status,
  nextCheckpoint,
  remainingMinutes
}: GetNextExpectedMomentParams): NextExpectedMoment {
  switch (status) {
    case "before_departure":
      return {
        title: "Departure is expected soon",
        body: "The route and schedule are prepared. Boarding and departure should happen shortly.",
        description:
          "The route and schedule are prepared. Boarding and departure should happen shortly.",
        confidence: "medium",
        context: "schedule_based",
        timingEstimate: {
          minutesUntil: remainingMinutes,
          label: `Around ${remainingMinutes} min remaining`
        }
      };

    case "early_flight":
      return {
        title: "The flight will continue climbing steadily",
        body: "The aircraft is expected to continue toward the first part of the planned route.",
        description:
          "The aircraft is expected to continue toward the first part of the planned route.",
        confidence: "medium",
        context: "phase_progression",
        timingEstimate: {
          minutesUntil: remainingMinutes,
          label: `Around ${remainingMinutes} min remaining`
        }
      };

    case "cruise": {
      const body = nextCheckpoint
        ? `The flight will continue steadily toward ${nextCheckpoint.label}.`
        : "The flight will continue steadily along the planned route.";

      return {
        title: "The route continues normally",
        body,
        description: body,
        confidence: "high",
        context: nextCheckpoint ? "route_pattern" : "schedule_based",
        timingEstimate: {
          minutesUntil: remainingMinutes,
          label: `Around ${remainingMinutes} min remaining`
        }
      };
    }

    case "late_flight":
      return {
        title: "Arrival preparation will begin shortly",
        body: "The aircraft is expected to continue toward the final route segment.",
        description:
          "The aircraft is expected to continue toward the final route segment.",
        confidence: "medium",
        context: "phase_progression",
        timingEstimate: {
          minutesUntil: remainingMinutes,
          label: `Around ${remainingMinutes} min remaining`
        }
      };

    case "arrival_window":
      return {
        title: "Arrival is expected soon",
        body: "The flight is entering its final transition toward landing.",
        description: "The flight is entering its final transition toward landing.",
        confidence: "medium",
        context: "phase_progression",
        timingEstimate: {
          minutesUntil: remainingMinutes,
          label: `Around ${remainingMinutes} min remaining`
        }
      };

    case "completed":
    default:
      return {
        title: "Journey completed",
        body: "The scheduled route has reached its destination window safely.",
        description:
          "The scheduled route has reached its destination window safely.",
        confidence: "high",
        context: "general_guidance"
      };
  }
}