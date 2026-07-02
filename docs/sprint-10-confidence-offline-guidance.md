# Sprint 10 — Confidence & Offline Guidance Architecture

## Purpose

Next Seat should guide the passenger calmly using the best available information.

The app must not pretend to know exact live aircraft state when it only has estimates.

The UI should receive calm, user-safe guidance from snapshots.

---

## Data Flow

```txt
Flight Data / Route Pattern Data
  ↓
Flight Core
  ↓
Guidance Engine
  ↓
Interpreter
  ↓
Snapshot Builder
  ↓
FlightSnapshot / FlightDetailsSnapshot
  ↓
UI
```

Screens must consume snapshots only.

---

## Guidance Contract

The guidance engine exposes:

```ts
FlightGuidanceState
```

It includes:

- confidenceLevel
- predictionMode
- phaseSource
- lastLiveUpdateAt
- offlineReadiness
- isOfflinePrediction
- shouldAskForConfirmation
- confirmationPrompt
- userFacingLabel
- userFacingMessage

The UI must never show raw confidence copy such as `low confidence`.

It may show:

- userFacingLabel
- userFacingMessage
- confirmationPrompt

---

## Prediction Modes

```txt
live
readyOffline
offlineEstimated
userAdjusted
```

---

## Phase Sources

```txt
liveData
routeStatistics
timeEstimate
userConfirmed
```

---

## Offline Readiness

```txt
ready
partial
notReady
```

`ready` means enough flight information has been saved to continue guidance offline.

`partial` means the app can still guide calmly, but with less supporting context.

`notReady` means the app should avoid strong prediction language.

---

## Confidence Rules

### High

Use when:

- recent live data exists
- saved flight pack is ready
- timing aligns with expected route pattern

Passenger-facing tone:

> This guidance is based on the latest available flight information.

---

### Medium

Use when:

- app is offline
- schedule and duration are available
- estimate is still within normal timing range

Passenger-facing tone:

> You may be offline now, so this is based on the saved schedule and typical flight timing.

---

### Low

Use internally when:

- no recent live update exists
- timing is significantly different from expected
- arrival/departure estimate is unclear

Passenger-facing tone stays calm:

> The app may ask a quick question to keep guidance aligned with what you are noticing.

---

## Offline Flow

```txt
Live Guidance
  ↓
Ready To Fly Offline
  ↓
Offline Estimated Guidance
  ↓
Needs Confirmation only if confidence drops
```

---

## User Confirmation

Only ask when:

```txt
shouldAskForConfirmation = true
```

Prompt:

```txt
Does this still feel accurate?
```

Options:

- Yes
- Not sure
- Something changed

Architectural behavior:

- Yes: keep estimate
- Not sure: keep estimate, soften copy
- Something changed: switch to userAdjusted / userConfirmed guidance later

No manual phase picker in the main UI.

---

## Flight Details Snapshot

The More / Flight Details area should use:

```ts
FlightDetailsSnapshot
```

It supports:

- current flight
- route details
- route pattern summary
- offline guidance state

Recent flights are reassurance context, not an analytics dashboard.

The UI should summarize patterns calmly.

---

## Route Pattern Summary

`RoutePatternSummary` supports:

- sampleSize
- completedNormallyCount
- averageDepartureDelayMinutes
- averageArrivalDelayMinutes
- averageDurationMinutes
- typicalDescentWindowMinutesBeforeArrival
- dataFreshness
- summaryMessage
- reassuranceMessage

Use it to say things like:

> Recent flights on this route usually followed a normal timing pattern. Small differences are expected.

Do not turn this into minute-by-minute comparison.

---

## MVP Scope

Include:

- confidenceLevel
- predictionMode
- phaseSource
- lastLiveUpdateAt
- offlineReadiness
- basic phase estimation
- user confirmation trigger
- FlightDetailsSnapshot
- RoutePatternSummary

Postpone:

- turbulence prediction
- weather overlays
- ADS-B style tracking
- waypoint tracking
- exact live aircraft phase detection
- technical aviation dashboard
- manual phase editor
- games

---

## Final Rule

The snapshot tells the UI what to say.

The UI never decides what the flight means.
