import {
  fallbackReassuranceMessage,
  reassuranceMessages
} from "@/data/reassuranceMessages";
import { FlightProgress } from "@/types/flight";
import { RouteCheckpoint } from "@/types/route";

export function getFlightContextMessage(
  progress: FlightProgress,
  currentCheckpoint?: RouteCheckpoint
) {
  if (progress.isBeforeDeparture) {
    return {
      title: "The route is ready",
      body: "This view is prepared from saved schedule and route data, so it remains useful without an internet connection."
    };
  }

  if (progress.isAfterArrival) {
    return {
      title: "The scheduled route is complete",
      body: "Based on the saved schedule, this flight has reached the end of its planned time window."
    };
  }

  const checkpointMessage = reassuranceMessages.find(
    (message) => message.id === currentCheckpoint?.reassuranceMessageId
  );

  return checkpointMessage ?? fallbackReassuranceMessage;
}
