import { FlightStatus } from "@/features/flightCore/getFlightStatus";
import { JourneyPhase } from "@/types/journey";

export function resolveJourneyPhase(status: FlightStatus): JourneyPhase {
  switch (status) {
    case "before_departure":
      return {
        id: "departure",
        label: "Departure preparation",
        description: "The journey has not started yet, but the flight view is prepared.",
        expectedProgressRange: { startPercent: 0, endPercent: 5 },
        intensity: "medium",
        passengerMeaning: "Use this moment to get oriented before the flight begins.",
        typicalSensations: []
      };
    case "early_flight":
      return {
        id: "climb",
        label: "Early flight",
        description: "The aircraft is in the more active first part of the journey.",
        expectedProgressRange: { startPercent: 0, endPercent: 20 },
        intensity: "high",
        passengerMeaning: "More movement and changes in sound can be normal here.",
        typicalSensations: ["stronger engine sound", "turns", "changing angle"]
      };
    case "cruise":
      return {
        id: "cruise",
        label: "Cruise",
        description: "The aircraft is in the stable middle part of the route.",
        expectedProgressRange: { startPercent: 20, endPercent: 70 },
        intensity: "low",
        passengerMeaning: "This is usually the calmest and steadiest part of the flight.",
        typicalSensations: ["small sound changes", "minor course adjustments"]
      };
    case "late_flight":
      return {
        id: "descent",
        label: "Later flight",
        description: "The journey is moving toward arrival preparation.",
        expectedProgressRange: { startPercent: 70, endPercent: 90 },
        intensity: "medium",
        passengerMeaning: "The next noticeable changes may be linked to preparing for arrival.",
        typicalSensations: ["gradual turns", "engine sound changes"]
      };
    case "arrival_window":
      return {
        id: "approach",
        label: "Arrival window",
        description: "The flight is in the final part of the journey.",
        expectedProgressRange: { startPercent: 90, endPercent: 100 },
        intensity: "medium",
        passengerMeaning: "This part can feel busier while the aircraft lines up to arrive.",
        typicalSensations: ["turns", "speed changes", "landing preparation"]
      };
    case "completed":
    default:
      return {
        id: "arrival",
        label: "Arrival",
        description: "The scheduled journey has reached its destination window.",
        expectedProgressRange: { startPercent: 100, endPercent: 100 },
        intensity: "low",
        passengerMeaning: "The planned flight flow is complete.",
        typicalSensations: []
      };
  }
}
