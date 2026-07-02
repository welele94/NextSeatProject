export type RoutePatternDataFreshness = "recent" | "limited" | "unavailable";

export type RoutePatternSummary = {
  sampleSize: number;
  completedNormallyCount?: number;
  averageDepartureDelayMinutes?: number;
  averageArrivalDelayMinutes?: number;
  averageDurationMinutes?: number;
  typicalDescentWindowMinutesBeforeArrival?: {
    from: number;
    to: number;
  };
  dataFreshness: RoutePatternDataFreshness;
  summaryMessage: string;
  reassuranceMessage: string;
};
