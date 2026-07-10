import { ExternalFlightSeed } from "./types";

export type PreparedFlightDraft = {
  id: string;
  source: ExternalFlightSeed;
  confirmedAt: string;
  offlineReady: boolean;
  missingFields: Array<
    | "scheduledDepartureUtc"
    | "scheduledArrivalUtc"
    | "durationMinutes"
    | "departureAirportCode"
    | "arrivalAirportCode"
  >;
};

/**
 * Storage is intentionally outside the lookup provider.
 * The Add Flight flow confirms the normalized seed first, then persists this
 * draft through the app's local storage adapter.
 */
export function createPreparedFlightDraft(
  seed: ExternalFlightSeed,
  confirmedAt = new Date().toISOString()
): PreparedFlightDraft {
  const missingFields: PreparedFlightDraft["missingFields"] = [];

  if (!seed.scheduledDepartureUtc) {
    missingFields.push("scheduledDepartureUtc");
  }

  if (!seed.scheduledArrivalUtc) {
    missingFields.push("scheduledArrivalUtc");
  }

  if (!seed.durationMinutes) {
    missingFields.push("durationMinutes");
  }

  if (!seed.departureAirportCode) {
    missingFields.push("departureAirportCode");
  }

  if (!seed.arrivalAirportCode) {
    missingFields.push("arrivalAirportCode");
  }

  return {
    id: `${seed.flightNumber}-${seed.scheduledDepartureUtc ?? confirmedAt}`,
    source: seed,
    confirmedAt,
    offlineReady:
      Boolean(seed.scheduledDepartureUtc) &&
      Boolean(seed.scheduledArrivalUtc) &&
      Boolean(seed.durationMinutes),
    missingFields
  };
}
