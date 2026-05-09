import { SituationType } from "../interpreter/situations/types";
import { RouteCheckpoint } from "@/types/route";

export type ContextPriority = "primary" | "secondary" | "hidden";

export type ExperienceRhythm = 
    | "quiet_cruise"
    | "active_arrival"
    | "sensitive_transition";

export type EmotionalContext = {
    title: string;
    body: string;
    priority: ContextPriority;
};

export type NextExpectedEmotionalContext = {
    title: string;
    body: string;
    priority: ContextPriority;
    minutesUnil?: number;
}

export type OptionalDetailPayload = {
    checkpoint?: {
        label:string;
        priority: ContextPriority;
    };
    situation: {
        type: SituationType;
        priority: ContextPriority;
    };
};

export type ExperienceContext = {
    rhythm: ExperienceRhythm;
    current: EmotionalContext;
    next: NextExpectedEmotionalContext;
    details: OptionalDetailPayload
}