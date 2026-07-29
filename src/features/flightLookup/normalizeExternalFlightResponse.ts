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
  departureCity?: unknown;
  departureTimeZone?: unknown;
  departureLatitude?: unknown;
  departureLongitude?: unknown;

  arrivalAirport?: unknown;
  arrivalAirportCode?: unknown;
  arrivalCity?: unknown;
  arrivalTimeZone?: unknown;
  arrivalLatitude?: unknown;
  arrivalLongitude?: unknown;

  scheduledDepartureUtc?: unknown;
  scheduledDepartureLocal?: unknown;
  scheduledArrivalUtc?: unknown;
  scheduledArrivalLocal?: unknown;

  estimatedDepartureUtc?: unknown;
  estimatedDepartureLocal?: unknown;
  estimatedArrivalUtc?: unknown;
  estimatedArrivalLocal?: unknown;

  departureTerminal?: unknown;
  departureGate?: unknown;
  baggageBelt?: unknown;
  aircraftModel?: unknown;

  status?: unknown;
  durationMinutes?: unknown;
  liveAltitudeFeet?: unknown;
  liveVerticalSpeedFeetPerMinute?: unknown;
  livePositionReportedAtUtc?: unknown;
};

const allowedStatuses: ExternalFlightStatus[] = [
  "scheduled",
  "boarding",
  "en_route",
  "landed",
  "delayed",
  "cancelled",
  "diverted",
  "unknown"
];

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function requiredString(value: unknown, fieldName: string): string {
  const normalized = optionalString(value);
  if (!normalized) throw new Error(`Missing normalized field: ${fieldName}`);
  return normalized;
}

function optionalIsoDate(value: unknown): string | undefined {
  const normalized = optionalString(value);
  if (!normalized || Number.isNaN(Date.parse(normalized))) return undefined;
  return new Date(normalized).toISOString();
}

function optionalLocalTime(value: unknown): string | undefined {
  const normalized = optionalString(value);
  if (!normalized || Number.isNaN(Date.parse(normalized))) return undefined;
  return normalized;
}

function normalizeStatus(value: unknown): ExternalFlightStatus {
  return typeof value === "string" && allowedStatuses.includes(value as ExternalFlightStatus)
    ? (value as ExternalFlightStatus)
    : "unknown";
}

function optionalDuration(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function optionalLatitude(value: unknown): number | undefined {
  const numberValue = optionalNumber(value);
  return numberValue !== undefined && numberValue >= -90 && numberValue <= 90
    ? numberValue
    : undefined;
}

function optionalLongitude(value: unknown): number | undefined {
  const numberValue = optionalNumber(value);
  return numberValue !== undefined && numberValue >= -180 && numberValue <= 180
    ? numberValue
    : undefined;
}

export function normalizeExternalFlightResponse(
  providerResponse: NormalizableFlightRecord,
  provider: FlightLookupProviderId,
  fetchedAt = new Date().toISOString()
): ExternalFlightSeed {
  return {
    flightNumber: requiredString(providerResponse.flightNumber, "flightNumber")
      .replace(/\s+/g, "")
      .toUpperCase(),
    airlineCode: optionalString(providerResponse.airlineCode)?.toUpperCase(),
    airlineName: optionalString(providerResponse.airlineName),

    departureAirport: requiredString(providerResponse.departureAirport, "departureAirport"),
    departureAirportCode: optionalString(providerResponse.departureAirportCode)?.toUpperCase(),
    departureCity: optionalString(providerResponse.departureCity),
    departureTimeZone: optionalString(providerResponse.departureTimeZone),
    departureLatitude: optionalLatitude(providerResponse.departureLatitude),
    departureLongitude: optionalLongitude(providerResponse.departureLongitude),

    arrivalAirport: requiredString(providerResponse.arrivalAirport, "arrivalAirport"),
    arrivalAirportCode: optionalString(providerResponse.arrivalAirportCode)?.toUpperCase(),
    arrivalCity: optionalString(providerResponse.arrivalCity),
    arrivalTimeZone: optionalString(providerResponse.arrivalTimeZone),
    arrivalLatitude: optionalLatitude(providerResponse.arrivalLatitude),
    arrivalLongitude: optionalLongitude(providerResponse.arrivalLongitude),

    scheduledDepartureUtc: optionalIsoDate(providerResponse.scheduledDepartureUtc),
    scheduledDepartureLocal: optionalLocalTime(providerResponse.scheduledDepartureLocal),
    scheduledArrivalUtc: optionalIsoDate(providerResponse.scheduledArrivalUtc),
    scheduledArrivalLocal: optionalLocalTime(providerResponse.scheduledArrivalLocal),

    estimatedDepartureUtc: optionalIsoDate(providerResponse.estimatedDepartureUtc),
    estimatedDepartureLocal: optionalLocalTime(providerResponse.estimatedDepartureLocal),
    estimatedArrivalUtc: optionalIsoDate(providerResponse.estimatedArrivalUtc),
    estimatedArrivalLocal: optionalLocalTime(providerResponse.estimatedArrivalLocal),

    departureTerminal: optionalString(providerResponse.departureTerminal),
    departureGate: optionalString(providerResponse.departureGate),
    baggageBelt: optionalString(providerResponse.baggageBelt),
    aircraftModel: optionalString(providerResponse.aircraftModel),

    status: normalizeStatus(providerResponse.status),
    durationMinutes: optionalDuration(providerResponse.durationMinutes),
    liveAltitudeFeet: optionalNumber(providerResponse.liveAltitudeFeet),
    liveVerticalSpeedFeetPerMinute: optionalNumber(providerResponse.liveVerticalSpeedFeetPerMinute),
    livePositionReportedAtUtc: optionalIsoDate(providerResponse.livePositionReportedAtUtc),
    provider,
    fetchedAt: new Date(fetchedAt).toISOString()
  };
}
