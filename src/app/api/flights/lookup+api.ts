import { lookupFlight } from "@/features/flightLookup/lookupFlight";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const flightNumber = url.searchParams.get("flightNumber")?.trim();
  const date = url.searchParams.get("date")?.trim() || undefined;

  if (!flightNumber) {
    return Response.json(
      { ok: false, reason: "invalid_flight_number" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await lookupFlight({ flightNumber, date });

  const status = result.ok
    ? 200
    : result.reason === "invalid_flight_number"
      ? 400
      : result.reason === "not_found"
        ? 404
        : result.reason === "rate_limited"
          ? 429
          : 503;

  return Response.json(result, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}
