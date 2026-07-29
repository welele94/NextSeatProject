import { ExternalFlightSeed } from "./types";
import { Flight } from "@/types/flight";
import { Coordinates } from "@/types/route";

function validIso(value?: string): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}

function addMinutes(value: string, minutes: number): string {
  return new Date(new Date(value).getTime() + minutes * 60000).toISOString();
}

function durationBetween(start?: string, end?: string): number | undefined {
  if (!start || !end) return undefined;
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return undefined;
  return Math.round((endMs - startMs) / 60000);
}

function isPlausibleUpdatedDuration(updatedMinutes: number, scheduledMinutes: number): boolean {
  const minimum = Math.max(15, Math.round(scheduledMinutes * 0.35));
  const maximum = Math.max(scheduledMinutes + 45, Math.round(scheduledMinutes * 1.65));
  return updatedMinutes >= minimum && updatedMinutes <= maximum;
}

function scheduledDuration(seed: ExternalFlightSeed): number | undefined {
  const departure = validIso(seed.scheduledDepartureUtc);
  const arrival = validIso(seed.scheduledArrivalUtc);
  return durationBetween(departure, arrival);
}

function safeDuration(seed: ExternalFlightSeed): number {
  const scheduledMinutes = scheduledDuration(seed);
  if (seed.durationMinutes && seed.durationMinutes > 0) return seed.durationMinutes;
  if (scheduledMinutes && scheduledMinutes > 0) return scheduledMinutes;

  const departure = validIso(seed.estimatedDepartureUtc ?? seed.scheduledDepartureUtc);
  const arrival = validIso(seed.estimatedArrivalUtc ?? seed.scheduledArrivalUtc);
  const updatedMinutes = durationBetween(departure, arrival);

  if (updatedMinutes && updatedMinutes > 0) return updatedMinutes;
  return 120;
}

function resolveUpdatedArrival({
  revisedDeparture,
  revisedArrival,
  scheduledDeparture,
  scheduledArrival,
  durationMinutes
}: {
  revisedDeparture?: string;
  revisedArrival?: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  durationMinutes: number;
}): string | undefined {
  if (!revisedArrival) {
    return revisedDeparture ? addMinutes(revisedDeparture, durationMinutes) : undefined;
  }

  const referenceDeparture = revisedDeparture ?? scheduledDeparture;
  const updatedDuration = durationBetween(referenceDeparture, revisedArrival);
  const scheduledDurationMinutes = durationBetween(scheduledDeparture, scheduledArrival) ?? durationMinutes;

  if (!updatedDuration || !isPlausibleUpdatedDuration(updatedDuration, scheduledDurationMinutes)) {
    return revisedDeparture ? addMinutes(revisedDeparture, scheduledDurationMinutes) : undefined;
  }

  return revisedArrival;
}

function hasValidCoordinate(latitude?: number, longitude?: number): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function coordinatesFromSeed(seed: ExternalFlightSeed, side: "departure" | "arrival"): Coordinates {
  const latitude = side === "departure" ? seed.departureLatitude : seed.arrivalLatitude;
  const longitude = side === "departure" ? seed.departureLongitude : seed.arrivalLongitude;

  if (hasValidCoordinate(latitude, longitude)) {
    return { latitude, longitude };
  }

  return { latitude: 0, longitude: 0 };
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKm(origin: Coordinates, destination: Coordinates): number | undefined {
  const hasOrigin = origin.latitude !== 0 || origin.longitude !== 0;
  const hasDestination = destination.latitude !== 0 || destination.longitude !== 0;
  if (!hasOrigin || !hasDestination) return undefined;

  const earthRadiusKm = 6371;
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c);
}

export function createFlightFromExternalSeed(seed: ExternalFlightSeed): Flight {
  const durationMinutes = safeDuration(seed);
  const scheduledDeparture =
    validIso(seed.scheduledDepartureUtc) ?? addMinutes(new Date().toISOString(), 60);
  const scheduledArrival =
    validIso(seed.scheduledArrivalUtc) ?? addMinutes(scheduledDeparture, durationMinutes);
  const revisedDeparture = validIso(seed.estimatedDepartureUtc);
  const revisedArrival = resolveUpdatedArrival({
    revisedDeparture,
    revisedArrival: validIso(seed.estimatedArrivalUtc),
    scheduledDeparture,
    scheduledArrival,
    durationMinutes
  });
  const timelineDeparture = revisedDeparture ?? scheduledDeparture;

  const originCode = seed.departureAirportCode ?? seed.departureAirport;
  const destinationCode = seed.arrivalAirportCode ?? seed.arrivalAirport;
  const originCity = seed.departureCity ?? seed.departureAirport;
  const destinationCity = seed.arrivalCity ?? seed.arrivalAirport;
  const originCoordinates = coordinatesFromSeed(seed, "departure");
  const destinationCoordinates = coordinatesFromSeed(seed, "arrival");
  const estimatedDistanceKm = distanceKm(originCoordinates, destinationCoordinates) ?? Math.max(Math.round(durationMinutes * 12), 1);

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
      coordinates: originCoordinates
    },
    destination: {
      code: destinationCode,
      name: seed.arrivalAirport,
      city: destinationCity,
      country: "",
      coordinates: destinationCoordinates
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
      preparedAt: new Date().toISOString(),
      providerFetchedAt: seed.fetchedAt,
      liveAltitudeFeet: seed.liveAltitudeFeet,
      liveVerticalSpeedFeetPerMinute: seed.liveVerticalSpeedFeetPerMinute,
      livePositionReportedAtUtc: seed.livePositionReportedAtUtc
    },
    routeDistanceKm: estimatedDistanceKm,
    routeCoordinates: [
      {
        id: "origin",
        label: originCity,
        coordinates: originCoordinates,
        distanceFromOriginKm: 0
      },
      {
        id: "destination",
        label: destinationCity,
        coordinates: destinationCoordinates,
        distanceFromOriginKm: estimatedDistanceKm
      }
    ],
    checkpoints: []
  };
}
