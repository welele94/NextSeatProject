import { Flight, FlightProgress } from "@/types/flight";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculateFlightProgress(
  flight: Flight,
  currentTime: Date = new Date()
): FlightProgress {
  const departureTime = new Date(flight.schedule.scheduledDeparture).getTime();
  const arrivalTime = new Date(flight.schedule.scheduledArrival).getTime();
  const currentTimestamp = currentTime.getTime();
  const durationMs = Math.max(arrivalTime - departureTime, 1);

  // Progress is schedule-based so it can work offline without live aircraft data.
  const rawProgress = ((currentTimestamp - departureTime) / durationMs) * 100;
  const progressPercent = clamp(rawProgress, 0, 100);
  const elapsedMinutes = Math.round(
    clamp(currentTimestamp - departureTime, 0, durationMs) / 60000
  );
  const remainingMinutes = Math.max(
    flight.schedule.estimatedDurationMinutes - elapsedMinutes,
    0
  );

  return {
    progressPercent,
    elapsedMinutes,
    remainingMinutes,
    isBeforeDeparture: currentTimestamp < departureTime,
    isAfterArrival: currentTimestamp > arrivalTime
  };
}
