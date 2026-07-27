import { AeroDataBoxFlightProvider } from "./providers/AeroDataBoxFlightProvider";
import {
  FlightDataProvider,
  FlightLookupInput,
  FlightLookupResult
} from "./types";

declare const process: {
  env: Record<string, string | undefined>;
};

function createDefaultProvider(): FlightDataProvider | null {
  const rapidApiKey = process.env.RAPIDAPI_KEY?.trim();

  if (!rapidApiKey) {
    return null;
  }

  return new AeroDataBoxFlightProvider({ apiKey: rapidApiKey });
}

/**
 * Server-side flight lookup entry point.
 * The frontend never receives or handles the external provider secret.
 */
export async function lookupFlight(
  input: FlightLookupInput,
  provider: FlightDataProvider | null = createDefaultProvider()
): Promise<FlightLookupResult> {
  if (!provider) {
    return {
      ok: false,
      reason: "provider_not_configured"
    };
  }

  try {
    return await provider.lookupFlight(input);
  } catch {
    return {
      ok: false,
      reason: "provider_unavailable"
    };
  }
}
