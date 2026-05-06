import { FlightStatus } from "@/features/flightCore/getFlightStatus";
import { NextExpectedMoment } from "@/types/nextExpectedMoment";
import { RouteCheckpoint } from "@/types/route";

type GetNextExpectedMomentParams = {
    status: FlightStatus;
    nextCheckpoint?: RouteCheckpoint;
    remainingMinutes: number;
}

export function getNextExpectedMoment({
    status,
    nextCheckpoint,
    remainingMinutes
}:GetNextExpectedMomentParams): NextExpectedMoment{
    switch (status) {
        case "before_departure": 
            return {
                title: "Departure is expected soon",
                body: "The route and schedule are prepared. Boarding and departure should happen shortly."
            };

        case "early_flight":
            return {
                title: "The flight will continue climbing steadily",
                body: "The aircraft is expected to continue toward the first part of the planned route."
            };

        case "cruise":
            return {
                title: "The router continues normally",
                body: nextCheckpoint ? `The flight will continue steadly toward ${nextCheckpoint.label}.` 
                : "The flight will continue steadily along the planned route.",
                minutesUntil: remainingMinutes
            };
        
        case "late_flight":
            return {
                title: "Arrival preparation will begin shortly",
                body: "The aircraft is expected to continue toward the final route segment."
            };

        case "arrival_window":
            return {
                title: "Arrival is expected soon",
                body: "The flight is entering its final transition toward landing."
            };
        
        case "completed":
            return {
                title: "Journey completed",
                body: "The scheduled rout has reached its destination windows safely."
            }
    }
}

