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
  };
  scheduledTime?: AeroDataBoxTime;
  revisedTime?: AeroDataBoxTime;
  predictedTime?: AeroDataBoxTime;
  actualTime?: AeroDataBoxTime;
};

type AeroDataBoxFlight = {
  number?: string;
  status?: string;
  departure?: AeroDataBoxMovement;
  arrival?: AeroDataBoxMovement;
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
  if (!value) {
    return undefined;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return Number.isNaN(Date.parse(normalized)) ? undefined : new Date(normalized).toISOString();
}

function preferredEstimate(movement?: AeroDataBoxMovement): string | undefined {
  return normalizeAeroDataBoxUtc(
    movement?.predictedTime?.utc ??
      movement?.revisedTime?.utc ??
      movement?.actualTime?.utc
  );
}

function calculateDurationMinutes(
  departureUtc?: string,
  arrivalUtc?: string
): number | undefined {
  if (!departureUtc || !arrivalUtc) {
    return undefined;
  }

  const departure = Date.parse(departureUtc);
  const arrival = Date.parse(arrivalUtc);

  if (Number.isNaN(departure) || Number.isNaN(arrival) || arrival <= departure) {
    return undefined;
  }

  return Math.round((arrival - departure) / 60000);
}

function chooseFlight(
  flights: AeroDataBoxFlight[],
  requestedFlightNumber: string
): AeroDataBoxFlight | undefined {
  const exact = flights.find(
    (flight) => normalizeFlightNumber(flight.number ?? "") === requestedFlightNumber
  );

  return exact ?? flights[0];
}

export class AeroDataBoxFlightProvider implements FlightDataProvider {
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ apiKey, fetchImpl = fetch }: AeroDataBoxFlightProviderOptions) {
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
  }

  async lookupFlight(input: FlightLookupInput): Promise<FlightLookupResult> {
    const flightNumber = normalizeFlightNumber(input.flightNumber);

    if (!isValidFlightNumber(flightNumber)) {
      return { ok: false, reason: "invalid_flight_number" };
    }

    const date = input.date ?? todayUtc();

    if (!isValidDate(date)) {
      return { ok: false, reason: "invalid_flight_number" };
    }

    const url = new URL(
      `/flights/number/${encodeURIComponent(flightNumber)}/${encodeURIComponent(date)}`,
      RAPID_API_BASE_URL
    );

    url.searchParams.set("withAircraftImage", "false");
    url.searchParams.set("withLocation", "false");

    let response: Response;

    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-RapidAPI-Key": this.apiKey,
          "X-RapidAPI-Host": RAPID_API_HOST
        }
      });
    } catch {
      return { ok: false, reason: "provider_unavailable" };
    }

    if (response.status === 404) {
      return { ok: false, reason: "not_found" };
    }

    if (response.status === 429) {
      return { ok: false, reason: "rate_limited" };
    }

    if (!response.ok) {
      return { ok: false, reason: "provider_unavailable" };
    }

    let payload: unknown;

    try {
      payload = await response.json();
      console.log("========== AERODATABOX RESPONSE ==========");
      console.log(JSON.stringify(payload, null, 2));
      console.log("==========================================");
    } catch {
      return { ok: false, reason: "provider_unavailable" };
    }

    if (!Array.isArray(payload) || payload.length === 0) {
      return { ok: false, reason: "not_found" };
    }

    const flight = chooseFlight(payload as AeroDataBoxFlight[], flightNumber);
    const departureAirport = preferredAirportName(flight?.departure);
    const arrivalAirport = preferredAirportName(flight?.arrival);

    if (!flight || !departureAirport || !arrivalAirport) {
      return { ok: false, reason: "not_found" };
    }

    const scheduledDepartureUtc = normalizeAeroDataBoxUtc(
      flight.departure?.scheduledTime?.utc
    );
    const scheduledArrivalUtc = normalizeAeroDataBoxUtc(
      flight.arrival?.scheduledTime?.utc
    );

    return {
      ok: true,
      data: normalizeExternalFlightResponse(
        {
          flightNumber: flight.number ?? flightNumber,
          airlineCode:
            flight.airline?.iata ?? flightNumber.match(/^[A-Z0-9]{2,3}/)?.[0],
          airlineName: flight.airline?.name,
          departureAirport,
          departureAirportCode: flight.departure?.airport?.iata,
          arrivalAirport,
          arrivalAirportCode: flight.arrival?.airport?.iata,
          scheduledDepartureUtc,
          scheduledArrivalUtc,
          estimatedDepartureUtc: preferredEstimate(flight.departure),
          estimatedArrivalUtc: preferredEstimate(flight.arrival),
          status: mapStatus(flight.status),
          durationMinutes: calculateDurationMinutes(
            scheduledDepartureUtc,
            scheduledArrivalUtc
          )
        },
        "aerodatabox"
      )
    };
  }
}
