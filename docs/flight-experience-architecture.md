# Next Seat — Flight Experience Architecture Brief

## Philosophy

Next Seat is not a flight tracker.

It is a calm passenger interpretation system designed to reduce uncertainty during air travel.

The experience must feel:

- quiet
- trustworthy
- progressive
- emotionally adaptive
- non-technical
- non-alarming

The app should never behave like:

- a radar system
- a cockpit dashboard
- a telemetry monitor
- an aviation enthusiast tool

Core principle:

> Show only what helps the passenger feel oriented and reassured.

---

## 1. Flight Screen Architecture

The flight screen must follow a strict hierarchy.

The user should immediately understand:

1. where they are
2. what is happening
3. what happens next

Without cognitive overload.

---

## Primary Layer — Always Visible

This is the emotional core.

### A. Current Situation

Main interpretation block.

Examples:

- “The flight is progressing normally”
- “Arrival is getting closer”
- “The route may take a little longer”

Purpose:

- emotional grounding
- calm interpretation
- contextual reassurance

Priority: highest

---

### B. Next Expected Moment

Explains the next meaningful transition.

Examples:

- “Next: Rhine Region”
- “Descent may begin later”
- “Arrival is the next major moment”

Purpose:

- reduce uncertainty
- create predictability
- guide expectation

Priority: highest

---

### C. Progress Awareness

Minimal flight progression visibility.

Examples:

- progress bar
- remaining time
- route completion percentage

Purpose:

- orientation
- pacing
- journey continuity

Priority: high

---

## Secondary Layer — Contextual

Visible but visually softer.

### D. Route Awareness

Examples:

- current checkpoint
- next checkpoint
- route line

Purpose:

- contextual orientation
- geographic continuity

Priority: medium

Important:

This layer must never dominate the emotional layer.

---

### E. Flight Status

Examples:

- cruise
- late flight
- arrival window

Purpose:

- internal contextual labeling
- subtle orientation

Priority: low-medium

This should not feel like aviation telemetry.

---

## Optional Layer — Expandable

Only visible when explicitly expanded.

### F. Additional Context

Examples:

- aircraft type
- route distance
- scheduled times
- checkpoint details

Purpose:

- curiosity
- optional reassurance

Priority: low

Default state: collapsed.

---

## 2. Information Exposure Rules

### Never Show by Default

These create dashboard anxiety.

- precise altitude
- vertical speed
- knots / speed
- technical telemetry
- turbulence metrics
- radar-style aircraft traffic
- aviation jargon

---

### Only Show Expanded

Examples:

- aircraft model
- checkpoint metadata
- route distance
- timing breakdowns

Reason:

Some users want deeper understanding. Most users do not.

---

### Information That Should Fade During Cruise

Cruise should feel quieter.

Reduce:

- card density
- visual emphasis
- explanatory frequency
- movement intensity

The app should feel calmer in stable flight.

---

### Information That Gains Priority Near Arrival

As arrival approaches:

- “next expected moment” becomes stronger
- reassurance becomes more anticipatory
- route awareness becomes more contextual

Examples:

- “You may notice gradual preparation for arrival soon.”
- “Small changes in direction or sound can happen normally here.”

---

## 3. Emotional Rhythm States

These are not technical states.

They are experiential states.

---

### active_transition

Typical moments:

- takeoff
- early climb
- major transitions

Behavior:

- more explanatory
- more guidance
- slightly more active pacing

---

### quiet_progress

Typical moments:

- stable cruise

Behavior:

- quieter UI
- fewer interruptions
- softer hierarchy
- more breathing space

This is critical.

Cruise should emotionally feel calm.

---

### stable_cruise

Typical moments:

- sustained normal route progression

Behavior:

- subtle reassurance
- minimal updates
- continuity-focused language

---

### arrival_guidance

Typical moments:

- late flight
- descent expectation
- arrival window

Behavior:

- slightly more present guidance
- stronger “what happens next”
- anticipatory reassurance

---

### extended_wait

Typical moments:

- slight delays
- holding possibility
- prolonged arrival sequence

Behavior:

- avoid urgency
- avoid warning tone
- reinforce continuity

Examples:

- “The flight may remain in this phase for a little longer.”
- “Extended approach paths can happen normally.”

---

## 4. Globe Guidelines

This section is extremely important.

The globe is:

- emotional orientation
- spatial awareness
- journey visualization

The globe is not:

- a radar simulator
- live air traffic visualization
- aviation telemetry
- tactical navigation

---

### The Globe Should

- show route continuity
- show approximate journey progression
- reinforce “movement toward destination”
- feel calm and cinematic
- support emotional orientation

---

### The Globe Should Not

- simulate real radar systems
- show nearby aircraft
- show dense telemetry
- become visually noisy
- dominate the emotional layer
- create technical obsession

---

## 5. Product Identity

Next Seat should feel like:

> a calm companion that quietly understands the rhythm of a flight.

Not:

- a monitoring system
- a technical dashboard
- a fear simulator

The experience should progressively adapt itself to the emotional rhythm of the journey.

That rhythm is the product.
