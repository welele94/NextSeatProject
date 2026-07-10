import { lookupFlight } from "../../src/features/flightLookup/lookupFlight";
import { FlightLookupResult } from "../../src/features/flightLookup/types";

type ServerlessRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ServerlessResponse = {
  status(code: number): ServerlessResponse;
  json(payload: FlightLookupResult | { ok: false; reason: "unknown" }): void;
  setHeader?(name: string, value: string): void;
};

function singleQueryValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(
  request: ServerlessRequest,
  response: ServerlessResponse
): Promise<void> {
  response.setHeader?.("Cache-Control", "no-store");

  if (request.method && request.method !== "GET") {
    response.status(405).json({ ok: false, reason: "unknown" });
    return;
  }

  const flightNumber = singleQueryValue(request.query?.flightNumber)?.trim();
  const date = singleQueryValue(request.query?.date)?.trim();

  if (!flightNumber) {
    response.status(400).json({
      ok: false,
      reason: "invalid_flight_number"
    });
    return;
  }

  const result = await lookupFlight({
    flightNumber,
    date: date || undefined
  });

  const statusCode = result.ok
    ? 200
    : result.reason === "invalid_flight_number"
      ? 400
      : result.reason === "not_found"
        ? 404
        : result.reason === "rate_limited"
          ? 429
          : 503;

  response.status(statusCode).json(result);
}
