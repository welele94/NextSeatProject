import { SituationType } from "@/features/interpreter/situations/types";

import { SituationMessaging } from "./types";

export const messagingMatrix: Record<SituationType, SituationMessaging> = {
  stable_progress: {
    heroTitle: "The flight is continuing calmly",
    heroBody: "The journey is moving steadily onward.",
    nextTitle: "The route continues normally",
    nextBody: "The next useful moment is simply continued steady progress.",
    expandable: {
      learnMore: "This is the quiet part of the journey. There may not be much to notice, and that is usually a good sign.",
      whyThisHappens: "Most flights spend a long period simply continuing along the planned route.",
      whatToExpect: "You can expect the flight to remain steady until the next meaningful moment appears."
    }
  },
  descent_expected: {
    heroTitle: "Preparing for the final part",
    heroBody: "The journey is moving toward arrival. Some changes may become easier to notice.",
    nextTitle: "The final part comes next",
    nextBody: "The flight should gradually move from steady travel into arrival preparation.",
    expandable: {
      learnMore: "This moment connects the calm middle of the flight with the later arrival phase.",
      whyThisHappens: "As the destination gets closer, the journey naturally becomes a little more active.",
      whatToExpect: "You may notice small changes in sound, direction, or movement as the flight continues."
    }
  },
  arrival_soon: {
    heroTitle: "You are getting close",
    heroBody: "Most of the journey is behind you. The flight is entering its final scheduled window.",
    nextTitle: "Arrival is the next major moment",
    nextBody: "The next part may feel more guided as the journey moves toward landing.",
    expandable: {
      learnMore: "The final part of a flight often has more noticeable changes than the middle.",
      whyThisHappens: "The flight is being guided toward the destination area.",
      whatToExpect: "You can expect a more guided feeling as the journey moves through the final minutes."
    }
  },
  slightly_extended_route: {
    heroTitle: "The route is taking a little longer",
    heroBody: "The flight is still continuing normally. A small timing change does not mean something is wrong.",
    nextTitle: "The flight should keep progressing calmly",
    nextBody: "The next few minutes may simply feel like continued steady flight while timing adjusts.",
    expandable: {
      learnMore: "Small timing changes can happen during ordinary flights.",
      whyThisHappens: "Flights may take slightly different paths or spend more time in one part of the route.",
      whatToExpect: "The experience should remain steady while the journey continues."
    }
  },
  holding_pattern_possible: {
    heroTitle: "The flight is staying steady",
    heroBody: "It may remain in this part of the journey for a while. The experience can still be calm and normal.",
    nextTitle: "The flight may stay steady a little longer",
    nextBody: "The next useful moment may come after this extended part of the route.",
    expandable: {
      learnMore: "Sometimes a flight keeps a steady rhythm before the next noticeable step.",
      whyThisHappens: "The journey may need more time before moving into the final arrival flow.",
      whatToExpect: "You can expect continued steady movement until the next transition becomes useful to show."
    }
  }
};
