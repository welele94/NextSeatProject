export type PriorityMomentKey =
  | "preflight"
  | "takeoff"
  | "turbulence"
  | "descent"
  | "arrival";

export type PriorityReassuranceContent = {
  whatIsHappening: string;
  whatPassengerMayFeel: string;
  whyItIsNormal: string;
  firstMessage: string;
  extraDetail: string;
};

export const priorityReassuranceContent: Record<
  PriorityMomentKey,
  PriorityReassuranceContent
> = {
  preflight: {
    whatIsHappening: "The flight is being prepared and the saved journey guidance is ready.",
    whatPassengerMayFeel: "You may feel anticipation, overthinking, or a stronger need to check details.",
    whyItIsNormal: "Many nervous passengers feel most alert before departure because the journey has not started yet.",
    firstMessage: "Everything is ready for the journey.",
    extraDetail: "Next Seat has saved the flight information it needs to explain the journey calmly while offline."
  },
  takeoff: {
    whatIsHappening: "The aircraft is beginning the flight and moving into the first part of the route.",
    whatPassengerMayFeel: "You may feel acceleration, engine sound, vibration, pressure, or upward movement.",
    whyItIsNormal: "Takeoff is usually the most energetic part of a flight.",
    firstMessage: "The stronger sensations during takeoff are expected.",
    extraDetail: "This part usually feels more powerful than cruise because the journey is just beginning."
  },
  turbulence: {
    whatIsHappening: "The aircraft is moving through air that feels less smooth for a while.",
    whatPassengerMayFeel: "You may feel bumps, shaking, or a sudden focus on movement.",
    whyItIsNormal: "This is common on many flights and can feel uncomfortable without being unusual.",
    firstMessage: "This can feel uncomfortable, but it is a routine part of flying.",
    extraDetail: "Air changes as the aircraft moves through it, and some areas feel less smooth than others."
  },
  descent: {
    whatIsHappening: "The flight is moving from the steady part of the journey toward arrival.",
    whatPassengerMayFeel: "You may notice engine changes, gentle turns, more cabin activity, or a lowering feeling.",
    whyItIsNormal: "Arrival preparation naturally brings more noticeable changes than cruise.",
    firstMessage: "The flight is moving into its final transition.",
    extraDetail: "The last part often has more small changes because the flight is preparing to arrive."
  },
  arrival: {
    whatIsHappening: "The journey is entering its final stage.",
    whatPassengerMayFeel: "You may feel more turns, braking later, cabin checks, vibration, or changes in sound.",
    whyItIsNormal: "The final minutes include several normal steps close together.",
    firstMessage: "Most of the journey is already behind you.",
    extraDetail: "The flight is moving toward landing and then ground movement toward the gate."
  }
};
