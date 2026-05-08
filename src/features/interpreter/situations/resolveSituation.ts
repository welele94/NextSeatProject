import {
    InterpretationInput,
    SituationType
} from "@/features/interpreter/situations/types"

function isSlightlyDelayed(delayedMinutes?: number): boolean{
    return delayedMinutes !== undefined && delayedMinutes >= 10 && delayedMinutes <= 25;
}

function isCloseToDestination(input: InterpretationInput): boolean {
    return input.remainingMinutes <= 30 || input.progressPercent >= 85; 
}

function timingNoLongerAlignWell(input: InterpretationInput): boolean {
    return input.delayedMinutes !== undefined && input.delayedMinutes > 25;
}

export function resolveSituation(input: InterpretationInput): SituationType{
    if(isCloseToDestination(input) && timingNoLongerAlignWell(input)){
        return "holding_pattern_possible";
    }

    if (isSlightlyDelayed(input.delayedMinutes)){
        return "slightly_extended_route";

    }

    if (input.remainingMinutes <= 20){
        return "arrival_soon"; 
    }

    if (
        input.flightStatus === "cruise" &&
        input.remainingMinutes <= 45
    ){
        return "descent_expected";
    }

    return "stable_progress";
}

