import { FlightStatus } from "./getFlightStatus";
import { FlightSituation } from "./types";

type GetFlightSituationParams = {
    status: FlightStatus;
    remainingMinutes: number;
};

export function getFlightSituation({
    status,
    remainingMinutes
    }: GetFlightSituationParams): FlightSituation {
        if(status === "before_departure" || status === "early_flight"){
            return "settling_in";
        }

        if(status === "cruise"){
            if (remainingMinutes <= 20){
                return "arrival_soon";
            }
            return "steady_route";
        }

        if(status === "late_flight" || status === "arrival_window"){
            return "final_transition";
        }

        return "completed";

    }
