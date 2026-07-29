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
  | "diverted"
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
  departureCity?: string;
  departureTimeZone?: string;

  arrivalAirport: string;
  arrivalAirportCode?: string;
  arrivalCity?: string;
  arrivalTimeZone?: string;

  scheduledDepartureUtc?: string;
  scheduledDepartureLocal?: string;
  scheduledArrivalUtc?: string;
  scheduledArrivalLocal?: string;

  estimatedDepartureUtc?: string;
  estimatedDepartureLocal?: string;
  estimatedArrivalUtc?: string;
  estimatedArrivalLocal?: string;

  departureTerminal?: string;
  departureGate?: string;
  baggageBelt?: string;
  aircraftModel?: string;

  status?: ExternalFlightStatus;
  durationMinutes?: number;

  // Internal guidance signals only. Do not show these as flight-tracker data in the UI.
  liveAltitudeFeet?: number;
  liveVerticalSpeedFeetPerMinute?: number;
  livePositionReportedAtUtc?: string;

  provider: FlightLookupProviderId;
  fetchedAt: string;
};

export type FlightLookupFailureReason =
  | "not_found"
  | "provider_unavailable"
  | "provider_not_configured"
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
