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

  // For short European hops, the passenger-visible climb can take a larger share
  // of the route than a pure altitude model suggests. Keep this as a calm phase
  // estimate, not a claim about exact aircraft altitude.
  const shortRouteWindowMinutes = durationMinutes <= 180
    ? Math.round(durationMinutes * 0.25)
    : physicsClimbMinutes;
  const maxWindowMinutes = durationMinutes <= 75
    ? Math.round(durationMinutes * 0.30)
    : durationMinutes <= 180
      ? Math.min(35, Math.round(durationMinutes * 0.25))
      : 30;

  return clamp(
    Math.max(physicsClimbMinutes, shortRouteWindowMinutes),
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

function resolveLiveAltitudePhase({
  altitudeFeet,
  verticalSpeedFeetPerMinute,
  elapsedMinutes,
  remainingMinutes,
  approachMinutes,
  descentMinutes
}: {
  altitudeFeet?: number;
  verticalSpeedFeetPerMinute?: number;
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
    elapsedMinutes,
    remainingMinutes,
    approachMinutes,
    descentMinutes
  });

  if (liveAltitudePhase) return liveAltitudePhase;

  // Fallback when live altitude is unavailable: calm timeline model.
  // Do not call early short-route progress "Cruise" too aggressively. It can
  // make the UI disagree with the saved journey percentage and with airport/API
  // context immediately after departure.
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
