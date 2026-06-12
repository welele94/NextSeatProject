import { Flight } from "@/types/flight";

import { buildFlightSnapshot } from "./buildFlightSnapshot";
import { FlightSnapshot } from "./types";

/**
 * Public snapshot entry point for screens/hooks.
 * Screens should consume this contract rather than importing flightCore,
 * interpreter, or rhythm internals.
 */
export function getFlightSnapshot(
  flight: Flight,
  currentTime: Date
): FlightSnapshot {
  return buildFlightSnapshot(flight, currentTime);
}
