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
export function resolveExperienceContext({
    situation,
    remainingMinutes,
    nextCheckpoint
}: ResolveExperienceContextInput): ExperienceContext {
    const rhythm = resolveRhythm(
        situation,
        remainingMinutes
    );

    switch(situation){
        case "stable_progress":
            return {
                rhythm,
                current: {
                    title: "The flight is continuing steadly",
                    body: "Everything is progressing calmly. There is no need to focus on every detail right now.",
                    priority: "primary"
                }, 
                
                next: {
                    title: "The route continues ahead",
                    body: nextCheckpoint
                    ? `The next part of the journey continues toward ${nextCheckpoint.label}.`
                    : "The jorney is expected to continue normally.",
                    priority: "secondary",
                    minutesUntil: remainingMinutes
                },

                details: {
                    checkpoint: nextCheckpoint ? {
                        label: nextCheckpoint.label,
                        priority: "hidden"
                    } : undefined,

                    situation: {
                        type: situation,
                        priority: "hidden"
                    }
                }
            };
            case "descent_expected":
                return {
                    rhythm, 

                    current: {
                        title: "A transition is expected later",
                        body: "The flight is getting closer to the stage where descent may begin.",
                        priority:"primary"
                    },

                    next: {
                        title: "Descent may begin soon",
                        body: "The aircraft may start preparing for arrival later in the journey.",
                        priority: "secondary",
                        minutesUntil: remainingMinutes
                    },

                    details: {
                        checkpoint: nextCheckpoint ?
                        {
                            label: nextCheckpoint.label,
                            priority: "hidden"
                        } : undefined,

                        situation: {
                            type: situation,
                            priority: "secondary"
                        }
                    }
                };

                case "arrival_soon":
                    return {
                        rhythm,

                        current: {
                            title: "Arrival is getting closer",
                            body: "The flight is now moving through the final part of the journey.",
                            priority:"primary"
                        },
                        next: {
                            title: "Landing comes next",
                            body: "The aircraft is expected to continue toward arrival.",
                            priority: "primary",
                            minutesUntil: remainingMinutes
                        },

                        details: {
                            checkpoint: nextCheckpoint ? { 
                                label: nextCheckpoint.label, 
                                priority: "secondary"
                            } : undefined,

                        situation: {
                            type: situation,
                            priority: "secondary"
                        }
                        }
                    };

                    case "slightly_extended_route":
                        return {
                            rhythm,

                            current: {
                                title: "The route may take slightly longer",
                                body: "The timing looks a little extended. This can happen during normal operation.",
                                priority: "primary"
                            },

                            next: {
                                title: "The journey should continue normally",
                                body: "The flight is still expected to continue toward arrival.",
                                priority: "secondary",
                                minutesUntil: remainingMinutes
                            },

                            details: {
                                checkpoint: nextCheckpoint ? {
                                    label: nextCheckpoint.label,
                                    priority: "hidden"
                                } : undefined,

                                situation: {
                                    type: situation,
                                    priority: "secondary"
                                }
                            }
                        };

                        case "holding_pattern_possible":
                            return {
                                rhythm,

                                current: {
                                    title: "The aircraft may be waiting briefly", 
                                    body: "Flights sometimes spend extra time before landing near busy airports.", 
                                    priority: "primary"
                                },

                                next: {
                                    title: "Arrival should continue afterward",
                                    body: "The aircraft is still expected to continue toward langind.",
                                    priority: "primary",
                                    minutesUntil: remainingMinutes
                                },

                                details: {
                                    checkpoint: nextCheckpoint ? {
                                        label: nextCheckpoint.label,
                                        priority: "secondary"
                                    }: undefined,

                                    situation: {
                                        type: situation,
                                        priority: "secondary"
                                    }
                                }
                            };
    }








}