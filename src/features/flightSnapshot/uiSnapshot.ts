import type { FlightSnapshot } from "./types";
import type { NextExpectedMoment } from "@/types/nextExpectedMoment";

export type ConfidenceLevel = "high" | "medium" | "low";
export type PredictionMode = "live" | "offline-estimated" | "user-adjusted";

export type PhaseTheme = {
  pageBackground: string;
  accent: string;
  accentSoft: string;
  accentSurface: string;
  accentBorder: string;
  successAccent: string;
};

export type RoutePatternSummary = {
  title: string;
  body: string;
  scheduledDurationLabel?: string;
  updatedDurationLabel?: string;
  reassurance: string;
};

export type AirportInfo = {
  primary: string;
  disclaimer: string;
};

export type CurrentMomentSummary = {
  label: string;
  title: string;
  body: string;
};

export type OfflineGuidanceStatus = {
  isReady: boolean;
  items: Array<{ label: string; isReady: boolean }>;
};

export type FlightDetailsSnapshot = {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
  phaseSource: "schedule" | "live" | "user-confirmed";
  lastLiveUpdateAt?: string;
  offlineGuidanceStatus: OfflineGuidanceStatus;
  shouldAskForConfirmation: boolean;
};

export type FlightUiSnapshot = {
  confidenceLevel: ConfidenceLevel;
  predictionMode: PredictionMode;
  currentPhaseLabel: string;
  routeLabel: string;
  reassuranceMessage: { title: string; body: string };
  nextExpectedMoment: NextExpectedMoment;
  routePatternSummary: RoutePatternSummary;
  airportInfo?: AirportInfo;
  baggageInfo?: AirportInfo;
  currentMomentSummary?: CurrentMomentSummary;
  isAfterFlight: boolean;
  shouldShowEndJourney: boolean;
  offlineGuidanceStatus: OfflineGuidanceStatus;
  shouldAskForConfirmation: boolean;
  guidanceCopy: string;
  phaseTheme: PhaseTheme;
};

const defaultDetails: FlightDetailsSnapshot = {
  confidenceLevel: "high",
  predictionMode: "offline-estimated",
  phaseSource: "schedule",
  lastLiveUpdateAt: "Saved before departure",
  shouldAskForConfirmation: false,
  offlineGuidanceStatus: {
    isReady: true,
    items: [
      { label: "Flight information saved", isReady: true },
      { label: "Takeoff explanation ready", isReady: true },
      { label: "Next expected moment prepared", isReady: true },
      { label: "Offline guidance available", isReady: true }
    ]
  }
};

function resolvePhaseTheme(snapshot: FlightSnapshot): PhaseTheme {
  const blueTheme: PhaseTheme = {
    pageBackground: "#EAF5FF",
    accent: "#0D3B8C",
    accentSoft: "#DDEBFF",
    accentSurface: "#FFFFFF",
    accentBorder: "rgba(13, 59, 140, 0.18)",
    successAccent: "#0BA84A"
  };

  switch (snapshot.status) {
    case "early_flight":
      return {
        ...blueTheme,
        pageBackground: "#EDF6FF",
        accentSoft: "#DBEAFF"
      };
    case "cruise":
      return {
        ...blueTheme,
        pageBackground: "#EAF5FF",
        accent: "#1266E3",
        accentBorder: "rgba(18, 102, 227, 0.20)"
      };
    case "late_flight":
    case "arrival_window":
      return {
        ...blueTheme,
        pageBackground: "#EEF7FF",
        accent: "#0B5CAD",
        accentBorder: "rgba(11, 92, 173, 0.20)"
      };
    case "completed":
      return {
        pageBackground: "#EAF8EF",
        accent: "#0BA84A",
        accentSoft: "#DDF7E7",
        accentSurface: "#FFFFFF",
        accentBorder: "rgba(11, 168, 74, 0.22)",
        successAccent: "#0BA84A"
      };
    case "before_departure":
    default:
      return blueTheme;
  }
}

function formatDuration(minutes?: number): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours > 0 ? `Around ${hours}h${String(remaining).padStart(2, "0")}m` : `Around ${remaining}m`;
}

function buildSavedTiming(snapshot: FlightSnapshot): RoutePatternSummary {
  return {
    title: "Saved flight timing",
    body: "These times come from the flight currently saved on your device. This is not a historical route pattern.",
    scheduledDurationLabel: formatDuration(snapshot.flightSummary.scheduledDurationMinutes),
    updatedDurationLabel: formatDuration(snapshot.flightSummary.revisedDurationMinutes),
    reassurance: "Small timing differences are normal and expected."
  };
}

function buildGateInfo(snapshot: FlightSnapshot): AirportInfo | undefined {
  if (snapshot.status !== "before_departure") return undefined;
  const terminal = snapshot.flightSummary.departureTerminal;
  const gate = snapshot.flightSummary.departureGate;
  if (!terminal && !gate) return undefined;
  return {
    primary: [terminal ? `Terminal ${terminal}` : undefined, gate ? `Gate ${gate}` : undefined]
      .filter(Boolean)
      .join(" · "),
    disclaimer: "Please confirm this on the airport screens, as gates can change."
  };
}

function buildBaggageInfo(snapshot: FlightSnapshot): AirportInfo | undefined {
  if (snapshot.status !== "completed") return undefined;
  const belt = snapshot.flightSummary.baggageBelt;
  return belt
    ? {
        primary: `Baggage belt ${belt}`,
        disclaimer: "Please confirm this on the airport screens, as baggage information can change."
      }
    : {
        primary: "Baggage reclaim",
        disclaimer:
          "If you checked luggage, follow the airport signs for baggage reclaim. The arrival screens will show the correct belt."
      };
}

function makeMoment(
  title: string,
  body: string,
  description: string,
  context: NextExpectedMoment["context"] = "general_guidance"
): NextExpectedMoment {
  return {
    title,
    body,
    description,
    confidence: "high",
    context
  };
}

function buildPreFlightMoment(gateInfo?: AirportInfo): NextExpectedMoment {
  const gateCopy = gateInfo
    ? `\n\nYour saved departure information is ${gateInfo.primary}. Please confirm this on the airport screens, as gates can change.`
    : "";

  return makeMoment(
    "Boarding and departure preparation are next",
    "You may notice boarding movement, crew preparation, and small timing updates. This is a normal part of getting ready to fly.",
    `You may notice:\n• People moving around the gate\n• Boarding groups being called\n• Small timing changes\n• Cabin crew preparing the aircraft\n• Engine or cabin sounds before departure${gateCopy}`,
    "schedule_based"
  );
}

function buildPhaseHero(snapshot: FlightSnapshot, gateInfo?: AirportInfo) {
  switch (snapshot.status) {
    case "before_departure":
      return {
        currentPhaseLabel: "Pre-flight",
        reassuranceMessage: {
          title: "Your flight is being prepared",
          body: "The journey has not started yet. This is a good moment to get settled before departure."
        },
        nextExpectedMoment: buildPreFlightMoment(gateInfo),
        guidanceCopy: "Your saved flight details are ready, and Next Seat will keep the guidance simple and calm."
      };
    case "early_flight":
      return {
        currentPhaseLabel: "Takeoff",
        reassuranceMessage: {
          title: "Takeoff is underway",
          body: "This part can feel powerful, but it is one of the most carefully prepared parts of the journey."
        },
        nextExpectedMoment: makeMoment(
          "Climb and early flight are next",
          "You may notice stronger engine sound, acceleration, and small turns after departure. These are expected and part of the plan.",
          "You may notice stronger engine sound, firm acceleration, the nose lifting, and small turns after departure. These are expected parts of takeoff and early climb.",
          "phase_progression"
        ),
        guidanceCopy:
          "You may feel some tension during this moment, but this does not mean something is wrong. What you are seeing is attention, timing, and routine."
      };
    case "cruise":
      return {
        currentPhaseLabel: "Cruise",
        reassuranceMessage: {
          title: "Your flight is in a steadier phase",
          body: "Cruise is usually the calmer middle part of the journey. Small changes in sound or movement can still happen and are usually normal."
        },
        nextExpectedMoment: makeMoment(
          "Cruise is the calmer middle part",
          "Small sound changes, light bumps, or the seatbelt sign switching on can happen sometimes during cruise.",
          "You may notice gentle turns, small engine sound changes, light bumps, or the seatbelt sign switching on. These can be normal during cruise.",
          "phase_progression"
        ),
        guidanceCopy: "The flight is following its route, and Next Seat is keeping the guidance simple and calm."
      };
    case "late_flight":
    case "arrival_window":
      return {
        currentPhaseLabel: "Descent",
        reassuranceMessage: {
          title: "The aircraft is preparing for arrival",
          body: "The final part of the flight can feel a little busier because the aircraft is gradually moving from cruise toward landing."
        },
        nextExpectedMoment: makeMoment(
          "Approach and landing are next",
          "The aircraft will join the arrival flow, with possible turns and speed changes. This is planned and coordinated with air traffic control.",
          "You may notice turns, changes in engine sound, pressure in your ears, or more cabin activity. These are expected parts of arrival preparation.",
          "phase_progression"
        ),
        guidanceCopy:
          "Turns, sound changes, pressure in your ears, or more cabin activity can be a normal part of arrival preparation."
      };
    case "completed":
    default:
      return undefined;
  }
}

function buildCurrentMomentSummary(snapshot: FlightSnapshot): CurrentMomentSummary | undefined {
  switch (snapshot.status) {
    case "early_flight":
      return {
        label: "What is happening now",
        title: "Cabin crew seated, engines stronger, runway departure sequence in progress",
        body: "This is a coordinated phase where everything is working together as planned."
      };
    case "cruise":
      return {
        label: "What is happening now",
        title: "Cabin service may be underway",
        body: "The pilots are monitoring the aircraft, and air traffic control continues to guide the flight."
      };
    case "late_flight":
    case "arrival_window":
      return {
        label: "What is happening now",
        title: "The crew may collect items, check the cabin again, and prepare everyone for landing.",
        body: "This can feel more structured because the flight is entering its final sequence."
      };
    default:
      return undefined;
  }
}

function buildCompletedFlightUi(snapshot: FlightSnapshot, baggageInfo?: AirportInfo) {
  const destination = snapshot.flightSummary.destinationLabel;
  const baggageCopy = baggageInfo
    ? ` ${baggageInfo.primary}. ${baggageInfo.disclaimer}`
    : " If you checked luggage, follow the airport signs for baggage reclaim.";

  return {
    currentPhaseLabel: "Arrived",
    reassuranceMessage: {
      title: "You've arrived",
      body: `Your flight has landed in ${destination}. The journey is complete.`
    },
    nextExpectedMoment: makeMoment(
      `Welcome to ${destination}`,
      "Passengers will collect their belongings, and the doors will open once the aircraft is parked. Follow the signs for baggage reclaim.",
      `You may notice the seatbelt sign switching off, passengers collecting their belongings, and the doors opening once the aircraft is safely parked.${baggageCopy}`,
      "general_guidance"
    ),
    guidanceCopy:
      "Next Seat will keep the final guidance simple while you prepare to leave the aircraft."
  };
}

function getGuidanceCopy(details: FlightDetailsSnapshot): string {
  if (details.predictionMode === "user-adjusted") {
    return "Based on your latest confirmation, the guidance has been adjusted calmly.";
  }
  if (details.confidenceLevel === "low") {
    return "The latest information is limited, so Next Seat is keeping the guidance gentle and general.";
  }
  return "Based on the saved flight plan, your flight appears to be following the expected pattern.";
}

export function buildFlightUiSnapshot(
  snapshot: FlightSnapshot,
  details: FlightDetailsSnapshot = defaultDetails
): FlightUiSnapshot {
  const isAfterFlight = snapshot.status === "completed";
  const airportInfo = buildGateInfo(snapshot);
  const baggageInfo = buildBaggageInfo(snapshot);
  const completedUi = isAfterFlight ? buildCompletedFlightUi(snapshot, baggageInfo) : undefined;
  const phaseHero = completedUi ?? buildPhaseHero(snapshot, airportInfo);

  return {
    confidenceLevel: details.confidenceLevel,
    predictionMode: details.predictionMode,
    currentPhaseLabel: phaseHero?.currentPhaseLabel ?? snapshot.phase.label,
    routeLabel: snapshot.flightSummary.routeLabel,
    reassuranceMessage: phaseHero?.reassuranceMessage ?? snapshot.reassurance,
    nextExpectedMoment: phaseHero?.nextExpectedMoment ?? snapshot.expectedMoment,
    routePatternSummary: buildSavedTiming(snapshot),
    airportInfo,
    baggageInfo,
    currentMomentSummary: buildCurrentMomentSummary(snapshot),
    isAfterFlight,
    shouldShowEndJourney: isAfterFlight,
    offlineGuidanceStatus: details.offlineGuidanceStatus,
    shouldAskForConfirmation: details.shouldAskForConfirmation,
    guidanceCopy: phaseHero?.guidanceCopy ?? getGuidanceCopy(details),
    phaseTheme: resolvePhaseTheme(snapshot)
  };
}
