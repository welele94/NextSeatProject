export type FlightLookupInput = {
  flightNumber: string;
  date?: string;
};

export type ExternalFlightStatus =
  | "scheduled"
  | "boarding"
  | "en_route"
  | "landed"
  | "delayed"
  | "cancelled"
  | "unknown";

export type FlightLookupProviderId =
  | "airlabs"
  | "aviationstack"
  | "aerodatabox"
  | "mock";

export type ExternalFlightSeed = {
  flightNumber: string;
  airlineCode?: string;
  airlineName?: string;
  departureAirport: string;
  departureAirportCode?: string;
  arrivalAirport: string;
  arrivalAirportCode?: string;
  scheduledDepartureUtc?: string;
  scheduledArrivalUtc?: string;
  estimatedDepartureUtc?: string;
  estimatedArrivalUtc?: string;
  status?: ExternalFlightStatus;
  durationMinutes?: number;
  provider: FlightLookupProviderId;
  fetchedAt: string;
};

export type FlightLookupFailureReason =
  | "not_found"
  | "provider_unavailable"
  | "invalid_flight_number"
  | "rate_limited"
  | "unknown";

export type FlightLookupResult =
  | {
      ok: true;
      data: ExternalFlightSeed;
    }
  | {
      ok: false;
      reason: FlightLookupFailureReason;
    };

export interface FlightDataProvider {
  lookupFlight(input: FlightLookupInput): Promise<FlightLookupResult>;
}
