import {
  FlightLookupInput,
  FlightLookupResult
} from "./types";

export async function requestFlightLookup(
  input: FlightLookupInput,
  endpointBaseUrl = ""
): Promise<FlightLookupResult> {
  const params = new URLSearchParams({
    flightNumber: input.flightNumber
  });

  if (input.date) {
    params.set("date", input.date);
  }

  try {
    const response = await fetch(
      `${endpointBaseUrl}/api/flights/lookup?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      }
    );

    const payload = (await response.json()) as FlightLookupResult;

    if (typeof payload !== "object" || payload === null || !("ok" in payload)) {
      return { ok: false, reason: "unknown" };
    }

    return payload;
  } catch {
    return {
      ok: false,
      reason: "provider_unavailable"
    };
  }
}
