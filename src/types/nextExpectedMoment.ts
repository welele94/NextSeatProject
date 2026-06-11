export type ExpectedMomentConfidence = "low" | "medium" | "high";

export type ExpectedMomentContext =
  | "schedule_based"
  | "route_pattern"
  | "phase_progression"
  | "delay_or_wait"
  | "general_guidance";

export type TimingEstimate = {
  minutesUntil?: number;
  label: string;
};

export type NextExpectedMoment = {
  title: string;
  body: string;
  description: string;
  confidence: ExpectedMomentConfidence;
  context: ExpectedMomentContext;
  timingEstimate?: TimingEstimate;
};
