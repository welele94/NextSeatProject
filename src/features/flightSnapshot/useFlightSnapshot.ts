import { router, useGlobalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getMockFlightById, mockFlights } from "@/data/mockFlights";
import {
  getPreparedFlight,
  removePreparedFlight
} from "@/features/flightLookup/preparedFlightStorage";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";
import { Flight } from "@/types/flight";

import { getFlightSnapshot } from "./getFlightSnapshot";
import { FlightSnapshot } from "./types";

const AFTER_FLIGHT_WINDOW_MS = 90 * 60 * 1000;

type UseFlightSnapshotResult = {
  snapshot?: FlightSnapshot;
  endJourney: () => Promise<void>;
};

export function useFlightSnapshot(): UseFlightSnapshotResult {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const [currentTime, setCurrentTime] = useState(() => getCurrentTimestamp());
  const [flight, setFlight] = useState<Flight | undefined>(() =>
    id ? getMockFlightById(id) : mockFlights[0]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimestamp());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadFlight() {
      if (!id) {
        if (isActive) setFlight(mockFlights[0]);
        return;
      }

      const preparedFlight = await getPreparedFlight(id);
      const resolvedFlight = preparedFlight ?? getMockFlightById(id) ?? mockFlights[0];
      if (isActive) setFlight(resolvedFlight);
    }

    void loadFlight();
    return () => {
      isActive = false;
    };
  }, [id]);

  const endJourney = useCallback(async () => {
    if (id) await removePreparedFlight(id);
    setFlight(undefined);
    router.replace("/" as never);
  }, [id]);

  useEffect(() => {
    if (!flight || !id) return;
    const arrival = flight.schedule.revisedArrival ?? flight.schedule.scheduledArrival;
    const arrivalMs = Date.parse(arrival);
    if (Number.isNaN(arrivalMs)) return;

    if (currentTime.getTime() >= arrivalMs + AFTER_FLIGHT_WINDOW_MS) {
      void endJourney();
    }
  }, [currentTime, endJourney, flight, id]);

  const snapshot = useMemo(() => {
    if (!flight) return undefined;
    return getFlightSnapshot(flight, currentTime);
  }, [flight, currentTime]);

  return { snapshot, endJourney };
}
