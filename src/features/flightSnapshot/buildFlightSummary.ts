import { Flight } from "@/types/flight";

import { FlightSummary } from "./types";

export function buildFlightSummary(flight: Flight): FlightSummary {
  return {
    id: flight.id,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    aircraftLabel: flight.aircraftType,
    originLabel: flight.origin.city,
    destinationLabel: flight.destination.city,
    routeLabel: `${flight.origin.city} → ${flight.destination.city}`
  };
}
