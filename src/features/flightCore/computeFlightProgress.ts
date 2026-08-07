import { Flight, FlightProgress } from "@/types/flight";
import { Coordinates } from "@/types/route";

import { calculateFlightProgress } from "./calculateFlightProgress";

const FRESH_POSITION_MAX_AGE_MS = 20 * 60 * 1000;
const STALE_POSITION_MAX_AGE_MS = 60 * 60 * 1000;
const FRESH_DISTANCE_WEIGHT = 0.8;
const STALE_DISTANCE_WEIGHT = 0.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(origin: Coordinates, destination: Coordinates): number {
  const earthRadiusKm = 6371;
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function hasRealCoordinates(coordinates: Coordinates): boolean {
  return coordinates.latitude !== 0 || coordinates.longitude !== 0;
}

function resolveLiveCoordinates(flight: Flight): Coordinates | undefined {
  const latitude = flight.operations?.liveLatitude;
  const longitude = flight.operations?.liveLongitude;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return undefined;
  }

  return { latitude, longitude };
}

function resolveDistanceProgress(flight: Flight): number | undefined {
  const liveCoordinates = resolveLiveCoordinates(flight);
  const origin = flight.origin.coordinates;
  const destination = flight.destination.coordinates;

  if (!liveCoordinates || !hasRealCoordinates(origin) || !hasRealCoordinates(destination)) {
    return undefined;
  }

  const totalDistanceKm = flight.routeDistanceKm > 0
    ? flight.routeDistanceKm
    : distanceKm(origin, destination);
  if (!Number.isFinite(totalDistanceKm) || totalDistanceKm <= 0) return undefined;

  const remainingDistanceKm = distanceKm(liveCoordinates, destination);
  const progress = 100 * (1 - remainingDistanceKm / totalDistanceKm);

  // Provider positions can be slightly off-route. Do not let a small geometric
  // mismatch push passenger-facing progress outside the normal journey range.
  return clamp(progress, 0, 100);
}

function livePositionAgeMs(flight: Flight, currentTime: Date): number | undefined {
  const reportedAt = flight.operations?.livePositionReportedAtUtc;
  if (!reportedAt) return undefined;
  const reportedAtMs = Date.parse(reportedAt);
  if (Number.isNaN(reportedAtMs)) return undefined;
  return Math.max(currentTime.getTime() - reportedAtMs, 0);
}

function blend(distanceProgress: number, timelineProgress: number, distanceWeight: number): number {
  return clamp(
    distanceProgress * distanceWeight + timelineProgress * (1 - distanceWeight),
    0,
    100
  );
}

export function computeFlightProgress(
  flight: Flight,
  currentTime: Date
): FlightProgress {
  const timeline = calculateFlightProgress(flight, currentTime);
  const timelineProgressPercent = timeline.progressPercent;

  if (timeline.isBeforeDeparture || timeline.isAfterArrival) {
    return {
      ...timeline,
      timelineProgressPercent,
      displayedProgressPercent: timelineProgressPercent,
      progressPercent: timelineProgressPercent,
      progressSource: "timeline",
      confidence: timeline.isBeforeDeparture ? "high" : "medium"
    };
  }

  const distanceProgressPercent = resolveDistanceProgress(flight);
  const positionAgeMs = livePositionAgeMs(flight, currentTime);

  if (distanceProgressPercent === undefined || positionAgeMs === undefined || positionAgeMs > STALE_POSITION_MAX_AGE_MS) {
    return {
      ...timeline,
      timelineProgressPercent,
      displayedProgressPercent: timelineProgressPercent,
      progressPercent: timelineProgressPercent,
      progressSource: "timeline",
      confidence: distanceProgressPercent !== undefined ? "low" : "medium"
    };
  }

  const isFresh = positionAgeMs <= FRESH_POSITION_MAX_AGE_MS;
  const distanceWeight = isFresh ? FRESH_DISTANCE_WEIGHT : STALE_DISTANCE_WEIGHT;
  const displayedProgressPercent = blend(
    distanceProgressPercent,
    timelineProgressPercent,
    distanceWeight
  );

  return {
    ...timeline,
    timelineProgressPercent,
    distanceProgressPercent,
    displayedProgressPercent,
    progressPercent: displayedProgressPercent,
    progressSource: "hybrid",
    confidence: isFresh ? "high" : "medium"
  };
}
