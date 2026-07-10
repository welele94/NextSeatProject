# Next Seat — Online Flight Lookup Architecture

## Purpose

Online Flight Lookup prepares a flight for calm offline guidance.

It is not live tracking.

The user should think:

> The app found my flight and prepared calm explanations for me.

Not:

> I am following the aircraft.

---

## Architecture Decision

```txt
Add Flight UI
  ↓
requestFlightLookup
  ↓
GET /api/flights/lookup
  ↓
FlightDataProvider
  ↓
Provider-specific mapper
  ↓
normalizeExternalFlightResponse
  ↓
ExternalFlightSeed
  ↓
User confirmation
  ↓
PreparedFlightDraft / local storage adapter
  ↓
FlightSnapshot / FlightDetailsSnapshot
```

### Provider location

```txt
src/features/flightLookup/providers/
```

The provider implements `FlightDataProvider`.

The current provider is:

```txt
MockFlightDataProvider
```

AirLabs should be added as a separate adapter after an API key and the official response schema are available.

### Endpoint location

```txt
api/flights/lookup.ts
```

The endpoint is server-side/serverless. The mobile app calls only this endpoint.

### API key location

Provider keys must be stored only in server environment variables.

Example future variable:

```txt
AIRLABS_API_KEY
```

Never use an `EXPO_PUBLIC_` variable for provider secrets.

### Normalization location

```txt
src/features/flightLookup/normalizeExternalFlightResponse.ts
```

Every provider must map its response into the allowed intermediate fields before normalization.

The normalized contract intentionally excludes:

- altitude
- speed
- heading
- coordinates
- live map data
- weather
- turbulence
- raw ADS-B data

### Snapshot boundary

The Add Flight UI may temporarily consume `FlightLookupResult` to show a confirmation step.

After confirmation, the normalized seed must be persisted as a prepared local flight draft and converted by an application adapter into the local flight model used by snapshot builders.

Flight Mode screens continue to consume snapshots only.

### Offline storage boundary

The lookup provider does not write local storage.

The flow is:

```txt
lookup → confirm → createPreparedFlightDraft → local storage adapter
```

This keeps networking, user confirmation, persistence, and snapshot creation separate.

---

## Contracts

Implemented in:

```txt
src/features/flightLookup/types.ts
```

- `FlightLookupInput`
- `ExternalFlightSeed`
- `FlightLookupFailureReason`
- `FlightLookupResult`
- `FlightDataProvider`

Offline preparation is defined in:

```txt
src/features/flightLookup/offlineTypes.ts
```

---

## Endpoint

```http
GET /api/flights/lookup?flightNumber=TP1025&date=2026-07-10
```

Current mock success flight:

```txt
TP1025
```

Success:

```json
{
  "ok": true,
  "data": {
    "flightNumber": "TP1025",
    "airlineCode": "TP",
    "airlineName": "TAP Air Portugal",
    "departureAirport": "Lisbon",
    "departureAirportCode": "LIS",
    "arrivalAirport": "Porto",
    "arrivalAirportCode": "OPO",
    "scheduledDepartureUtc": "2026-07-10T13:30:00.000Z",
    "scheduledArrivalUtc": "2026-07-10T14:35:00.000Z",
    "status": "scheduled",
    "durationMinutes": 65,
    "provider": "mock",
    "fetchedAt": "<ISO timestamp>"
  }
}
```

Controlled failures:

```txt
not_found
provider_unavailable
invalid_flight_number
rate_limited
unknown
```

No raw provider errors should reach the UI.

---

## Micael Handoff

### Endpoint to call

```txt
GET /api/flights/lookup
```

Parameters:

```txt
flightNumber: required
date: optional, YYYY-MM-DD
```

Use:

```txt
requestFlightLookup(input, backendBaseUrl)
```

### UI states

#### Loading

Calm neutral state while checking.

#### Found

Show only:

- flight number
- airline
- departure airport
- arrival airport
- scheduled times
- estimated times when available
- simple status

Ask the user to confirm before saving.

#### Not found

> We couldn’t find this flight right now. You can still prepare your journey manually.

#### Provider unavailable

> We couldn’t check this flight right now. You can still add the flight manually and Next Seat will prepare offline guidance.

#### Partial data

> Some flight details are limited, but Next Seat can still prepare calm guidance for this journey.

### Data to save offline

After confirmation, save `PreparedFlightDraft` containing:

- the complete normalized `ExternalFlightSeed`
- confirmation time
- offline readiness
- missing field list

Do not save raw provider responses.

### Optional fields

The UI must tolerate missing:

- airlineCode
- airlineName
- airport codes
- scheduled times
- estimated times
- status
- durationMinutes

### Current mocks

`MockFlightDataProvider` supports `TP1025`.

No AirLabs API key is configured yet.

---

## AirLabs Next Step

Before enabling AirLabs:

1. obtain an API key
2. confirm the current official endpoint and field schema
3. add `AirLabsFlightProvider`
4. map only approved fields
5. store the key in the serverless environment
6. select the provider server-side

The frontend contract must not change when this happens.

---

## Out of Scope

- live map
- altitude and speed
- weather
- turbulence prediction
- ADS-B
- detailed tracking
- notifications
- advanced recent-flight comparison
