import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  buildFlightSnapshot,
  FlightSnapshot
} from "@/features/flightSnapshot/buildFlightSnapshot";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";
import { getMockFlightById } from "@/data/mockFlights";
import { Flight } from "@/types/flight";

type UseFlightSnapshotResult = {
  flight?: Flight;
  snapshot?: FlightSnapshot;
};

export function useFlightSnapshot(): UseFlightSnapshotResult {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentTime, setCurrentTime] = useState(() => getCurrentTimestamp());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimestamp());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const flight = useMemo(() => {
    if (!id) {
      return undefined;
    }

    return getMockFlightById(id);
  }, [id]);

  const snapshot = useMemo(() => {
    if (!flight) {
      return undefined;
    }

    return buildFlightSnapshot(flight, currentTime);
  }, [flight, currentTime]);

  return {
    flight,
    snapshot
  };
}