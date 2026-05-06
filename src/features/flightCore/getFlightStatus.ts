export type FlightStatus =
  | "before_departure"
  | "early_flight"
  | "cruise"
  | "late_flight"
  | "arrival_window"
  | "completed";

export function getFlightStatus(
  progressPercent: number,
  isBeforeDeparture: boolean,
  isAfterArrival: boolean
): FlightStatus {
  if (isBeforeDeparture) {
    return "before_departure";
  }

  if (isAfterArrival || progressPercent >= 100) {
    return "completed";
  }

  if (progressPercent < 20) {
    return "early_flight";
  }

  if (progressPercent < 70) {
    return "cruise";
  }

  if (progressPercent < 90) {
    return "late_flight";
  }

  return "arrival_window";
}