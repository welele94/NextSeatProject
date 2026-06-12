import { Flight } from "@/types/flight";

import { FlightSummary } from "./types";

function formatScheduledTime(timestamp: string): string {
  const date = new Date(timestamp);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function buildFlightSummary(flight: Flight): FlightSummary {
  return {
    id: flight.id,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    aircraftLabel: flight.aircraftType,

    originLabel: flight.origin.city,
    destinationLabel: flight.destination.city,
    originCode: flight.origin.code,
    destinationCode: flight.destination.code,

    routeLabel: `${flight.origin.city} → ${flight.destination.city}`,

    scheduledDepartureLabel: formatScheduledTime(flight.schedule.scheduledDeparture),
    scheduledArrivalLabel: formatScheduledTime(flight.schedule.scheduledArrival)
  };
}
