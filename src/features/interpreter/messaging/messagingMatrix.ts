import { SituationType } from "@/features/interpreter/situations/types";

import { SituationMessaging } from "./types";

export const messagingMatrix: Record<SituationType, SituationMessaging> = {
  stable_progress: {
    heroTitle: "You are in a steady part of the flight",
    heroBody: "Nothing unusual needs your attention right now. The journey is simply continuing.",
    nextTitle: "The flight should stay steady for now",
    nextBody: "Most flights spend a long time in this quiet rhythm before the next noticeable change.",
    expandable: {
      learnMore: "This is the part of the journey where there may be very little to notice. That quietness is normal.",
      whyThisHappens: "After the busier beginning, flights usually settle into a simpler rhythm for a while.",
      whatToExpect: "You can expect the flight to keep feeling steady until the next useful moment appears."
    }
  },
  descent_expected: {
    heroTitle: "The flight is getting ready for its later stage",
    heroBody: "Nothing unusual is happening. The journey is gradually moving away from the quiet middle part.",
    nextTitle: "You may notice gentle changes later",
    nextBody: "As arrival gets closer, the flight may feel a little more active than cruise. That is expected.",
    expandable: {
      learnMore: "This moment is a bridge between the quiet middle of the flight and the later arrival flow.",
      whyThisHappens: "As the destination gets closer, the journey naturally starts preparing for the final part.",
      whatToExpect: "You may notice small changes in sound, movement, or cabin activity. These changes do not mean something is wrong."
    }
  },
  arrival_soon: {
    heroTitle: "You are getting close",
    heroBody: "Most of the journey is behind you. Nothing unusual needs your attention right now.",
    nextTitle: "The final part is beginning to take shape",
    nextBody: "From here, the flight may feel more guided. You may notice more cabin activity, turns, or changes in sound.",
    expandable: {
      learnMore: "The final part often feels more active because the journey is moving from steady travel toward arrival.",
      whyThisHappens: "Near the destination, flights follow a more specific path and the cabin starts preparing for arrival.",
      whatToExpect: "You may notice more small changes close together. This is a normal part of approaching the end of the journey."
    }
  },
  slightly_extended_route: {
    heroTitle: "The journey may take a little longer",
    heroBody: "The flight is still continuing normally. A small timing change does not mean something is wrong.",
    nextTitle: "The flight should keep going steadily",
    nextBody: "For now, the next useful moment may simply be more steady flight while timing settles.",
    expandable: {
      learnMore: "Small timing changes are common during real journeys, even when everything is normal.",
      whyThisHappens: "Flights may spend a little more time on one part of the route or follow a small adjustment.",
      whatToExpect: "You can expect the flight to continue steadily while the journey catches up with its next moment."
    }
  },
  holding_pattern_possible: {
    heroTitle: "The flight may stay steady for a while",
    heroBody: "This can happen near busy destinations. The journey is still in a normal flow.",
    nextTitle: "There may be a little more waiting first",
    nextBody: "The flight may continue in this steady rhythm before moving into the final arrival path.",
    expandable: {
      learnMore: "Sometimes the flight stays in a steady pattern before the next visible step happens.",
      whyThisHappens: "Near busy destinations, flights may need extra spacing before continuing toward arrival.",
      whatToExpect: "You may feel continued steady movement or repeated turns. This can still be normal."
    }
  }
};
