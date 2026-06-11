import { Flight, FlightProgress } from "@/types/flight";
import { JourneyInformation, JourneyPhase } from "@/types/journey";
import { RouteCheckpoint } from "@/types/route";

import { calculateFlightProgress } from "@/features/flightCore/calculateFlightProgress";
import { estimateRemainingTime } from "@/features/flightCore/estimateRemainingTime";
import { getCurrentCheckpoint } from "@/features/flightCore/getCurrentCheckpoint";
import { FlightStatus, getFlightStatus } from "@/features/flightCore/getFlightStatus";
import { getNextCheckpoint } from "@/features/flightCore/getNextCheckpoint";
import { getNextExpectedMoment } from "@/features/interpreter/expectedMoments/getNextExpectedMoment";
import {
  getSituationMessage,
  SituationMessage
} from "@/features/interpreter/situations/getSituationMessage";
import { resolveSituation } from "@/features/interpreter/situations/resolveSituation";
import { SituationType } from "@/features/interpreter/situations/types";
import { resolveRhythmState } from "@/features/rhythm/resolveRhythmState";
import { FlightRhythmState } from "@/features/rhythm/types";
import { EnvironmentContext } from "@/types/environment";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";

const emptyEnvironmentContext: EnvironmentContext = {};

export type FlightSnapshot = {
  phase: JourneyPhase;
  progress: FlightProgress;
  journey: JourneyInformation;
  currentCheckpoint?: RouteCheckpoint;
  nextCheckpoint?: RouteCheckpoint;
  status: FlightStatus;
  situation: SituationType;
  rhythm: FlightRhythmState;
  environment: EnvironmentContext;
  reassurance: SituationMessage;
  situationMessage: SituationMessage;
  expectedMoment: NextExpectedMoment;
  nextExpectedMoment: NextExpectedMoment;
  delayedMinutes?: number;
};

function estimateDelayMinutes(progress: FlightProgress): number | undefined {
  if (progress.isBeforeDeparture || progress.isAfterArrival) {
    return undefined;
  }

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
        label: "Departure preparation",
        description: "The journey has not started yet, but the flight view is prepared.",
        expectedProgressRange: { startPercent: 0, endPercent: 5 },
        intensity: "medium",
        passengerMeaning: "Use this moment to get oriented before the flight begins.",
        typicalSensations: []
      };
    case "early_flight":
      return {
        id: "climb",
        label: "Early flight",
        description: "The aircraft is in the more active first part of the journey.",
        expectedProgressRange: { startPercent: 0, endPercent: 20 },
        intensity: "high",
        passengerMeaning: "More movement and changes in sound can be normal here.",
        typicalSensations: ["stronger engine sound", "turns", "changing angle"]
      };
    case "cruise":
      return {
        id: "cruise",
        label: "Cruise",
        description: "The aircraft is in the stable middle part of the route.",
        expectedProgressRange: { startPercent: 20, endPercent: 70 },
        intensity: "low",
        passengerMeaning: "This is usually the calmest and steadiest part of the flight.",
        typicalSensations: ["small sound changes", "minor course adjustments"]
      };
    case "late_flight":
      return {
        id: "descent",
        label: "Later flight",
        description: "The journey is moving toward arrival preparation.",
        expectedProgressRange: { startPercent: 70, endPercent: 90 },
        intensity: "medium",
        passengerMeaning: "The next noticeable changes may be linked to preparing for arrival.",
        typicalSensations: ["gradual turns", "engine sound changes"]
      };
    case "arrival_window":
      return {
        id: "approach",
        label: "Arrival window",
        description: "The flight is in the final part of the journey.",
        expectedProgressRange: { startPercent: 90, endPercent: 100 },
        intensity: "medium",
        passengerMeaning: "This part can feel busier while the aircraft lines up to arrive.",
        typicalSensations: ["turns", "speed changes", "landing preparation"]
      };
    case "completed":
    default:
      return {
        id: "arrival",
        label: "Arrival",
        description: "The scheduled journey has reached its destination window.",
        expectedProgressRange: { startPercent: 100, endPercent: 100 },
        intensity: "low",
        passengerMeaning: "The planned flight flow is complete.",
        typicalSensations: []
      };
  }
}

function buildJourneyInformation(
  flight: Flight,
  progress: FlightProgress
): JourneyInformation {
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

export function buildFlightSnapshot(
  flight: Flight,
  currentTime: Date
): FlightSnapshot {
  const rawProgress = calculateFlightProgress(flight, currentTime);
  const remainingMinutes = estimateRemainingTime(
    flight,
    rawProgress.progressPercent
  );

  const progress: FlightProgress = {
    ...rawProgress,
    remainingMinutes
  };

  const currentCheckpoint = getCurrentCheckpoint(
    flight.checkpoints,
    progress.progressPercent
  );

  const nextCheckpoint = getNextCheckpoint(
    flight.checkpoints,
    progress.progressPercent
  );

  const status = getFlightStatus(
    progress.progressPercent,
    progress.isBeforeDeparture,
    progress.isAfterArrival
  );

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

  const reassurance = getSituationMessage({
    situation,
    currentCheckpoint
  });

  const expectedMoment = getNextExpectedMoment({
    situation,
    nextCheckpoint,
    remainingMinutes: progress.remainingMinutes
  });

  return {
    phase,
    progress,
    journey,
    currentCheckpoint,
    nextCheckpoint,
    status,
    situation,
    rhythm,
    environment: emptyEnvironmentContext,
    reassurance,
    situationMessage: reassurance,
    expectedMoment,
    nextExpectedMoment: expectedMoment,
    delayedMinutes
  };
}
