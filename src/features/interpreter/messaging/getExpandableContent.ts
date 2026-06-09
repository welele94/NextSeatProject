import { SituationType } from "@/features/interpreter/situations/types";

import { messagingMatrix } from "./messagingMatrix";
import { ExpandableMessageContent } from "./types";

export function getExpandableContent(
  situation: SituationType
): ExpandableMessageContent {
  return messagingMatrix[situation].expandable;
}
