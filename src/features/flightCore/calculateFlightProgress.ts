import { Flight, FlightProgress } from "@/types/flight";
import { differenceInMinutes } from "../time/differenceInMinutes";
import { getCurrentTimestamp } from "../time/getCurrentTimestamp";
import { parseTimestamp } from "../time/parseTimestamp";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculateFlightProgress(
  flight: Flight,
  currentTime: Date = new Date()
): FlightProgress {
  const departureTime = parseTimestamp(flight.schedule.scheduledDeparture);
  const arrivalTime = parseTimestamp(flight.schedule.scheduledArrival);

  const totalDurationMinutes = Math.max(
    differenceInMinutes(departureTime, arrivalTime), 
    1
  );

  const elapsedFromDeparture = differenceInMinutes(departureTime, currentTime);
  const elapsedMinutes = clamp(elapsedFromDeparture, 0, totalDurationMinutes);

  const progressPercent = clamp((elapsedMinutes / totalDurationMinutes) * 100, 0, 100 );

  const remainingMinutes = clamp(
    differenceInMinutes(currentTime, arrivalTime), 0, 
    totalDurationMinutes
  );

 

  return {
    progressPercent,
    elapsedMinutes,
    remainingMinutes,
    isBeforeDeparture: elapsedFromDeparture < 0,
    isAfterArrival: differenceInMinutes(arrivalTime, currentTime) > 0
  };
}
