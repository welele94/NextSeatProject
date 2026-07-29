import { normalizeExternalFlightResponse } from "../normalizeExternalFlightResponse";
import {
  ExternalFlightStatus,
  FlightDataProvider,
  FlightLookupInput,
  FlightLookupResult
} from "../types";

type AeroDataBoxTime = {
  utc?: string;
  local?: string;
};

type AeroDataBoxDistance = {
  feet?: number;
  ft?: number;
};

type AeroDataBoxCoordinates = {
  lat?: number;
  lon?: number;
  latitude?: number;
  longitude?: number;
};

type AeroDataBoxLocation = {
  pressureAltitude?: AeroDataBoxDistance | number;
  altitude?: AeroDataBoxDistance | number;
  vsiFpm?: number;
  reportedAtUtc?: string;
};

type AeroDataBoxMovement = {
  airport?: {
    iata?: string;
    name?: string;
    shortName?: string;
    municipalityName?: string;
    timeZone?: string;
    location?: AeroDataBoxCoordinates;
  };
  scheduledTime?: AeroDataBoxTime;
  revisedTime?: AeroDataBoxTime;
  predictedTime?: AeroDataBoxTime;
  actualTime?: AeroDataBoxTime;
  terminal?: string;
  gate?: string;
  baggageBelt?: string;
};

type AeroDataBoxFlight = {
  number?: string;
  status?: string;
  departure?: AeroDataBoxMovement;
  arrival?: AeroDataBoxMovement;
  aircraft?: {
    model?: string;
  };
  airline?: {
    name?: string;
    iata?: string;
  };
  location?: AeroDataBoxLocation;
};

type AeroDataBoxFlightProviderOptions = {
  apiKey: string;
  fetchImpl?: typeof fetch;
};

const RAPID_API_HOST = "aerodatabox.p.rapidapi.com";
const RAPID_API_BASE_URL = `https://${RAPID_API_HOST}`;

function normalizeFlightNumber(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function isValidFlightNumber(value: string): boolean {
  return /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(value);
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function cleanOperationalValue(value?: string): string | undefined {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function optionalNumber(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalLatitude(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90
    ? value
    : undefined;
}

function optionalLongitude(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180
    ? value
    : undefined;
}

function airportLatitude(location?: AeroDataBoxCoordinates): number | undefined {
  return optionalLatitude(location?.lat) ?? optionalLatitude(location?.latitude);
}

function airportLongitude(location?: AeroDataBoxCoordinates): number | undefined {
  return optionalLongitude(location?.lon) ?? optionalLongitude(location?.longitude);
}

function optionalAltitudeFeet(value?: AeroDataBoxDistance | number): number | undefined {
  if (typeof value === "number") return optionalNumber(value);
  return optionalNumber(value?.feet) ?? optionalNumber(value?.ft);
}

function mapStatus(status?: string): ExternalFlightStatus {
  switch (status?.trim().toLowerCase()) {
    case "scheduled":
    case "expected":
      return "scheduled";
    case "boarding":
    case "gate closed":
      return "boarding";
    case "en route":
    case "enroute":
    case "departed":
      return "en_route";
    case "arrived":
    case "landed":
      return "landed";
    case "delayed":
      return "delayed";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "diverted":
      return "diverted";
    default:
      return "unknown";
  }
}

function preferredAirportName(movement?: AeroDataBoxMovement): string | undefined {
  return (
    movement?.airport?.municipalityName ??
    movement?.airport?.shortName ??
    movement?.airport?.name
  );
}

function normalizeAeroDataBoxUtc(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return Number.isNaN(Date.parse(normalized)) ? undefined : new Date(normalized).toISOString();
}

function normalizeAeroDataBoxLocal(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return Number.isNaN(Date.parse(normalized)) ? undefined : normalized;
}

function normalizeAeroDataBoxInstant(time?: AeroDataBoxTime): string | undefined {
  // Prefer the airport-local timestamp when it includes an offset. It is the least
  // ambiguous value for passenger-facing timelines and avoids mixing a stale/odd
  // provider UTC value with a fresh local time.
  return normalizeAeroDataBoxUtc(time?.local) ?? normalizeAeroDataBoxUtc(time?.utc);
}

function preferredDepartureTime(movement?: AeroDataBoxMovement): AeroDataBoxTime | undefined {
  // Once a flight has pushed back or departed, actualTime is the least misleading
  // source for the departure side. revisedTime can remain close to the original
  // schedule and would make delayed short hops look much longer than they are.
  return movement?.actualTime ?? movement?.revisedTime ?? movement?.predictedTime;
}

function preferredArrivalTime(movement?: AeroDataBoxMovement): AeroDataBoxTime | undefined {
  // For the arrival side, actual is final, predicted is the best in-flight ETA,
  // and revised is the fallback when the provider has not published a prediction.
  return movement?.actualTime ?? movement?.predictedTime ?? movement?.revisedTime;
}

function calculateDurationMinutes(departureUtc?: string, arrivalUtc?: string): number | undefined {
  if (!departureUtc || !arrivalUtc) return undefined;
  const departure = Date.parse(departureUtc);
  const arrival = Date.parse(arrivalUtc);
  if (Number.isNaN(departure) || Number.isNaN(arrival) || arrival <= departure) return undefined;
  return Math.round((arrival - departure) / 60000);
}

function chooseFlight(flights: AeroDataBoxFlight[], requestedFlightNumber: string) {
  return flights.find((flight) => normalizeFlightNumber(flight.number ?? "") === requestedFlightNumber) ?? flights[0];
}

function resolveLiveAltitudeFeet(location?: AeroDataBoxLocation): number | undefined {
  return optionalAltitudeFeet(location?.pressureAltitude) ?? optionalAltitudeFeet(location?.altitude);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class AeroDataBoxFlightProvider implements FlightDataProvider {
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ apiKey, fetchImpl = fetch }: AeroDataBoxFlightProviderOptions) {
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl.bind(globalThis);
  }

  async lookupFlight(input: FlightLookupInput): Promise<FlightLookupResult> {
    const flightNumber = normalizeFlightNumber(input.flightNumber);
    if (!isValidFlightNumber(flightNumber)) return { ok: false, reason: "invalid_flight_number" };

    const date = input.date ?? todayUtc();
    if (!isValidDate(date)) return { ok: false, reason: "invalid_flight_number" };

    const url = new URL(`/flights/number/${encodeURIComponent(flightNumber)}/${encodeURIComponent(date)}`, RAPID_API_BASE_URL);
    url.searchParams.set("withAircraftImage", "false");
    url.searchParams.set("withLocation", "true");

    let response: Response;
    try {
      response = await this.fetchImpl(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-RapidAPI-Key": this.apiKey,
          "X-RapidAPI-Host": RAPID_API_HOST
        }
      });
    } catch (error) {
      console.error("AeroDataBox fetch failed", { flightNumber, date, message: errorMessage(error) });
      return { ok: false, reason: "provider_unavailable" };
    }

    if (response.status === 404) return { ok: false, reason: "not_found" };
    if (response.status === 429) return { ok: false, reason: "rate_limited" };
    if (!response.ok) {
      console.error("AeroDataBox returned a non-success response", { flightNumber, date, status: response.status });
      return { ok: false, reason: "provider_unavailable" };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      console.error("AeroDataBox returned invalid JSON", { message: errorMessage(error) });
      return { ok: false, reason: "provider_unavailable" };
    }

    if (!Array.isArray(payload) || payload.length === 0) return { ok: false, reason: "not_found" };

    const flight = chooseFlight(payload as AeroDataBoxFlight[], flightNumber);
    const departureAirport = preferredAirportName(flight?.departure);
    const arrivalAirport = preferredAirportName(flight?.arrival);
    if (!flight || !departureAirport || !arrivalAirport) return { ok: false, reason: "not_found" };

    const scheduledDepartureUtc = normalizeAeroDataBoxInstant(flight.departure?.scheduledTime);
    const scheduledArrivalUtc = normalizeAeroDataBoxInstant(flight.arrival?.scheduledTime);
    const estimatedDeparture = preferredDepartureTime(flight.departure);
    const estimatedArrival = preferredArrivalTime(flight.arrival);

    return {
      ok: true,
      data: normalizeExternalFlightResponse(
        {
          flightNumber: flight.number ?? flightNumber,
          airlineCode: flight.airline?.iata ?? flightNumber.match(/^[A-Z0-9]{2,3}/)?.[0],
          airlineName: flight.airline?.name,

          departureAirport,
          departureAirportCode: flight.departure?.airport?.iata,
          departureCity: flight.departure?.airport?.municipalityName,
          departureTimeZone: flight.departure?.airport?.timeZone,
          departureLatitude: airportLatitude(flight.departure?.airport?.location),
          departureLongitude: airportLongitude(flight.departure?.airport?.location),

          arrivalAirport,
          arrivalAirportCode: flight.arrival?.airport?.iata,
          arrivalCity: flight.arrival?.airport?.municipalityName,
          arrivalTimeZone: flight.arrival?.airport?.timeZone,
          arrivalLatitude: airportLatitude(flight.arrival?.airport?.location),
          arrivalLongitude: airportLongitude(flight.arrival?.airport?.location),

          scheduledDepartureUtc,
          scheduledDepartureLocal: normalizeAeroDataBoxLocal(flight.departure?.scheduledTime?.local),
          scheduledArrivalUtc,
          scheduledArrivalLocal: normalizeAeroDataBoxLocal(flight.arrival?.scheduledTime?.local),

          estimatedDepartureUtc: normalizeAeroDataBoxInstant(estimatedDeparture),
          estimatedDepartureLocal: normalizeAeroDataBoxLocal(estimatedDeparture?.local),
          estimatedArrivalUtc: normalizeAeroDataBoxInstant(estimatedArrival),
          estimatedArrivalLocal: normalizeAeroDataBoxLocal(estimatedArrival?.local),

          departureTerminal: cleanOperationalValue(flight.departure?.terminal),
          departureGate: cleanOperationalValue(flight.departure?.gate),
          baggageBelt: cleanOperationalValue(flight.arrival?.baggageBelt),
          aircraftModel: cleanOperationalValue(flight.aircraft?.model),

          status: mapStatus(flight.status),
          durationMinutes: calculateDurationMinutes(scheduledDepartureUtc, scheduledArrivalUtc),
          liveAltitudeFeet: resolveLiveAltitudeFeet(flight.location),
          liveVerticalSpeedFeetPerMinute: optionalNumber(flight.location?.vsiFpm),
          livePositionReportedAtUtc: normalizeAeroDataBoxUtc(flight.location?.reportedAtUtc)
        },
        "aerodatabox"
      )
    };
  }
}
