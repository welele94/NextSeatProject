export type FlightStatus =
  | "before_departure"
  | "early_flight"
  | "cruise"
  | "late_flight"
  | "arrival_window"
  | "completed";

function percentFromMinutes(minutes: number, durationMinutes: number): number {
  return (minutes / Math.max(durationMinutes, 1)) * 100;
}

function resolveDurationMinutes(
  durationMinutes: number | undefined,
  elapsedMinutes: number | undefined,
  remainingMinutes: number | undefined
): number {
  if (durationMinutes && durationMinutes > 0) return durationMinutes;

  const timelineDuration = (elapsedMinutes ?? 0) + (remainingMinutes ?? 0);
  return Math.max(timelineDuration, 1);
}

export function getFlightStatus(
  progressPercent: number,
  isBeforeDeparture: boolean,
  isAfterArrival: boolean,
  durationMinutes?: number,
  elapsedMinutes?: number,
  remainingMinutes?: number
): FlightStatus {
  if (isBeforeDeparture) {
    return "before_departure";
  }

  if (isAfterArrival || progressPercent >= 100) {
    return "completed";
  }

  const resolvedDurationMinutes = resolveDurationMinutes(
    durationMinutes,
    elapsedMinutes,
    remainingMinutes
  );

  // Keep the model simple and explainable:
  // - takeoff is the first few minutes, capped at 5% of the journey
  // - climb continues through the early part of the flight, capped at 15%
  // - descent is the final 20 minutes
  // - approach is the final 8 minutes
  const takeoffEndPercent = Math.min(5, percentFromMinutes(5, resolvedDurationMinutes));
  const climbEndPercent = Math.min(15, percentFromMinutes(20, resolvedDurationMinutes));

  if (progressPercent < takeoffEndPercent) {
    return "early_flight";
  }

  if (progressPercent < climbEndPercent) {
    return "early_flight";
  }

  if (remainingMinutes !== undefined && remainingMinutes <= 8) {
    return "arrival_window";
  }

  if (remainingMinutes !== undefined && remainingMinutes <= 20) {
    return "late_flight";
  }

  return "cruise";
}
