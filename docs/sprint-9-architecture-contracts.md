# Next Seat — Sprint 9 Architecture Contracts

## Purpose

This document freezes the core contracts before screen implementation.

The UI should never need to understand aviation.

The UI consumes `FlightSnapshot` only.

Core principle:

```txt
Flight Core → objective state
Interpreter → passenger meaning
Snapshot Builder → UI-ready experience state
UI → presentation only
```

---

## 1. Core Models

### FlightSnapshot

Single source of truth for Flight Mode presentation.

The snapshot answers:

> What should the UI display right now?

Required fields:

- `phase` — current passenger-facing journey phase
- `progress` — schedule-based progress information
- `journey` — route and journey labels for UI
- `status` — objective internal status
- `situation` — interpreted passenger situation
- `rhythm` — emotional pacing state
- `environment` — future-ready context placeholder
- `reassurance` — current reassurance message
- `expectedMoment` — what usually happens next
- `currentCheckpoint` / `nextCheckpoint` — optional route context

The UI may render fields from `FlightSnapshot`.

The UI must not derive them.

---

### JourneyPhase

Represents the passenger-facing phase of the journey.

Current IDs:

```txt
departure
climb
cruise
descent
approach
arrival
```

Each phase includes:

- `id`
- `label`
- `description`
- `expectedProgressRange`
- `intensity`
- `passengerMeaning`
- `typicalSensations`

These are not pilot-grade aviation phases.

They are passenger-oriented journey phases.

---

### ExpectedMoment

Represents:

> What usually happens next?

Fields:

- `title`
- `body`
- `description`
- `confidence`
- `context`
- `timingEstimate`

Confidence is intentionally coarse:

```txt
low
medium
high
```

This avoids false precision.

Context explains why the expected moment exists:

```txt
schedule_based
route_pattern
phase_progression
delay_or_wait
general_guidance
```

---

### LearnArticle

Content contract for optional educational material.

Fields:

- `id`
- `category`
- `title`
- `explanation`
- `reassurance`
- `relatedArticleIds`

Learn articles are optional context.

They should not interrupt Flight Mode.

---

### RhythmState

Final MVP states:

```txt
calm_cruise
active_transition
arrival_guidance
extended_wait
```

Rhythm does not explain the flight.

Rhythm defines how the experience should feel.

---

## 2. System Boundaries

### Flight Core

Owns:

- objective flight state
- route progress
- timing calculations
- checkpoints
- raw status

Must not:

- generate reassurance copy
- know about UI components
- choose visual hierarchy

---

### Interpreter

Owns:

- passenger meaning
- reassurance selection
- situation interpretation
- next expected moment copy

Must not:

- know about UI components
- perform layout decisions
- depend on React Native

---

### Rhythm Engine

Owns:

- emotional pacing state
- experience rhythm classification

Must not:

- render UI
- create copy
- perform aviation calculations

---

### Snapshot Builder

Owns:

- assembling UI-ready state
- combining flight core, interpreter, rhythm, journey, and environment context

The Snapshot Builder is the only layer exposed to screens.

---

### UI

Consumes:

```ts
FlightSnapshot
```

The UI may:

- choose layout
- apply visual styles
- map rhythm to presentation
- render snapshot fields

The UI must not:

- read raw flight data directly for aviation meaning
- calculate phases
- calculate situations
- generate reassurance logic
- derive expected moments

---

## 3. Data Flow

```txt
Flight Data
  ↓
Flight Core
  ↓
Interpreter
  ↓
Rhythm Engine
  ↓
Snapshot Builder
  ↓
UI
```

More explicit:

```txt
Flight
  ↓
calculateFlightProgress / getFlightStatus / checkpoints
  ↓
resolveSituation / getSituationMessage / getNextExpectedMoment
  ↓
resolveRhythmState
  ↓
buildFlightSnapshot
  ↓
Flight Mode UI
```

---

## 4. Future Readiness

The snapshot already includes:

```ts
environment: EnvironmentContext
```

This allows future support for:

- turbulence awareness
- weather awareness
- holding pattern awareness
- route deviation awareness

without changing the screen contract.

Future systems should add information into `FlightSnapshot`, not bypass it.

Examples:

```txt
environment.expectedMovement
environment.weatherActivity
situation = holding_pattern_possible
expectedMoment.context = delay_or_wait
```

---

## 5. Implementation Rule

Micael can build screens against `FlightSnapshot`.

Silva can create content against `LearnArticle` and reassurance structures.

Future features must enter through existing boundaries.

No screen should need to be rewritten because a new data source was added.

---

## Final Architecture Statement

Next Seat architecture exists to support one product promise:

> Your flight, explained calmly.

The architecture is not optimized for aviation enthusiasts.

It is optimized for anxious passengers who need orientation, predictability, and calm interpretation.
