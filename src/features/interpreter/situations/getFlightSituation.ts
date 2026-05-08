import { FlightStatus } from "@/features/flightCore/getFlightStatus";

import { FlightSituation } from "./types";

type GetFlightSituationParams = {
  flightStatus: FlightStatus;
  remainingMinutes: number;
};

export function getFlightSituation({
  flightStatus,
  remainingMinutes
}: GetFlightSituationParams): FlightSituation {
  if (flightStatus === "arrival_window") {
    return "arrival_soon";
  }

  if (flightStatus === "late_flight" && remainingMinutes <= 25) {
    return "descent_expected";
  }

  if (flightStatus === "cruise" && remainingMinutes <= 15) {
    return "arrival_soon";
  }

  if (flightStatus === "late_flight" && remainingMinutes > 90) {
    return "slightly_extended_route";
  }

  if (flightStatus === "cruise" && remainingMinutes > 150) {
    return "holding_pattern_possible";
  }

  return "stable_progress";
}
