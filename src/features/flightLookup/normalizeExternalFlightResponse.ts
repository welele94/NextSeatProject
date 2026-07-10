import {
  ExternalFlightSeed,
  ExternalFlightStatus,
  FlightLookupProviderId
} from "./types";

type NormalizableFlightRecord = {
  flightNumber?: unknown;
  airlineCode?: unknown;
  airlineName?: unknown;
  departureAirport?: unknown;
  departureAirportCode?: unknown;
  arrivalAirport?: unknown;
  arrivalAirportCode?: unknown;
  scheduledDepartureUtc?: unknown;
  scheduledArrivalUtc?: unknown;
  estimatedDepartureUtc?: unknown;
  estimatedArrivalUtc?: unknown;
  status?: unknown;
  durationMinutes?: unknown;
};

const allowedStatuses: ExternalFlightStatus[] = [
  "scheduled",
  "boarding",
  "en_route",
  "landed",
  "delayed",
  "cancelled",
  "unknown"
];

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function requiredString(value: unknown, fieldName: string): string {
  const normalized = optionalString(value);

  if (!normalized) {
    throw new Error(`Missing normalized field: ${fieldName}`);
  }

  return normalized;
}

function optionalIsoDate(value: unknown): string | undefined {
  const normalized = optionalString(value);

  if (!normalized || Number.isNaN(Date.parse(normalized))) {
    return undefined;
  }

  return new Date(normalized).toISOString();
}

function normalizeStatus(value: unknown): ExternalFlightStatus {
  return typeof value === "string" &&
    allowedStatuses.includes(value as ExternalFlightStatus)
    ? (value as ExternalFlightStatus)
    : "unknown";
}

function optionalDuration(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : undefined;
}

/**
 * Converts an already provider-mapped record into the public safe contract.
 * Raw provider responses must first be mapped by their provider adapter.
 * Forbidden telemetry fields are intentionally absent from this contract.
 */
export function normalizeExternalFlightResponse(
  providerResponse: NormalizableFlightRecord,
  provider: FlightLookupProviderId,
  fetchedAt = new Date().toISOString()
): ExternalFlightSeed {
  return {
    flightNumber: requiredString(
      providerResponse.flightNumber,
      "flightNumber"
    ).replace(/\s+/g, "").toUpperCase(),
    airlineCode: optionalString(providerResponse.airlineCode)?.toUpperCase(),
    airlineName: optionalString(providerResponse.airlineName),
    departureAirport: requiredString(
      providerResponse.departureAirport,
      "departureAirport"
    ),
    departureAirportCode: optionalString(
      providerResponse.departureAirportCode
    )?.toUpperCase(),
    arrivalAirport: requiredString(
      providerResponse.arrivalAirport,
      "arrivalAirport"
    ),
    arrivalAirportCode: optionalString(
      providerResponse.arrivalAirportCode
    )?.toUpperCase(),
    scheduledDepartureUtc: optionalIsoDate(
      providerResponse.scheduledDepartureUtc
    ),
    scheduledArrivalUtc: optionalIsoDate(
      providerResponse.scheduledArrivalUtc
    ),
    estimatedDepartureUtc: optionalIsoDate(
      providerResponse.estimatedDepartureUtc
    ),
    estimatedArrivalUtc: optionalIsoDate(
      providerResponse.estimatedArrivalUtc
    ),
    status: normalizeStatus(providerResponse.status),
    durationMinutes: optionalDuration(providerResponse.durationMinutes),
    provider,
    fetchedAt: new Date(fetchedAt).toISOString()
  };
}
