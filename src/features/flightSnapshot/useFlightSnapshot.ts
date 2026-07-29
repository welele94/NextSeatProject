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

function parseTime(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function getAutoEndAt(flight: Flight): number | undefined {
  const arrival = flight.schedule.revisedArrival ?? flight.schedule.scheduledArrival;
  const arrivalMs = parseTime(arrival);
  if (!arrivalMs) return undefined;

  const arrivalWindowEnd = arrivalMs + AFTER_FLIGHT_WINDOW_MS;
  const preparedAtMs = parseTime(flight.operations?.preparedAt);

  if (!preparedAtMs) return arrivalWindowEnd;

  // Some flights can be looked up after they have already landed. Without this
  // grace window, confirming the flight would immediately auto-end and send the
  // user back to Add Flight, even though the API returned valid data.
  return Math.max(arrivalWindowEnd, preparedAtMs + AFTER_FLIGHT_WINDOW_MS);
}

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
    const autoEndAt = getAutoEndAt(flight);
    if (!autoEndAt) return;

    if (currentTime.getTime() >= autoEndAt) {
      void endJourney();
    }
  }, [currentTime, endJourney, flight, id]);

  const snapshot = useMemo(() => {
    if (!flight) return undefined;
    return getFlightSnapshot(flight, currentTime);
  }, [flight, currentTime]);

  return { snapshot, endJourney };
}