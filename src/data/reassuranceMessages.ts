export type ReassuranceMessage = {
  id: string;
  title: string;
  body: string;
};

export const reassuranceMessages: ReassuranceMessage[] = [
  {
    id: "steady-progress",
    title: "Everything is moving steadily",
    body: "The aircraft is following its planned route. Small changes in speed, sound, or angle are normal parts of a regular flight."
  },
  {
    id: "over-checkpoint",
    title: "You are passing a route marker",
    body: "This checkpoint is just a calm reference point on the journey. The flight can be understood as steady progress from one known point to the next."
  },
  {
    id: "nearing-destination",
    title: "You are getting closer",
    body: "Most of the route is now behind you. The remaining time estimate is based on the original schedule and works fully offline."
  }
];

export const fallbackReassuranceMessage = reassuranceMessages[0];
