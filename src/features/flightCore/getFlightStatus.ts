export type FlightStatus =
  | "before_departure"
  | "early_flight"
  | "cruise"
  | "late_flight"
  | "arrival_window"
  | "completed";

const TAKEOFF_MINUTES = 5;
const APPROACH_MAX_MINUTES = 10;
const LOW_ALTITUDE_FEET = 10000;
const APPROACH_ALTITUDE_FEET = 5000;
const HIGH_ALTITUDE_CRUISE_MIN_FEET = 15000;
const HIGH_ALTITUDE_CRUISE_MAX_FEET = 30000;
const CRUISE_ALTITUDE_RATIO = 0.85;
const CLIMBING_VSI_FPM = 300;
const DESCENDING_VSI_FPM = -300;

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

function estimateClimbWindowMinutes(targetAltitudeFeet: number, durationMinutes: number): number {
  const physicsClimbMinutes = estimateClimbMinutes(targetAltitudeFeet);
  const bufferMinutes = durationMinutes <= 75 ? 3 : durationMinutes <= 180 ? 5 : 6;
  const maxWindowMinutes = durationMinutes <= 75 ? 20 : durationMinutes <= 180 ? 28 : 32;

  // Keep the fallback calm, but do not stretch climb to a fixed percentage of the
  // flight. That made medium routes stay in "Climb" after the aircraft had already
  // reached normal cruise altitude.
  return clamp(
    physicsClimbMinutes + bufferMinutes,
    TAKEOFF_MINUTES,
    Math.max(TAKEOFF_MINUTES, maxWindowMinutes)
  );
}

function estimateDescentMinutes(targetAltitudeFeet: number, durationMinutes: number): number {
  const altitudeBasedMinutes = Math.round(targetAltitudeFeet / 1500 + 5);
  const durationBasedCap = Math.max(12, Math.round(durationMinutes * 0.35));
  return clamp(altitudeBasedMinutes, 12, Math.min(30, durationBasedCap));
}

function estimateApproachMinutes(durationMinutes: number): number {
  return clamp(Math.round(durationMinutes * 0.12), 6, APPROACH_MAX_MINUTES);
}

function highAltitudeCruiseThresholdFeet(targetAltitudeFeet: number): number {
  return clamp(
    Math.round(targetAltitudeFeet * CRUISE_ALTITUDE_RATIO),
    HIGH_ALTITUDE_CRUISE_MIN_FEET,
    HIGH_ALTITUDE_CRUISE_MAX_FEET
  );
}

function resolveLiveAltitudePhase({
  altitudeFeet,
  verticalSpeedFeetPerMinute,
  targetAltitudeFeet,
  elapsedMinutes,
  remainingMinutes,
  approachMinutes,
  descentMinutes
}: {
  altitudeFeet?: number;
  verticalSpeedFeetPerMinute?: number;
  targetAltitudeFeet: number;
  elapsedMinutes?: number;
  remainingMinutes?: number;
  approachMinutes: number;
  descentMinutes: number;
}): FlightStatus | undefined {
  if (altitudeFeet === undefined || altitudeFeet < 0) return undefined;

  const isClimbing = verticalSpeedFeetPerMinute !== undefined && verticalSpeedFeetPerMinute >= CLIMBING_VSI_FPM;
  const isDescending = verticalSpeedFeetPerMinute !== undefined && verticalSpeedFeetPerMinute <= DESCENDING_VSI_FPM;
  const elapsed = elapsedMinutes ?? 0;

  // When we have live altitude, it should override the calm timeline model.
  // Below 10,000 ft is not a cruise signal. It is usually either early climb
  // or final arrival preparation. We still do not expose altitude in the UI.
  if (altitudeFeet <= APPROACH_ALTITUDE_FEET) {
    if (isClimbing || elapsed <= TAKEOFF_MINUTES) return "early_flight";
    return "arrival_window";
  }

  if (altitudeFeet <= LOW_ALTITUDE_FEET) {
    if (isClimbing) return "early_flight";
    if (isDescending) return "late_flight";

    if (remainingMinutes !== undefined && remainingMinutes <= approachMinutes + 5) {
      return "arrival_window";
    }

    if (remainingMinutes !== undefined && remainingMinutes <= descentMinutes + 10) {
      return "late_flight";
    }

    return "early_flight";
  }

  // High altitude is a strong signal that the flight has moved beyond the early
  // climb. Even if the aircraft is still climbing slightly, a passenger-facing
  // guidance app should treat this as cruise unless arrival is already near.
  if (altitudeFeet >= highAltitudeCruiseThresholdFeet(targetAltitudeFeet)) {
    if (remainingMinutes !== undefined && remainingMinutes <= approachMinutes) {
      return "arrival_window";
    }

    if (isDescending && remainingMinutes !== undefined && remainingMinutes <= descentMinutes + 10) {
      return "late_flight";
    }

    return "cruise";
  }

  return undefined;
}

export function getFlightStatus(
  progressPercent: number,
  isBeforeDeparture: boolean,
  isAfterArrival: boolean,
  durationMinutes?: number,
  elapsedMinutes?: number,
  remainingMinutes?: number,
  liveAltitudeFeet?: number,
  liveVerticalSpeedFeetPerMinute?: number
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
  const climbWindowMinutes = estimateClimbWindowMinutes(targetAltitudeFeet, resolvedDurationMinutes);
  const descentMinutes = estimateDescentMinutes(targetAltitudeFeet, resolvedDurationMinutes);
  const approachMinutes = estimateApproachMinutes(resolvedDurationMinutes);
  const liveAltitudePhase = resolveLiveAltitudePhase({
    altitudeFeet: liveAltitudeFeet,
    verticalSpeedFeetPerMinute: liveVerticalSpeedFeetPerMinute,
    targetAltitudeFeet,
    elapsedMinutes,
    remainingMinutes,
    approachMinutes,
    descentMinutes
  });

  if (liveAltitudePhase) return liveAltitudePhase;

  // Fallback when live altitude is unavailable: calm timeline model.
  if ((elapsedMinutes ?? 0) < TAKEOFF_MINUTES) {
    return "early_flight";
  }

  if (remainingMinutes !== undefined && remainingMinutes <= approachMinutes) {
    return "arrival_window";
  }

  if (remainingMinutes !== undefined && remainingMinutes <= descentMinutes) {
    return "late_flight";
  }

  if (elapsedMinutes !== undefined && elapsedMinutes < climbWindowMinutes) {
    return "early_flight";
  }

  return "cruise";
}
