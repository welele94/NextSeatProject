import { normalizeExternalFlightResponse } from "../normalizeExternalFlightResponse";
import {
  FlightDataProvider,
  FlightLookupInput,
  FlightLookupResult
} from "../types";

const mockFlights = {
  TP1025: {
    flightNumber: "TP1025",
    airlineCode: "TP",
    airlineName: "TAP Air Portugal",
    departureAirport: "Lisbon",
    departureAirportCode: "LIS",
    arrivalAirport: "Porto",
    arrivalAirportCode: "OPO",
    scheduledDepartureUtc: "2026-07-10T13:30:00Z",
    scheduledArrivalUtc: "2026-07-10T14:35:00Z",
    status: "scheduled",
    durationMinutes: 65
  }
} as const;

function normalizeFlightNumber(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function isValidFlightNumber(value: string): boolean {
  return /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/.test(value);
}

export class MockFlightDataProvider implements FlightDataProvider {
  async lookupFlight(input: FlightLookupInput): Promise<FlightLookupResult> {
    const flightNumber = normalizeFlightNumber(input.flightNumber);

    if (!isValidFlightNumber(flightNumber)) {
      return {
        ok: false,
        reason: "invalid_flight_number"
      };
    }

    const record = mockFlights[flightNumber as keyof typeof mockFlights];

    if (!record) {
      return {
        ok: false,
        reason: "not_found"
      };
    }

    return {
      ok: true,
      data: normalizeExternalFlightResponse(record, "mock")
    };
  }
}
