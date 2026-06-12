export type FlightPhaseMessageId =
  | "departure"
  | "climb"
  | "cruise"
  | "descent"
  | "approach"
  | "arrival";

export type FlightPhaseMessage = {
  id: FlightPhaseMessageId;
  question: string;
  title: string;
  body: string;
};

export const flightPhaseMessages: Record<FlightPhaseMessageId, FlightPhaseMessage> = {
  departure: {
    id: "departure",
    question: "What is happening?",
    title: "The journey is beginning",
    body: "The aircraft is preparing to leave the ground and start the route. This first part can feel more active than the rest of the flight."
  },
  climb: {
    id: "climb",
    question: "Why does the aircraft feel more active?",
    title: "The aircraft is settling into the route",
    body: "The flight is gaining height and moving away from the airport area. More sound, movement, or turning can be normal here."
  },
  cruise: {
    id: "cruise",
    question: "Is everything okay?",
    title: "This is the steady part",
    body: "The flight is continuing along the route. Long quiet periods are normal and do not need your attention."
  },
  descent: {
    id: "descent",
    question: "What changes should I expect?",
    title: "The final part is getting closer",
    body: "You may notice changes in sound, movement, or cabin activity as the flight prepares for arrival. These changes are expected."
  },
  approach: {
    id: "approach",
    question: "Why is the aircraft turning more?",
    title: "The aircraft is lining up for arrival",
    body: "Turns can become more noticeable near the destination. The flight is following the prepared path into the arrival area."
  },
  arrival: {
    id: "arrival",
    question: "What happens next?",
    title: "The journey is nearly complete",
    body: "The aircraft will return to the ground, slow down, and continue toward the gate. The final sounds and movements are routine."
  }
};
