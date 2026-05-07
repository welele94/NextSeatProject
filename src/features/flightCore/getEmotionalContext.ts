import { FlightSituation } from "./types";

export type EmotionalContext = {
    title: string; 
    body: string;
}

export function getEmotionalContext(
    situation: FlightSituation
): EmotionalContext {
    switch (situation){
        case "settling_in":
            return {
                title: "Settling into the journey",
                body: "The flight is moving through the first part of the journey. This is a normal moment to simply settle in."
            };
        
        case "steady_route":
            return {
                title: "Continuing steadily",
                body: "The route is progressing calmly and the next part of the journey is expected to continue normally."
            };

        case "arrival_soon":
            return {
                title: "Arrival is getting closer",
                body: "The flight is moving toward the final part of the journey. It is normal for the rhythm of the flight to start changing."
            };
        
        case "final_transition":
            return {
                title: "Preparing for the final stage",
                body: "The flight is entering the final transition toward arrival. Small changes in movement or timing can be normal here."
            };
        
        case "completed":
            return {
                title: "Journey completed",
                body: "The scheduled journey has reached its destination window."
            }
    }
}