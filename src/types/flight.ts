import { Coordinates, RouteCheckpoint, RoutePoint } from "./route";
import { Checkpoint } from "./route";

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
  estimatedDurationMinutes: number;
};

export type Flight = {
  id: string;
  flightNumber: string;
  airline: string;
  aircraftType: string;
  origin: Airport;
  destination: Airport;
  schedule: FlightSchedule;
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
