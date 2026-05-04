import { Flight } from "@/types/flight";

export function estimateRemainingTime(
  flight: Flight,
  progressPercent: number
): number {
  const remainingRatio = Math.max(1 - progressPercent / 100, 0);

  return Math.round(flight.schedule.estimatedDurationMinutes * remainingRatio);
}
