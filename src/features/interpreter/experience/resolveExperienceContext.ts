import {
    ExperienceContext,
    ExperienceRhythm
} from "@/features/interpreter/experience/types";

import { SituationType } from "../situations/types";

type ResolveExperienceContextInput = {
    situation: SituationType;
    remainingMinutes: number;

    nextCheckpoint?: {
        label: string;
    };
};

function resolveRhythm (
    situation: SituationType,
    remainingMinutes: number
): ExperienceRhythm {
    if(situation === "arrival_soon" || situation === "holding_pattern_possible"){
        return "active_arrival";
    }

    if (situation === "descent_expected" || remainingMinutes >= 45){
        return "sensitive_transition";
    }

    return "quiet_cruise";
}

// missing export functionresolveExperienceContext