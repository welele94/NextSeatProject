import { MockFlightDataProvider } from "./providers/MockFlightDataProvider";
import {
  FlightDataProvider,
  FlightLookupInput,
  FlightLookupResult
} from "./types";

const defaultProvider: FlightDataProvider = new MockFlightDataProvider();

/**
 * Server-side flight lookup entry point.
 * Replace the injected provider with AirLabs or another provider without
 * changing endpoint or frontend contracts.
 */
export async function lookupFlight(
  input: FlightLookupInput,
  provider: FlightDataProvider = defaultProvider
): Promise<FlightLookupResult> {
  try {
    return await provider.lookupFlight(input);
  } catch {
    return {
      ok: false,
      reason: "provider_unavailable"
    };
  }
}
