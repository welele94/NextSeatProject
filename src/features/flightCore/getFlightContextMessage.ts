import {
  fallbackReassuranceMessage,
  reassuranceMessages
} from "@/data/reassuranceMessages";
import { RouteCheckpoint } from "@/types/route";

import { FlightStatus } from "./getFlightStatus";

export function getFlightContextMessage(
  currentCheckpoint?: RouteCheckpoint,
  nextCheckpoint?: RouteCheckpoint,
  status?: FlightStatus
) {
  if (status === "before_departure") {
    return {
      title: "Your flight is prepared",
      body: "Everything is set from the saved schedule. You can use this view even without an internet connection."
    };
  }

  if (status === "early_flight") {
    return {
      title: "The flight has just started",
      body: "The beginning of a flight can feel busy, but these early adjustments are a normal part of the journey."
    };
  }

  if (status === "cruise") {
    return {
      title: "You are in the calmest part",
      body: "The aircraft is simply moving steadily toward the destination. This is usually the most stable part of the flight."
    };
  }

  if (status === "late_flight") {
    return {
      title: "You are getting closer",
      body: nextCheckpoint
        ? `The flight is progressing toward its final phase. The next route marker is ${nextCheckpoint.label}.`
        : "The flight is progressing toward its final phase. You are getting closer to your destination."
    };
  }

  if (status === "arrival_window") {
    return {
      title: "Arrival is getting closer",
      body: "This is a normal transition toward landing. The flight is moving through the final part of its scheduled journey."
    };
  }

  if (status === "completed") {
    return {
      title: "The scheduled journey is complete",
      body: "Based on the saved schedule, the flight has reached its destination window."
    };
  }

  const checkpointMessage = reassuranceMessages.find(
    (message) => message.id === currentCheckpoint?.reassuranceMessageId
  );

  return checkpointMessage ?? fallbackReassuranceMessage;
}
