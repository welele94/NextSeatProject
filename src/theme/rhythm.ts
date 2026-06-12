import { FlightRhythmState  } from "@/features/rhythm/types";
import { colors } from "./colors";

export type RhythmUi = {
    screenBackground: string;
    heroBackground: string; 
    contentGap: number;
    cardGap: number;
    heroPadding: number;
    emphasizeNextMoment: boolean;
};

export const rhythmUi: Record<FlightRhythmState, RhythmUi> = {
    calm_cruise: {
        screenBackground: colors.cruiseBlue,
        heroBackground: colors.surface,
        contentGap: 18,
        cardGap: 14,
        heroPadding: 24,
        emphasizeNextMoment: false
    }, 

    active_transition: {
        screenBackground: colors.transitionAmber,
        heroBackground: colors.surface,
        contentGap: 16,
        cardGap: 12,
        heroPadding: 24,
        emphasizeNextMoment: true
    },

    arrival_guidance: {
        screenBackground: colors.arrivalPurple,
        heroBackground: colors.surface,
        contentGap: 16,
        cardGap: 12,
        heroPadding: 24,
        emphasizeNextMoment: true
    },

    extended_wait: {
        screenBackground: colors.transitionAmber,
        heroBackground: colors.surface,
        contentGap: 22,
        cardGap: 18,
        heroPadding: 26,
        emphasizeNextMoment: false
    }
};