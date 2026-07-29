import { Flight } from "@/types/flight";

import { FlightSummary } from "./types";

function formatDeviceTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function durationBetween(start?: string, end?: string): number | undefined {
  if (!start || !end) return undefined;
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return undefined;
  return Math.round((endMs - startMs) / 60000);
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
    originCoordinates: flight.origin.coordinates,
    destinationCoordinates: flight.destination.coordinates,
    routeLabel: `${flight.origin.city} → ${flight.destination.city}`,
    scheduledDepartureLabel: formatDeviceTime(flight.schedule.scheduledDeparture),
    scheduledArrivalLabel: formatDeviceTime(flight.schedule.scheduledArrival),
    revisedDepartureLabel: flight.schedule.revisedDeparture
      ? formatDeviceTime(flight.schedule.revisedDeparture)
      : undefined,
    revisedArrivalLabel: flight.schedule.revisedArrival
      ? formatDeviceTime(flight.schedule.revisedArrival)
      : undefined,
    timeDisplayNote: "Times shown in your phone’s time.",
    scheduledDurationMinutes:
      durationBetween(flight.schedule.scheduledDeparture, flight.schedule.scheduledArrival) ??
      flight.schedule.estimatedDurationMinutes,
    revisedDurationMinutes: durationBetween(
      flight.schedule.revisedDeparture ?? flight.schedule.scheduledDeparture,
      flight.schedule.revisedArrival
    ),
    revisedArrival: flight.schedule.revisedArrival,
    providerStatus: flight.operations?.providerStatus,
    departureTerminal: flight.operations?.departureTerminal,
    departureGate: flight.operations?.departureGate,
    baggageBelt: flight.operations?.baggageBelt
  };
}
