import { FlightGuidanceState } from "@/features/guidance/types";
import { RoutePatternSummary } from "@/features/routePattern/types";

export type FlightDetailsSnapshot = {
  currentFlight: {
    flightNumber: string;
    airline: string;
    aircraftLabel?: string;
    origin: string;
    destination: string;
    scheduledDeparture: string;
    estimatedDeparture?: string;
    actualDeparture?: string;
    scheduledArrival: string;
    estimatedArrival?: string;
    lastUpdateAt: string | null;
  };
  routeDetails: {
    routeLabel: string;
    typicalDurationMinutes?: number;
    estimatedDistanceKm?: number;
    typicalDescentWindowMinutesBeforeArrival?: {
      from: number;
      to: number;
    };
    routeTimingPatternLabel: string;
    reassuranceMessage: string;
  };
  routePatternSummary: RoutePatternSummary;
  offlineGuidance: FlightGuidanceState;
};
