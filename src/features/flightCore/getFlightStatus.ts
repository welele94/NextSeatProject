export type FlightStatus =
  | "before_departure"
  | "early_flight"
  | "cruise"
  | "late_flight"
  | "arrival_window"
  | "completed";

type FlightPhaseThresholds = {
  earlyFlightEndPercent: number;
  cruiseEndPercent: number;
  lateFlightEndPercent: number;
};

function resolvePhaseThresholds(durationMinutes?: number): FlightPhaseThresholds {
  if (!durationMinutes || durationMinutes <= 0) {
    return {
      earlyFlightEndPercent: 20,
      cruiseEndPercent: 70,
      lateFlightEndPercent: 90
    };
  }

  if (durationMinutes <= 75) {
    return {
      earlyFlightEndPercent: 22,
      cruiseEndPercent: 48,
      lateFlightEndPercent: 78
    };
  }

  if (durationMinutes <= 120) {
    return {
      earlyFlightEndPercent: 20,
      cruiseEndPercent: 58,
      lateFlightEndPercent: 82
    };
  }

  if (durationMinutes <= 180) {
    return {
      earlyFlightEndPercent: 20,
      cruiseEndPercent: 65,
      lateFlightEndPercent: 88
    };
  }

  return {
    earlyFlightEndPercent: 20,
    cruiseEndPercent: 70,
    lateFlightEndPercent: 90
  };
}

export function getFlightStatus(
  progressPercent: number,
  isBeforeDeparture: boolean,
  isAfterArrival: boolean,
  durationMinutes?: number
): FlightStatus {
  if (isBeforeDeparture) {
    return "before_departure";
  }

  if (isAfterArrival || progressPercent >= 100) {
    return "completed";
  }

  const thresholds = resolvePhaseThresholds(durationMinutes);

  if (progressPercent < thresholds.earlyFlightEndPercent) {
    return "early_flight";
  }

  if (progressPercent < thresholds.cruiseEndPercent) {
    return "cruise";
  }

  if (progressPercent < thresholds.lateFlightEndPercent) {
    return "late_flight";
  }

  return "arrival_window";
}
