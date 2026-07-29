import { ExternalFlightSeed } from "./types";
import { Flight } from "@/types/flight";

function validIso(value?: string): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}

function addMinutes(value: string, minutes: number): string {
  return new Date(new Date(value).getTime() + minutes * 60000).toISOString();
}

function safeDuration(seed: ExternalFlightSeed): number {
  if (seed.durationMinutes && seed.durationMinutes > 0) return seed.durationMinutes;

  const departure = validIso(seed.estimatedDepartureUtc ?? seed.scheduledDepartureUtc);
  const arrival = validIso(seed.estimatedArrivalUtc ?? seed.scheduledArrivalUtc);

  if (departure && arrival) {
    const minutes = Math.round((new Date(arrival).getTime() - new Date(departure).getTime()) / 60000);
    if (minutes > 0) return minutes;
  }

  return 120;
}

export function createFlightFromExternalSeed(seed: ExternalFlightSeed): Flight {
  const durationMinutes = safeDuration(seed);
  const scheduledDeparture =
    validIso(seed.scheduledDepartureUtc) ?? addMinutes(new Date().toISOString(), 60);
  const scheduledArrival =
    validIso(seed.scheduledArrivalUtc) ?? addMinutes(scheduledDeparture, durationMinutes);
  const revisedDeparture = validIso(seed.estimatedDepartureUtc);
  const revisedArrival = validIso(seed.estimatedArrivalUtc);
  const timelineDeparture = revisedDeparture ?? scheduledDeparture;

  const originCode = seed.departureAirportCode ?? seed.departureAirport;
  const destinationCode = seed.arrivalAirportCode ?? seed.arrivalAirport;
  const originCity = seed.departureCity ?? seed.departureAirport;
  const destinationCity = seed.arrivalCity ?? seed.arrivalAirport;
  const estimatedDistanceKm = Math.max(Math.round(durationMinutes * 12), 1);

  return {
    id: `external-${seed.flightNumber}-${timelineDeparture.slice(0, 10)}`,
    flightNumber: seed.flightNumber,
    airline: seed.airlineName ?? seed.airlineCode ?? "Airline",
    aircraftType: seed.aircraftModel ?? "Aircraft details not needed for guidance",
    origin: {
      code: originCode,
      name: seed.departureAirport,
      city: originCity,
      country: "",
      coordinates: { latitude: 0, longitude: 0 }
    },
    destination: {
      code: destinationCode,
      name: seed.arrivalAirport,
      city: destinationCity,
      country: "",
      coordinates: { latitude: 0, longitude: 0 }
    },
    schedule: {
      scheduledDeparture,
      scheduledArrival,
      revisedDeparture,
      revisedArrival,
      estimatedDurationMinutes: durationMinutes
    },
    operations: {
      providerStatus: seed.status,
      departureTerminal: seed.departureTerminal,
      departureGate: seed.departureGate,
      baggageBelt: seed.baggageBelt,
      preparedAt: new Date().toISOString()
    },
    routeDistanceKm: estimatedDistanceKm,
    routeCoordinates: [
      {
        id: "origin",
        label: originCity,
        coordinates: { latitude: 0, longitude: 0 },
        distanceFromOriginKm: 0
      },
      {
        id: "destination",
        label: destinationCity,
        coordinates: { latitude: 0, longitude: 0 },
        distanceFromOriginKm: estimatedDistanceKm
      }
    ],
    checkpoints: []
  };
}