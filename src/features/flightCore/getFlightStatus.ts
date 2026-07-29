export type FlightStatus =
  | "before_departure"
  | "early_flight"
  | "cruise"
  | "late_flight"
  | "arrival_window"
  | "completed";

const TAKEOFF_MINUTES = 5;
const APPROACH_MAX_MINUTES = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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

function estimateTargetAltitudeFeet(durationMinutes: number): number {
  if (durationMinutes <= 45) return 18000;
  if (durationMinutes <= 75) return 24000;
  if (durationMinutes <= 150) return 30000;
  return 35000;
}

function estimateClimbMinutes(targetAltitudeFeet: number): number {
  const climbBands = [
    { ceilingFeet: 5000, rateFeetPerMinute: 2200 },
    { ceilingFeet: 15000, rateFeetPerMinute: 2000 },
    { ceilingFeet: 24000, rateFeetPerMinute: 1500 },
    { ceilingFeet: 35000, rateFeetPerMinute: 1000 }
  ];

  let minutes = 0;
  let previousCeilingFeet = 0;

  for (const band of climbBands) {
    if (targetAltitudeFeet <= previousCeilingFeet) break;

    const bandTopFeet = Math.min(targetAltitudeFeet, band.ceilingFeet);
    const bandFeet = bandTopFeet - previousCeilingFeet;
    minutes += bandFeet / band.rateFeetPerMinute;
    previousCeilingFeet = band.ceilingFeet;
  }

  return Math.round(minutes);
}

function estimateDescentMinutes(targetAltitudeFeet: number, durationMinutes: number): number {
  const altitudeBasedMinutes = Math.round(targetAltitudeFeet / 1500 + 5);
  const durationBasedCap = Math.max(12, Math.round(durationMinutes * 0.35));
  return clamp(altitudeBasedMinutes, 12, Math.min(30, durationBasedCap));
}

function estimateApproachMinutes(durationMinutes: number): number {
  return clamp(Math.round(durationMinutes * 0.12), 6, APPROACH_MAX_MINUTES);
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
  const targetAltitudeFeet = estimateTargetAltitudeFeet(resolvedDurationMinutes);
  const climbMinutes = estimateClimbMinutes(targetAltitudeFeet);
  const descentMinutes = estimateDescentMinutes(targetAltitudeFeet, resolvedDurationMinutes);
  const approachMinutes = estimateApproachMinutes(resolvedDurationMinutes);

  // This is still a calm timeline model, not live aircraft tracking.
  // We estimate a likely target altitude from route duration, translate that
  // into a climb window, and use a conservative final descent/approach window.
  if ((elapsedMinutes ?? 0) < TAKEOFF_MINUTES) {
    return "early_flight";
  }

  if (elapsedMinutes !== undefined && elapsedMinutes < climbMinutes) {
    return "early_flight";
  }

  if (remainingMinutes !== undefined && remainingMinutes <= approachMinutes) {
    return "arrival_window";
  }

  if (remainingMinutes !== undefined && remainingMinutes <= descentMinutes) {
    return "late_flight";
  }

  return "cruise";
}
