import { FlightProgress } from "@/types/flight";
import { JourneyInformation, JourneyPhase } from "@/types/journey";
import { RouteCheckpoint } from "@/types/route";

import { FlightStatus } from "@/features/flightCore/getFlightStatus";
import { SituationMessage } from "@/features/interpreter/situations/getSituationMessage";
import { SituationType } from "@/features/interpreter/situations/types";
import { FlightRhythmState } from "@/features/rhythm/types";
import { EnvironmentContext } from "@/types/environment";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";

export type FlightSummary = {
  id: string;
  flightNumber: string;
  airline: string;
  aircraftLabel: string;
  originLabel: string;
  destinationLabel: string;
  routeLabel: string;
};

export type FlightSnapshot = {
  flightSummary: FlightSummary;
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
  expectedMoment: NextExpectedMoment;
};
