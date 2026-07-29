export type FlightStatus =
  | "before_departure"
  | "early_flight"
  | "cruise"
  | "late_flight"
  | "arrival_window"
  | "completed";

const TAKEOFF_END_PERCENT = 5;
const CLIMB_MINUTES = 20;
const DESCENT_MINUTES = 20;
const APPROACH_MINUTES = 8;

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

  if (remainingMinutes !== undefined && remainingMinutes <= APPROACH_MINUTES) {
    return "arrival_window";
  }

  if (remainingMinutes !== undefined && remainingMinutes <= DESCENT_MINUTES) {
    return "late_flight";
  }

  const resolvedDurationMinutes = resolveDurationMinutes(
    durationMinutes,
    elapsedMinutes,
    remainingMinutes
  );

  // Keep the phase model easy to explain:
  // - takeoff covers roughly the first 5% of the journey
  // - climb covers about the first 20 minutes, converted into journey percentage
  // - cruise is the space between climb and the final descent window
  // - descent starts when around 20 minutes remain
  // - approach starts when around 8 minutes remain
  const climbEndPercent = Math.max(
    TAKEOFF_END_PERCENT,
    percentFromMinutes(CLIMB_MINUTES, resolvedDurationMinutes)
  );

  if (progressPercent < TAKEOFF_END_PERCENT) {
    return "early_flight";
  }

  if (progressPercent < climbEndPercent) {
    return "early_flight";
  }

  return "cruise";
}
