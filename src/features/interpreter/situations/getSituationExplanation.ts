import {
    SituationExplanation,
    SituationType
} from "@/features/interpreter/situations/types"; 

export function getSituationExplanation(
    situation: SituationType
): SituationExplanation{
    switch (situation) {
    case "stable_progress":
      return {
        title: "The flight is progressing steadily",
        body: "The journey is continuing as expected. There is nothing here that needs extra attention."
      };

    case "descent_expected":
      return {
        title: "Descent may begin soon",
        body: "The flight is getting closer to the final part of the journey. It is normal for the rhythm of the flight to change later."
      };

    case "arrival_soon":
      return {
        title: "Arrival is expected soon",
        body: "The flight is now in the final part of the journey. Some changes in movement or timing can feel more noticeable here."
      };

    case "slightly_extended_route":
      return {
        title: "The route may take a little longer",
        body: "The timing looks slightly extended. This can happen during normal airline operations and does not mean something is wrong."
      };

    case "holding_pattern_possible":
      return {
        title: "The aircraft may be waiting for its turn",
        body: "Close to busy airports, flights sometimes spend extra time before landing. This can be a normal part of arrival sequencing."
      };
  }
}