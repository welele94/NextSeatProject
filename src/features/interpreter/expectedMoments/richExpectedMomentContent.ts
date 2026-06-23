export type RichExpectedMomentKey =
  | "preflight"
  | "takeoff"
  | "turbulence"
  | "descent"
  | "arrival";

export type RichExpectedMomentContent = {
  title: string;
  reassurance: string;
  whatMayHappenNext: string;
  whatYouMayNotice: string;
  whyItIsNormal: string;
  learnMoreId?: string;
};

export const richExpectedMomentContent: Record<
  RichExpectedMomentKey,
  RichExpectedMomentContent
> = {
  preflight: {
    title: "The journey is ready to begin",
    reassurance: "Everything needed for offline guidance has been saved.",
    whatMayHappenNext: "The aircraft will prepare for departure and then begin takeoff.",
    whatYouMayNotice: "You may hear cabin sounds, announcements, or engines starting to feel more present.",
    whyItIsNormal: "The beginning of a flight often feels busy because many normal preparations happen close together.",
    learnMoreId: "takeoff"
  },
  takeoff: {
    title: "Takeoff may feel more powerful",
    reassurance: "The stronger sensations during takeoff are expected.",
    whatMayHappenNext: "The aircraft will lift away from the runway and begin settling into the route.",
    whatYouMayNotice: "You may feel acceleration, louder engine sound, vibration, or upward movement.",
    whyItIsNormal: "Takeoff needs more energy than most other parts of the journey.",
    learnMoreId: "takeoff"
  },
  turbulence: {
    title: "The air may feel less smooth for a while",
    reassurance: "This can feel uncomfortable, but it is a routine part of flying.",
    whatMayHappenNext: "The flight should continue through this part of the air and return to a steadier feeling later.",
    whatYouMayNotice: "You may feel bumps, shaking, or a stronger awareness of movement.",
    whyItIsNormal: "Air naturally changes as the aircraft moves through it.",
    learnMoreId: "why-turbulence-happens"
  },
  descent: {
    title: "The final part is getting closer",
    reassurance: "Nothing unusual needs your attention right now.",
    whatMayHappenNext: "The flight may begin preparing for arrival around this stage of the journey.",
    whatYouMayNotice: "You may notice changes in sound, gentle turns, or more cabin activity.",
    whyItIsNormal: "Most flights become a little more active as they move toward arrival.",
    learnMoreId: "descent"
  },
  arrival: {
    title: "Most of the journey is behind you",
    reassurance: "The flight is moving toward the final part of the journey.",
    whatMayHappenNext: "The aircraft will continue toward landing and then move on the ground toward the gate.",
    whatYouMayNotice: "You may feel more turns, lowering, cabin checks, vibration, or braking later.",
    whyItIsNormal: "Arrival brings several normal steps closer together.",
    learnMoreId: "landing"
  }
};
