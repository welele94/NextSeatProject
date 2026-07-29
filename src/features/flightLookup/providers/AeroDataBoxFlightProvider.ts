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

type AeroDataBoxMovement = {
  airport?: {
    iata?: string;
    name?: string;
    shortName?: string;
    municipalityName?: string;
    timeZone?: string;
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
    url.searchParams.set("withLocation", "false");

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

    const scheduledDepartureUtc = normalizeAeroDataBoxUtc(flight.departure?.scheduledTime?.utc);
    const scheduledArrivalUtc = normalizeAeroDataBoxUtc(flight.arrival?.scheduledTime?.utc);
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

          arrivalAirport,
          arrivalAirportCode: flight.arrival?.airport?.iata,
          arrivalCity: flight.arrival?.airport?.municipalityName,
          arrivalTimeZone: flight.arrival?.airport?.timeZone,

          scheduledDepartureUtc,
          scheduledDepartureLocal: normalizeAeroDataBoxLocal(flight.departure?.scheduledTime?.local),
          scheduledArrivalUtc,
          scheduledArrivalLocal: normalizeAeroDataBoxLocal(flight.arrival?.scheduledTime?.local),

          estimatedDepartureUtc: normalizeAeroDataBoxUtc(estimatedDeparture?.utc),
          estimatedDepartureLocal: normalizeAeroDataBoxLocal(estimatedDeparture?.local),
          estimatedArrivalUtc: normalizeAeroDataBoxUtc(estimatedArrival?.utc),
          estimatedArrivalLocal: normalizeAeroDataBoxLocal(estimatedArrival?.local),

          departureTerminal: cleanOperationalValue(flight.departure?.terminal),
          departureGate: cleanOperationalValue(flight.departure?.gate),
          baggageBelt: cleanOperationalValue(flight.arrival?.baggageBelt),
          aircraftModel: cleanOperationalValue(flight.aircraft?.model),

          status: mapStatus(flight.status),
          durationMinutes: calculateDurationMinutes(scheduledDepartureUtc, scheduledArrivalUtc)
        },
        "aerodatabox"
      )
    };
  }
}
