export type NextExpectedMomentMessageId =
  | "cruise"
  | "descent"
  | "arrival"
  | "extended_route"
  | "holding_pattern";

export type NextExpectedMomentMessage = {
  id: NextExpectedMomentMessageId;
  title: string;
  body: string;
};

export const nextExpectedMomentMessages: Record<NextExpectedMomentMessageId, NextExpectedMomentMessage> = {
  cruise: {
    id: "cruise",
    title: "The route continues normally",
    body: "Most flights on this route continue steadily for a while before the next noticeable change. Nothing needs your attention right now."
  },
  descent: {
    id: "descent",
    title: "The next stage is getting closer",
    body: "Most flights begin preparing for arrival around this stage of the journey. You may notice more changes than during cruise."
  },
  arrival: {
    id: "arrival",
    title: "Arrival is the next major moment",
    body: "The journey is entering its final stage. Many passengers notice more activity in the cabin around this point."
  },
  extended_route: {
    id: "extended_route",
    title: "The journey may take a little longer",
    body: "Flights sometimes spend extra time on route without anything unusual happening. The experience should continue steadily."
  },
  holding_pattern: {
    id: "holding_pattern",
    title: "The aircraft may stay steady a little longer",
    body: "Near busy destinations, flights can spend extra time before continuing toward arrival. This can be part of normal traffic flow."
  }
};
