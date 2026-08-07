export type FlightStatus =
  | "before_departure"
  | "early_flight"
  | "cruise"
  | "late_flight"
  | "arrival_window"
  | "completed";

const TAKEOFF_MINUTES = 5;
const APPROACH_MAX_MINUTES = 12;
const LOW_ALTITUDE_FEET = 10000;
const APPROACH_ALTITUDE_FEET = 6000;
const CRUISE_ALTITUDE_MIN_FEET = 18000;
const CRUISE_ALTITUDE_RATIO = 0.78;
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
    minutes += (bandTopFeet - previousCeilingFeet) / band.rateFeetPerMinute;
    previousCeilingFeet = band.ceilingFeet;
  }
  return Math.round(minutes);
}

function estimateClimbWindowMinutes(targetAltitudeFeet: number, durationMinutes: number): number {
  const physicsClimbMinutes = estimateClimbMinutes(targetAltitudeFeet);
  const bufferMinutes = durationMinutes <= 75 ? 3 : durationMinutes <= 180 ? 5 : 6;
  const maxWindowMinutes = durationMinutes <= 75 ? 20 : durationMinutes <= 180 ? 28 : 32;
  return clamp(
    physicsClimbMinutes + bufferMinutes,
    TAKEOFF_MINUTES,
    Math.max(TAKEOFF_MINUTES, maxWindowMinutes)
  );
}

function estimateDescentMinutes(targetAltitudeFeet: number, durationMinutes: number): number {
  const altitudeBasedMinutes = Math.round(targetAltitudeFeet / 1500 + 5);
  const durationBasedCap = Math.max(12, Math.round(durationMinutes * 0.35));
  return clamp(altitudeBasedMinutes, 12, Math.min(32, durationBasedCap));
}

function estimateApproachMinutes(durationMinutes: number): number {
  return clamp(Math.round(durationMinutes * 0.1), 6, APPROACH_MAX_MINUTES);
}

function cruiseAltitudeThresholdFeet(targetAltitudeFeet: number): number {
  return clamp(
    Math.round(targetAltitudeFeet * CRUISE_ALTITUDE_RATIO),
    CRUISE_ALTITUDE_MIN_FEET,
    30000
  );
}

function resolveLiveAltitudePhase({
  altitudeFeet,
  verticalSpeedFeetPerMinute,
  progressPercent,
  targetAltitudeFeet,
  elapsedMinutes,
  remainingMinutes,
  approachMinutes,
  descentMinutes
}: {
  altitudeFeet?: number;
  verticalSpeedFeetPerMinute?: number;
  progressPercent: number;
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
  const remaining = remainingMinutes;
  const nearDestination = progressPercent >= 82;
  const veryNearDestination = progressPercent >= 93;
  const earlyRoute = progressPercent < 30;

  // Low altitude is only interpreted as takeoff when the aircraft is still in
  // the early part of the route. The same altitude late in the journey means
  // descent/approach, even if the saved timeline is conservative.
  if (altitudeFeet <= APPROACH_ALTITUDE_FEET) {
    if (isClimbing || elapsed <= TAKEOFF_MINUTES || earlyRoute) return "early_flight";
    if (veryNearDestination || (remaining !== undefined && remaining <= approachMinutes + 4)) {
      return "arrival_window";
    }
    return "late_flight";
  }

  if (altitudeFeet <= LOW_ALTITUDE_FEET) {
    if ((isClimbing || elapsed <= TAKEOFF_MINUTES) && progressPercent < 35) return "early_flight";
    if (isDescending || nearDestination) return "late_flight";
    if (remaining !== undefined && remaining <= approachMinutes + 5) return "arrival_window";
    if (remaining !== undefined && remaining <= descentMinutes + 8) return "late_flight";
    return earlyRoute ? "early_flight" : "late_flight";
  }

  // At genuine cruise altitude we should not keep calling the flight Climb just
  // because the timeline thinks the first part of the journey should last longer.
  if (altitudeFeet >= cruiseAltitudeThresholdFeet(targetAltitudeFeet)) {
    if (isDescending && (nearDestination || (remaining !== undefined && remaining <= descentMinutes + 8))) {
      return veryNearDestination && remaining !== undefined && remaining <= approachMinutes + 4
        ? "arrival_window"
        : "late_flight";
    }
    return "cruise";
  }

  if (isDescending && (nearDestination || (remaining !== undefined && remaining <= descentMinutes + 8))) {
    return "late_flight";
  }
  if (isClimbing && progressPercent < 40) return "early_flight";
  if (progressPercent >= 35 && progressPercent < 82) return "cruise";

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
  if (isBeforeDeparture) return "before_departure";
  if (isAfterArrival || progressPercent >= 100) return "completed";

  const resolvedDurationMinutes = resolveDurationMinutes(durationMinutes, elapsedMinutes, remainingMinutes);
  const targetAltitudeFeet = estimateTargetAltitudeFeet(resolvedDurationMinutes);
  const climbWindowMinutes = estimateClimbWindowMinutes(targetAltitudeFeet, resolvedDurationMinutes);
  const descentMinutes = estimateDescentMinutes(targetAltitudeFeet, resolvedDurationMinutes);
  const approachMinutes = estimateApproachMinutes(resolvedDurationMinutes);

  const liveAltitudePhase = resolveLiveAltitudePhase({
    altitudeFeet: liveAltitudeFeet,
    verticalSpeedFeetPerMinute: liveVerticalSpeedFeetPerMinute,
    progressPercent,
    targetAltitudeFeet,
    elapsedMinutes,
    remainingMinutes,
    approachMinutes,
    descentMinutes
  });

  if (liveAltitudePhase) return liveAltitudePhase;

  // No usable altitude signal: distance-aware progress is now the strongest
  // remaining signal because computeFlightProgress() already blends fresh saved
  // position data with the timeline.
  if (progressPercent >= 94) return "arrival_window";
  if (progressPercent >= 82) return "late_flight";
  if (progressPercent >= 32) return "cruise";

  // Time remaining is useful when no position/altitude signal can resolve the
  // phase, but it should not override a clearly advanced route percentage.
  if (remainingMinutes !== undefined && remainingMinutes <= approachMinutes) {
    return "arrival_window";
  }
  if (remainingMinutes !== undefined && remainingMinutes <= descentMinutes) {
    return "late_flight";
  }

  if ((elapsedMinutes ?? 0) < TAKEOFF_MINUTES) return "early_flight";
  if (elapsedMinutes !== undefined && elapsedMinutes < climbWindowMinutes) return "early_flight";
  return "cruise";
}
