export type LearnArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  durationLabel: string;
};

export const learnArticles: LearnArticle[] = [
  {
    id: "turbulence",
    title: "Turbulence can feel strange, but it is normal",
    summary:
      "Small bumps are usually just changes in airflow. They can be uncomfortable, but they are expected.",
    body:
      "Turbulence is one of the most common reasons passengers feel uneasy. The aircraft is designed to handle it. The movement may feel sudden, but for the crew and the aircraft it is a normal part of flying through changing air.",
    category: "Sensations",
    durationLabel: "2 min read"
  },
  {
    id: "engine-sounds",
    title: "Engine sound changes do not mean something is wrong",
    summary:
      "During climb, cruise and descent, the engines naturally sound different.",
    body:
      "A quieter engine sound can simply mean the aircraft needs less power. A stronger sound can happen during climb or small adjustments. These changes are part of normal flight management.",
    category: "Sounds",
    durationLabel: "2 min read"
  },
  {
    id: "turns",
    title: "Turns are part of following the route",
    summary:
      "Aircraft rarely fly in one perfectly straight line from takeoff to landing.",
    body:
      "Turns can happen because of the planned route, weather, air traffic instructions, or arrival sequencing. A turn does not automatically mean the aircraft is avoiding danger.",
    category: "Route",
    durationLabel: "2 min read"
  },
  {
    id: "descent",
    title: "Descent preparation can feel busier",
    summary:
      "Before arrival, you may notice more sound changes, turns and cabin activity.",
    body:
      "As the aircraft prepares to arrive, the crew may move through the cabin more often and the aircraft may change speed, angle or sound. This phase can feel active, but it is expected.",
    category: "Arrival",
    durationLabel: "3 min read"
  },
  {
    id: "holding",
    title: "Waiting near arrival can happen",
    summary:
      "Sometimes aircraft need to wait before landing because of traffic or sequencing.",
    body:
      "A slightly longer route or a repeated turn pattern can happen when air traffic control manages several aircraft arriving around the same time. This is usually routine spacing, not an emergency.",
    category: "Arrival",
    durationLabel: "2 min read"
  },
  {
    id: "landing-gear",
    title: "The landing gear can make a loud sound",
    summary:
      "Near landing, a noticeable mechanical sound can simply be the gear extending.",
    body:
      "The landing gear creates sound and sometimes vibration when it moves into position. It may be loud, but it is one of the expected steps before landing.",
    category: "Sounds",
    durationLabel: "2 min read"
  }
];