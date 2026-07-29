import { Flight, FlightProgress } from "@/types/flight";
import { JourneyInformation, JourneyPhase } from "@/types/journey";

import { calculateFlightProgress } from "@/features/flightCore/calculateFlightProgress";
import { getCurrentCheckpoint } from "@/features/flightCore/getCurrentCheckpoint";
import { FlightStatus, getFlightStatus } from "@/features/flightCore/getFlightStatus";
import { getNextCheckpoint } from "@/features/flightCore/getNextCheckpoint";
import { resolveGuidanceState } from "@/features/guidance/resolveGuidanceState";
import { getNextExpectedMoment } from "@/features/interpreter/expectedMoments/getNextExpectedMoment";
import { getSituationMessage } from "@/features/interpreter/situations/getSituationMessage";
import { resolveSituation } from "@/features/interpreter/situations/resolveSituation";
import { resolveRhythmState } from "@/features/rhythm/resolveRhythmState";
import { EnvironmentContext } from "@/types/environment";

import { buildFlightSummary } from "./buildFlightSummary";
import { FlightSnapshot } from "./types";

const emptyEnvironmentContext: EnvironmentContext = {};
const PROVIDER_LANDED_TOLERANCE_MS = 5 * 60 * 1000;

function estimateDelayMinutes(progress: FlightProgress): number | undefined {
  if (progress.isBeforeDeparture || progress.isAfterArrival) return undefined;
  const scheduleRemainingMinutes = progress.remainingMinutes;
  const progressBasedRemainingMinutes = Math.max(
    Math.round(progress.elapsedMinutes * (1 - progress.progressPercent / 100)),
    0
  );
  const delay = progressBasedRemainingMinutes - scheduleRemainingMinutes;
  return delay > 0 ? delay : undefined;
}

function resolveJourneyPhase(status: FlightStatus): JourneyPhase {
  switch (status) {
    case "before_departure":
      return {
        id: "departure",
        label: "Pre-flight",
        description: "The flight has not started yet, and the app is ready for the journey.",
        expectedProgressRange: { startPercent: 0, endPercent: 5 },
        intensity: "low",
        passengerMeaning: "Use this moment to get settled before departure.",
        typicalSensations: ["boarding", "crew checks", "waiting"]
      };
    case "early_flight":
      return {
        id: "climb",
        label: "Takeoff / climb",
        description: "The aircraft is in the more active first part of the journey.",
        expectedProgressRange: { startPercent: 0, endPercent: 15 },
        intensity: "high",
        passengerMeaning: "More movement and changes in sound can be normal here.",
        typicalSensations: ["stronger engine sound", "turns", "changing angle"]
      };
    case "cruise":
      return {
        id: "cruise",
        label: "Cruise",
        description: "The aircraft is in the stable middle part of the route.",
        expectedProgressRange: { startPercent: 15, endPercent: 100 },
        intensity: "low",
        passengerMeaning: "This is usually the calmest and steadiest part of the flight.",
        typicalSensations: ["small sound changes", "minor course adjustments"]
      };
    case "late_flight":
      return {
        id: "descent",
        label: "Descent",
        description: "The journey is moving toward arrival preparation.",
        expectedProgressRange: { startPercent: 0, endPercent: 100 },
        intensity: "medium",
        passengerMeaning: "The next noticeable changes may be linked to preparing for arrival.",
        typicalSensations: ["gradual turns", "engine sound changes"]
      };
    case "arrival_window":
      return {
        id: "approach",
        label: "Approach",
        description: "The flight is in the final part of the journey.",
        expectedProgressRange: { startPercent: 0, endPercent: 100 },
        intensity: "medium",
        passengerMeaning: "This part can feel busier while the aircraft lines up to arrive.",
        typicalSensations: ["turns", "speed changes", "landing preparation"]
      };
    case "completed":
    default:
      return {
        id: "arrival",
        label: "Arrived",
        description: "The journey has reached its destination.",
        expectedProgressRange: { startPercent: 100, endPercent: 100 },
        intensity: "low",
        passengerMeaning: "The flight is complete and the final airport steps can begin.",
        typicalSensations: []
      };
  }
}

function buildJourneyInformation(flight: Flight, progress: FlightProgress): JourneyInformation {
  return {
    originLabel: flight.origin.city,
    destinationLabel: flight.destination.city,
    routeLabel: `${flight.origin.city} → ${flight.destination.city}`,
    aircraftLabel: flight.aircraftType,
    estimatedDurationMinutes: flight.schedule.estimatedDurationMinutes,
    remainingMinutes: progress.remainingMinutes,
    completedPercent: progress.progressPercent
  };
}

function resolveArrivalMs(flight: Flight): number | undefined {
  const value = flight.schedule.revisedArrival ?? flight.schedule.scheduledArrival;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function providerStatusIsActive(flight: Flight): boolean {
  return ["scheduled", "boarding", "en_route", "delayed", "diverted", "unknown"].includes(
    flight.operations?.providerStatus ?? "unknown"
  );
}

function resolveStatus(flight: Flight, currentTime: Date, progress: FlightProgress): FlightStatus {
  const arrivalMs = resolveArrivalMs(flight);
  const arrivalPassed = arrivalMs !== undefined && currentTime.getTime() >= arrivalMs;
  const hasRevisedArrival = Boolean(flight.schedule.revisedArrival);
  const providerLanded = flight.operations?.providerStatus === "landed";
  const activeProviderStatus = providerStatusIsActive(flight);
  const providerLandedIsPlausible =
    providerLanded &&
    (arrivalMs === undefined || currentTime.getTime() >= arrivalMs - PROVIDER_LANDED_TOLERANCE_MS);
  const timelineSaysArrived = arrivalPassed && (hasRevisedArrival || !activeProviderStatus);

  if (timelineSaysArrived || providerLandedIsPlausible) return "completed";

  return getFlightStatus(
    progress.progressPercent,
    progress.isBeforeDeparture,
    false,
    flight.schedule.estimatedDurationMinutes,
    progress.elapsedMinutes,
    progress.remainingMinutes,
    flight.operations?.liveAltitudeFeet,
    flight.operations?.liveVerticalSpeedFeetPerMinute
  );
}

export function buildFlightSnapshot(flight: Flight, currentTime: Date): FlightSnapshot {
  const rawProgress = calculateFlightProgress(flight, currentTime);
  const status = resolveStatus(flight, currentTime, rawProgress);
  const progress: FlightProgress = status === "completed"
    ? { ...rawProgress, progressPercent: 100, remainingMinutes: 0, isAfterArrival: true }
    : { ...rawProgress, isAfterArrival: false };

  const currentCheckpoint = getCurrentCheckpoint(flight.checkpoints, progress.progressPercent);
  const nextCheckpoint = getNextCheckpoint(flight.checkpoints, progress.progressPercent);
  const phase = resolveJourneyPhase(status);
  const journey = buildJourneyInformation(flight, progress);
  const delayedMinutes = estimateDelayMinutes(progress);

  const situation = resolveSituation({
    flightStatus: status,
    remainingMinutes: progress.remainingMinutes,
    progressPercent: progress.progressPercent,
    delayedMinutes
  });

  const rhythm = resolveRhythmState({
    flightStatus: status,
    situation,
    remainingMinutes: progress.remainingMinutes,
    progressPercent: progress.progressPercent
  });

  const guidance = resolveGuidanceState({ progress, status });
  const reassurance = getSituationMessage({ situation, currentCheckpoint });
  const expectedMoment = getNextExpectedMoment({
    situation,
    nextCheckpoint,
    remainingMinutes: progress.remainingMinutes
  });

  return {
    flightSummary: buildFlightSummary(flight),
    phase,
    progress,
    journey,
    currentCheckpoint,
    nextCheckpoint,
    status,
    situation,
    rhythm,
    environment: emptyEnvironmentContext,
    guidance,
    reassurance,
    expectedMoment
  };
}
