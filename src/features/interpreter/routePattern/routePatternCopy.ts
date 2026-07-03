export type RoutePatternSummaryCopy = {
  title: string;
  body: string;
  typicalDurationLabel: string;
  typicalArrivalPrepLabel: string;
  timingNote: string;
};

export const routePatternSummaryCopy: RoutePatternSummaryCopy = {
  title: "Recent route pattern",
  body: "Recent flights on this route followed a consistent timing pattern.",
  typicalDurationLabel: "Typical duration",
  typicalArrivalPrepLabel: "Typical arrival preparation",
  timingNote: "Small timing differences are common and expected."
};

export const routePatternDetailCopy = {
  title: "Recent flights on this route",
  intro:
    "This view is optional. It is here to show the normal rhythm of this route, not to make you monitor every minute.",
  sampleSizeLabel: "Recent flights checked",
  averageDurationLabel: "Average duration",
  averageDepartureTimingLabel: "Average departure timing",
  averageArrivalTimingLabel: "Average arrival timing",
  typicalArrivalWindowLabel: "Typical arrival preparation window",
  dataFreshnessLabel: "Last updated",
  reassuranceNote:
    "Recent flights on this route followed a normal timing pattern. Small delays and timing changes are expected."
};
