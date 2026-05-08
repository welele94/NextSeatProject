import { Flight, FlightProgress } from "@/types/flight";
import { RouteCheckpoint } from "@/types/route";

import { calculateFlightProgress } from "@/features/flightCore/calculateFlightProgress";
import { estimateRemainingTime } from "@/features/flightCore/estimateRemainingTime";
import { getCurrentCheckpoint } from "@/features/flightCore/getCurrentCheckpoint";
import { FlightStatus, getFlightStatus } from "@/features/flightCore/getFlightStatus";
import { getNextCheckpoint } from "@/features/flightCore/getNextCheckpoint";
import { getNextExpectedMoment } from "@/features/interpreter/expectedMoments/getNextExpectedMoment";
import { getSituationMessage, SituationMessage } from "@/features/interpreter/situations/getSituationMessage";
import { resolveSituation } from "@/features/interpreter/situations/resolveSituation";
import { SituationType } from "@/features/interpreter/situations/types";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";

export type FlightSnapshot = {
  progress: FlightProgress;
  currentCheckpoint?: RouteCheckpoint;
  nextCheckpoint?: RouteCheckpoint;
  status: FlightStatus;
  situation: SituationType;
  situationMessage: SituationMessage;
  nextExpectedMoment: NextExpectedMoment;
  delayedMinutes?: number;
};

function estimateDelayMinutes(progress: FlightProgress): number | undefined {
  if (progress.isBeforeDeparture || progress.isAfterArrival) {
    return undefined;
  }

  const scheduleRemainingMinutes = progress.remainingMinutes;
  const progressBasedRemainingMinutes = Math.max(
    Math.round(
      progress.elapsedMinutes * (1 - progress.progressPercent / 100)
    ),
    0
  );

  const delay = progressBasedRemainingMinutes - scheduleRemainingMinutes;

  return delay > 0 ? delay : undefined;
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

  const delayedMinutes = estimateDelayMinutes(progress);

  const situation = resolveSituation({
    flightStatus: status,
    remainingMinutes: progress.remainingMinutes,
    progressPercent: progress.progressPercent,
    delayedMinutes
  });

  const situationMessage = getSituationMessage({
    situation,
    currentCheckpoint
  });

  const nextExpectedMoment = getNextExpectedMoment({
    situation,
    nextCheckpoint,
    remainingMinutes: progress.remainingMinutes
  });

  return {
    progress,
    currentCheckpoint,
    nextCheckpoint,
    status,
    situation,
    situationMessage,
    nextExpectedMoment,
    delayedMinutes
  };
}
