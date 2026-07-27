import { AeroDataBoxFlightProvider } from "./providers/AeroDataBoxFlightProvider";
import { MockFlightDataProvider } from "./providers/MockFlightDataProvider";
import {
  FlightDataProvider,
  FlightLookupInput,
  FlightLookupResult
} from "./types";

function createDefaultProvider(): FlightDataProvider {
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (rapidApiKey) {
    return new AeroDataBoxFlightProvider({ apiKey: rapidApiKey });
  }

  return new MockFlightDataProvider();
}

/**
 * Server-side flight lookup entry point.
 * The frontend never receives or handles the external provider secret.
 */
export async function lookupFlight(
  input: FlightLookupInput,
  provider: FlightDataProvider = createDefaultProvider()
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
