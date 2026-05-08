import { FlightStatus } from "@/features/flightCore/getFlightStatus";
import { RouteCheckpoint } from "@/types/route";

type GetSituationMessageParams = {
  status: FlightStatus;
  currentCheckpoint?: RouteCheckpoint;
};

export type SituationMessage = {
  title: string;
  body: string;
};

export function getSituationMessage({
  status,
  currentCheckpoint
}: GetSituationMessageParams): SituationMessage {
  if (status === "before_departure") {
    return {
      title: "You are still before departure",
      body: "The flight has not started yet. The schedule is prepared and the journey can still be followed offline."
    };
  }

  if (status === "early_flight") {
    return {
      title: "The flight is settling in",
      body: "This first part can feel active, but it is a normal transition into the journey."
    };
  }

  if (status === "cruise") {
    return {
      title: "The flight is moving steadily",
      body: currentCheckpoint
        ? `You are around ${currentCheckpoint.label}. The flight is continuing normally along its planned route.`
        : "The flight is continuing normally along its planned route."
    };
  }

  if (status === "late_flight") {
    return {
      title: "Most of the journey is behind you",
      body: "The flight is now moving toward the final part of the route. Everything is still based on the saved schedule."
    };
  }

  if (status === "arrival_window") {
    return {
      title: "The flight is near arrival",
      body: "This is the final scheduled window of the journey. Changes in movement or direction can be normal here."
    };
  }

  return {
    title: "The scheduled journey is complete",
    body: "The saved schedule shows that this flight has reached its destination window."
  };
}
