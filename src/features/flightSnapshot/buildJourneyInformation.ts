import { Flight, FlightProgress } from "@/types/flight";
import { JourneyInformation } from "@/types/journey";

export function buildJourneyInformation(
  flight: Flight,
  progress: FlightProgress
): JourneyInformation {
  return {
    originLabel: flight.origin.city,
    destinationLabel: flight.destination.city,
    routeLabel: `${flight.origin.city} → ${flight.destination.city}`,
    aircraftLabel: flight.aircraftType,
    estimatedDurationMinutes: flight.schedule.estimatedDurationMinutes,
    remainingMinutes: progress.remainingMinutes,
    completedPercent: progress.progressPercent
  };
}
