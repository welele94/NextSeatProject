import { Flight } from "@/types/flight";

import { buildFlightSummary } from "./buildFlightSummary";
import { buildFlightSnapshot as buildLegacyFlightSnapshot } from "./buildFlightSnapshot";
import { FlightSnapshot } from "./types";

export function getFlightSnapshot(
  flight: Flight,
  currentTime: Date
): FlightSnapshot {
  const legacySnapshot = buildLegacyFlightSnapshot(flight, currentTime);

  return {
    flightSummary: buildFlightSummary(flight),
    phase: legacySnapshot.phase,
    progress: legacySnapshot.progress,
    journey: legacySnapshot.journey,
    currentCheckpoint: legacySnapshot.currentCheckpoint,
    nextCheckpoint: legacySnapshot.nextCheckpoint,
    status: legacySnapshot.status,
    situation: legacySnapshot.situation,
    rhythm: legacySnapshot.rhythm,
    environment: legacySnapshot.environment,
    reassurance: legacySnapshot.reassurance,
    expectedMoment: legacySnapshot.expectedMoment
  };
}
