import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { getMockFlightById } from "@/data/mockFlights";
import { getFlightSnapshot } from "@/features/flightSnapshot/getFlightSnapshot";
import { FlightSnapshot } from "@/features/flightSnapshot/types";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";

type UseFlightSnapshotResult = {
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

    return getFlightSnapshot(flight, currentTime);
  }, [flight, currentTime]);

  return {
    snapshot
  };
}
