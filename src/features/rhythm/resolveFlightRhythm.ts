import { SituationType } from "@/features/interpreter/situations/types"; 

export type FlightRhythmState = 
    | "calm_cruise"
    | "active_transition"
    | "arrival_guidance"
    | "extended_wait";

export function resolveFlightRhythm(
    situation: SituationType
): FlightRhythmState {
    switch (situation){
        case "arrival_soon": 
            return "arrival_guidance";

        case "descent_expected":
            return "active_transition";
        
        case "slightly_extended_route":
        case "holding_pattern_possible":
            return "extended_wait";
        
        case "stable_progress":
        default: 
            return "calm_cruise"

    }
}