# Next Seat ✈️

**Next Seat** is an offline-first flight companion designed for people with fear of flying.

Instead of overwhelming users with technical data, the app translates flight information into calm, human explanations — helping users understand what is happening during the flight and what to expect next.

---

## 🧠 Core Idea

> *“Your flight, explained calmly.”*

Most people don’t fear the flight itself — they fear the unknown.

Next Seat reduces that uncertainty by:

* Showing where the aircraft is in its journey
* Explaining what is happening right now
* Predicting what will happen next
* Reassuring the user in a simple, human way

---

## 🚀 Key Features (MVP)

* 📍 **Flight Overview**

  * Origin → destination
  * Aircraft type
  * Estimated duration

* ⏱️ **Progress Tracking (Offline)**

  * Flight progress based on schedule
  * Elapsed and remaining time
  * Works without internet connection

* 🧭 **Route Awareness**

  * Route points and checkpoints
  * Current and next checkpoint

* 🧘 **Reassurance Layer**

  * Context-aware calm explanations
  * Human, non-technical language
  * No medical or alarmist tone

---

## 🏗️ Tech Stack

* **React Native (Expo)**
* **TypeScript**
* **Expo Router**
* Offline-first architecture (no backend required for MVP)

---

## 🧩 Architecture Overview

The app is built around a simple but scalable domain model:

```txt
Flight → Progress → Checkpoints → Context → Explanation
```

### Core Layers

* **Flight Core**

  * Calculates progress based on schedule
  * Determines current and next checkpoint
  * Estimates remaining time

* **Reassurance Layer**

  * Translates flight state into calm explanations

* **UI Layer**

  * Presents information in a clean, minimal way
  * Focuses on clarity and emotional reassurance

---

## 📂 Project Structure

```txt
src/
  app/
    index.tsx
    flight/[id].tsx

  components/
    FlightOverviewCard.tsx
    FlightProgressCard.tsx
    RouteCheckpointList.tsx
    ReassuranceCard.tsx
    ProgressBar.tsx

  features/
    flightCore/
    reassurance/

  data/
    mockFlights.ts
    reassuranceMessages.ts

  types/
    flight.ts
    route.ts
```

---

## 🛠️ Roadmap

The full roadmap is available here:

👉 `/docs/roadmap.md`

### Current Focus

* Build a solid **offline-first flight engine**
* Improve **context-aware explanations**
* Add **estimated aircraft position**
* Develop the **main flight mode screen**

---

## ⚠️ Design Principles

* **Offline-first by default**
* **Simple > complex**
* **Explain, don’t overwhelm**
* **No false precision**
* **Human tone over technical language**

---

## 🔮 Future Direction

* Real flight data integration (APIs)
* Map / globe visualization
* Situation detection (e.g. holding patterns, delays)
* Personalized reassurance
* Optional AI companion layer

---

## 🧑‍💻 Getting Started

```bash
npm install
npm run start
```

---

## 💡 Vision

Next Seat is not just a flight tracker.

It’s a calm companion that sits next to you and says:

> *“This is normal. You’re okay. Here’s what’s happening.”*
