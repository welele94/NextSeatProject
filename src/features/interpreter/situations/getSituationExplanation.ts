import { messagingMatrix } from "@/features/interpreter/messaging/messagingMatrix";
import { ExpandableMessageContent } from "@/features/interpreter/messaging/types";

import { SituationType } from "./types";

export type SituationExplanation = {
  whyIsThisHappening: string;
  learnMore: string;
  whatShouldIExpect: string;
};

export function getSituationExplanation(
  situation: SituationType
): SituationExplanation {
  const expandable: ExpandableMessageContent = messagingMatrix[situation].expandable;

  return {
    whyIsThisHappening: expandable.whyThisHappens,
    learnMore: expandable.learnMore,
    whatShouldIExpect: expandable.whatToExpect
  };
}
