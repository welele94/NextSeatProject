import { Coordinates, RouteCheckpoint, RoutePoint } from "./route";

export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  coordinates: Coordinates;
};

export type FlightSchedule = {
  scheduledDeparture: string;
  scheduledArrival: string;
  revisedDeparture?: string;
  revisedArrival?: string;
  estimatedDurationMinutes: number;
};

export type FlightOperations = {
  providerStatus?:
    | "scheduled"
    | "boarding"
    | "en_route"
    | "landed"
    | "delayed"
    | "cancelled"
    | "diverted"
    | "unknown";
  departureTerminal?: string;
  departureGate?: string;
  baggageBelt?: string;
  preparedAt?: string;
};

export type Flight = {
  id: string;
  flightNumber: string;
  airline: string;
  aircraftType: string;
  origin: Airport;
  destination: Airport;
  schedule: FlightSchedule;
  operations?: FlightOperations;
  routeDistanceKm: number;
  routeCoordinates: RoutePoint[];
  checkpoints: RouteCheckpoint[];
};

export type FlightProgress = {
  progressPercent: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  isBeforeDeparture: boolean;
  isAfterArrival: boolean;
};