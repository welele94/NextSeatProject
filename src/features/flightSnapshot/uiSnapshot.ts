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
  switch (snapshot.status) {
    case "before_departure":
      return {
        pageBackground: "#EEF6FF",
        accent: "#0D3B8C",
        accentSoft: "#DDEBFF",
        accentSurface: "#F7FAFF",
        accentBorder: "rgba(13, 59, 140, 0.16)"
      };
    case "early_flight":
      return {
        pageBackground: "#F1FAF8",
        accent: "#2F8066",
        accentSoft: "#DDF4E8",
        accentSurface: "#F8FFFC",
        accentBorder: "rgba(47, 128, 102, 0.18)"
      };
    case "cruise":
      return {
        pageBackground: "#EAF5FF",
        accent: "#176B9E",
        accentSoft: "#D8EEFC",
        accentSurface: "#F5FBFF",
        accentBorder: "rgba(23, 107, 158, 0.16)"
      };
    case "late_flight":
    case "arrival_window":
      return {
        pageBackground: "#EFF8F8",
        accent: "#2A756D",
        accentSoft: "#D8F0EC",
        accentSurface: "#F7FCFB",
        accentBorder: "rgba(42, 117, 109, 0.17)"
      };
    case "completed":
    default:
      return {
        pageBackground: "#EAF8F1",
        accent: "#2F8066",
        accentSoft: "#CFEFDF",
        accentSurface: "#F5FCF8",
        accentBorder: "rgba(47, 128, 102, 0.18)"
      };
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
    disclaimer: "Airport gates can change before boarding. Please confirm this on the airport screens."
  };
}

function buildBaggageInfo(snapshot: FlightSnapshot): AirportInfo | undefined {
  if (snapshot.status !== "completed") return undefined;
  const belt = snapshot.flightSummary.baggageBelt;
  return belt
    ? {
        primary: `Baggage belt ${belt}`,
        disclaimer: "Baggage information can change after landing. Please confirm it on the airport screens."
      }
    : {
        primary: "Baggage reclaim",
        disclaimer:
          "If you checked luggage, follow the airport signs for baggage reclaim. The arrival screens will show the correct belt."
      };
}

function buildPreFlightMoment(snapshot: FlightSnapshot, gateInfo?: AirportInfo): NextExpectedMoment {
  const gateCopy = gateInfo
    ? `\n\nYour saved departure information is ${gateInfo.primary}. Please confirm this on the airport screens, as gates can change.`
    : "";

  return {
    title: "Boarding and departure preparation are next",
    body: "Before the aircraft leaves, you may notice crew checks, boarding movement and small schedule updates. This is all part of the normal start of a flight.",
    description:
      `You may notice:\n• People moving around the gate\n• Boarding groups being called\n• Small timing changes\n• Cabin crew preparing the aircraft\n• Engine or cabin sounds before departure${gateCopy}`,
    confidence: "high",
    context: "schedule_based"
  };
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
    nextExpectedMoment: {
      title: `Welcome to ${destination}`,
      body: "The aircraft is now completing its arrival at the gate.",
      description:
        `You may notice the seatbelt sign switching off, passengers collecting their belongings, and the doors opening once the aircraft is safely parked.${baggageCopy}`,
      confidence: "high" as const,
      context: "general_guidance" as const
    },
    guidanceCopy:
      "Your flight has arrived. Next Seat will keep the final guidance simple while you prepare to leave the aircraft."
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

  return {
    confidenceLevel: details.confidenceLevel,
    predictionMode: details.predictionMode,
    currentPhaseLabel: completedUi?.currentPhaseLabel ?? snapshot.phase.label,
    routeLabel: snapshot.flightSummary.routeLabel,
    reassuranceMessage: completedUi?.reassuranceMessage ?? snapshot.reassurance,
    nextExpectedMoment:
      completedUi?.nextExpectedMoment ??
      (snapshot.status === "before_departure"
        ? buildPreFlightMoment(snapshot, airportInfo)
        : snapshot.expectedMoment),
    routePatternSummary: buildSavedTiming(snapshot),
    airportInfo,
    baggageInfo,
    isAfterFlight,
    shouldShowEndJourney: isAfterFlight,
    offlineGuidanceStatus: details.offlineGuidanceStatus,
    shouldAskForConfirmation: details.shouldAskForConfirmation,
    guidanceCopy: completedUi?.guidanceCopy ?? getGuidanceCopy(details),
    phaseTheme: resolvePhaseTheme(snapshot)
  };
}
