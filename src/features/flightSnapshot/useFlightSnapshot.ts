import { router, useGlobalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getMockFlightById, mockFlights } from "@/data/mockFlights";
import { createFlightFromExternalSeed } from "@/features/flightLookup/createFlightFromExternalSeed";
import {
  getPreparedFlight,
  removePreparedFlight,
  savePreparedFlight
} from "@/features/flightLookup/preparedFlightStorage";
import { requestFlightLookup } from "@/features/flightLookup/requestFlightLookup";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";
import { Flight } from "@/types/flight";

import { getFlightSnapshot } from "./getFlightSnapshot";
import { FlightSnapshot } from "./types";

const AFTER_FLIGHT_WINDOW_MS = 90 * 60 * 1000;
const REGULAR_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const ARRIVAL_REFRESH_INTERVAL_MS = 60 * 1000;
const REFRESH_TIMER_MS = 60 * 1000;
const REFRESH_BEFORE_DEPARTURE_MS = 2 * 60 * 60 * 1000;
const REFRESH_AFTER_ARRIVAL_MS = 30 * 60 * 1000;
const ARRIVAL_REFRESH_WINDOW_MS = 30 * 60 * 1000;

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

function getLookupDate(flight: Flight): string {
  return (flight.schedule.scheduledDeparture ?? flight.schedule.revisedDeparture).slice(0, 10);
}

function isPreparedExternalFlight(id: string, flight: Flight): boolean {
  return id.startsWith("external-") || Boolean(flight.operations?.preparedAt);
}

function shouldRefreshFlight(flight: Flight, now: Date): boolean {
  const status = flight.operations?.providerStatus;
  if (status === "landed" || status === "cancelled") return false;

  const departureMs = parseTime(flight.schedule.revisedDeparture ?? flight.schedule.scheduledDeparture);
  const arrivalMs = parseTime(flight.schedule.revisedArrival ?? flight.schedule.scheduledArrival);
  if (!departureMs || !arrivalMs) return false;

  const nowMs = now.getTime();
  return (
    nowMs >= departureMs - REFRESH_BEFORE_DEPARTURE_MS &&
    nowMs <= arrivalMs + REFRESH_AFTER_ARRIVAL_MS
  );
}

function refreshIntervalForFlight(flight: Flight, now: Date): number {
  const arrivalMs = parseTime(flight.schedule.revisedArrival ?? flight.schedule.scheduledArrival);
  if (!arrivalMs) return REGULAR_REFRESH_INTERVAL_MS;

  const remainingMs = arrivalMs - now.getTime();
  const isNearArrival = remainingMs <= ARRIVAL_REFRESH_WINDOW_MS && remainingMs >= -REFRESH_AFTER_ARRIVAL_MS;
  return isNearArrival ? ARRIVAL_REFRESH_INTERVAL_MS : REGULAR_REFRESH_INTERVAL_MS;
}

function preserveCurrentRouteId(refreshedFlight: Flight, currentFlight: Flight): Flight {
  return {
    ...refreshedFlight,
    id: currentFlight.id,
    operations: {
      ...refreshedFlight.operations,
      preparedAt: currentFlight.operations?.preparedAt ?? refreshedFlight.operations?.preparedAt
    }
  };
}

export function useFlightSnapshot(): UseFlightSnapshotResult {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const refreshInFlightRef = useRef(false);
  const lastRefreshAtRef = useRef(0);
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

  useEffect(() => {
    if (!id || !flight || !isPreparedExternalFlight(id, flight)) return;

    let isActive = true;

    async function refreshFlightIfNeeded() {
      const now = getCurrentTimestamp();
      if (!flight || !shouldRefreshFlight(flight, now)) return;

      const nowMs = now.getTime();
      const minimumRefreshInterval = refreshIntervalForFlight(flight, now);
      if (refreshInFlightRef.current) return;
      if (lastRefreshAtRef.current && nowMs - lastRefreshAtRef.current < minimumRefreshInterval) return;

      refreshInFlightRef.current = true;
      lastRefreshAtRef.current = nowMs;

      try {
        const result = await requestFlightLookup({
          flightNumber: flight.flightNumber,
          date: getLookupDate(flight)
        });

        if (!isActive || !result.ok) return;

        const refreshedFlight = preserveCurrentRouteId(
          createFlightFromExternalSeed(result.data),
          flight
        );

        await savePreparedFlight(refreshedFlight);
        if (isActive) setFlight(refreshedFlight);
      } finally {
        refreshInFlightRef.current = false;
      }
    }

    void refreshFlightIfNeeded();
    const timer = setInterval(refreshFlightIfNeeded, REFRESH_TIMER_MS);

    return () => {
      isActive = false;
      clearInterval(timer);
    };
  }, [flight, id]);

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
