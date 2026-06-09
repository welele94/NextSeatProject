# Sprint 7 — Navigation Proposal

## Goal

Close the core app experience before adding new systems.

This sprint should make Next Seat feel like a complete MVP structure rather than a single experimental flight screen.

The product must remain aligned with:

- offline-first
- calm interpretation
- snapshot as single source of truth
- rhythm-aware experience
- progressive disclosure

---

## 1. MVP Navigation Decision

Use a simple stack-first navigation model.

Do not introduce tabs yet.

Reason:

- The MVP is journey-focused, not section-browsing-focused.
- The user primarily enters a flight, follows it, and returns.
- Tabs can make the app feel like a generic dashboard too early.
- Stack navigation keeps the emotional flow focused.

Recommended MVP flow:

```txt
Flight List
  ↓
Flight Detail / Flight Mode
  ↓
Back
```

Secondary sections should be accessible from simple entry points, not persistent tabs.

---

## 2. MVP Sections

### Flight Mode

Primary experience.

Purpose:

- explain where the user is
- explain what is happening
- explain what comes next
- adapt the interface to rhythm

Routes:

```txt
/
/flight/[id]
```

For now, `/` acts as the flight list / flight selection entry.

---

### Learn More

Secondary educational section.

Purpose:

- answer common fears
- explain normal sensations
- offer optional deeper context

Must not interrupt Flight Mode.

Future route:

```txt
/learn
/learn/[topic]
```

Default exposure:

- not visible inside the primary flight flow unless the user asks for more context
- can be linked from expandable cards later

---

### Settings

Utility section.

Purpose:

- preferences
- language
- offline data management
- accessibility choices

Future route:

```txt
/settings
```

Default exposure:

- low priority
- not part of the emotional flight flow

---

## 3. Why No Tabs Yet

Tabs are useful when the user frequently switches between equal-priority sections.

Next Seat does not have equal-priority sections yet.

Current priority order:

1. Flight Mode
2. Learn More
3. Settings

Tabs would visually imply all sections are equally important.

That weakens the product identity.

Decision:

```txt
MVP = Stack navigation
Future = possible tabs only after Learn More and Settings become substantial
```

---

## 4. Flight Screen Structure

The Flight Detail screen should remain the emotional center of the app.

Hierarchy:

```txt
Navigation Header
Current Situation
Globe / Route Awareness
Next Expected Moment
Journey Progress
Optional Details
```

Primary:

- current situation
- next expected moment
- rhythm-aware presentation

Secondary:

- progress
- route awareness
- remaining time

Optional:

- aircraft type
- route distance
- schedule details
- environment context

---

## 5. Snapshot Rule

`FlightSnapshot` remains the single source of truth for Flight Mode.

The screen must not manually derive:

- status
- situation
- rhythm
- next expected moment
- environment context

Correct pattern:

```ts
const snapshot = buildFlightSnapshot(flight, currentTime);
```

UI may adapt presentation from snapshot values, but should not interpret flight state itself.

Allowed in UI:

- layout choices
- visual styling
- rhythm presentation mapping

Not allowed in UI:

- deriving situations
- deriving rhythm
- deriving passenger meaning
- deriving next expected moment

---

## 6. Proposed Folder Structure

Recommended structure for the next stable MVP:

```txt
src/
  app/
    index.tsx
    flight/
      [id].tsx
    learn/
      index.tsx
      [topic].tsx
    settings/
      index.tsx

  components/
    AmbientGlobe.tsx
    NextExpectedMomentCard.tsx
    SituationInsightCard.tsx
    FlightOverviewCard.tsx
    FlightProgressCard.tsx

  features/
    flightCore/
      calculateFlightProgress.ts
      estimateRemainingTime.ts
      getCurrentCheckpoint.ts
      getNextCheckpoint.ts
      getFlightStatus.ts

    flightSnapshot/
      buildFlightSnapshot.ts

    interpreter/
      expectedMoments/
      situations/

    rhythm/
      resolveRhythmState.ts
      types.ts

    time/
      createRelativeTimestamp.ts
      formatMinutes.ts
      getCurrentTimestamp.ts

  types/
    environment.ts
    flight.ts
    nextExpectedMoment.ts
    route.ts
```

Notes:

- `flightCore` remains objective.
- `interpreter` remains passenger meaning.
- `rhythm` remains experience pacing.
- `flightSnapshot` aggregates the experience state.
- `app/` owns routing only.

---

## 7. Technical Backlog

### Linting

Add ESLint.

Goal:

- catch unused imports
- catch accidental legacy code
- enforce consistent TypeScript style

Suggested command:

```txt
npm run lint
```

---

### Formatting

Add Prettier.

Goal:

- reduce noisy diffs
- keep code style consistent

Suggested command:

```txt
npm run format
```

---

### Typecheck

Keep and enforce:

```txt
npm run typecheck
```

This should be required before merging.

---

### Tests

Add lightweight unit tests for pure logic first.

Priority test targets:

- `calculateFlightProgress`
- `getFlightStatus`
- `resolveSituation`
- `resolveRhythmState`
- `buildFlightSnapshot`

Do not start with UI tests.

The core value is in the interpretation engine.

---

### CI

Add GitHub Actions for:

```txt
npm install
npm run typecheck
npm run lint
npm test
```

Do not overbuild CI yet.

---

## 8. Sprint 7 Delivery Criteria

Sprint 7 is complete when:

- navigation has a clear MVP structure
- Flight List → Flight Detail → Back works
- Flight Mode, Learn More, and Settings have clear boundaries
- snapshot remains the only source of truth for flight experience state
- rhythm remains separate from UI logic
- technical backlog is documented

---

## Final Decision

For the MVP, Next Seat should use:

```txt
Stack navigation
```

Not tabs.

The user journey should stay focused:

```txt
Choose flight → understand flight → return
```

The app should feel guided, calm, and intentional — not like a multi-section dashboard.
