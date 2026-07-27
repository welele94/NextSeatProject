import { useGlobalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { getMockFlightById, mockFlights } from "@/data/mockFlights";
import { getPreparedFlight } from "@/features/flightLookup/preparedFlightStorage";
import { getFlightSnapshot } from "@/features/flightSnapshot/getFlightSnapshot";
import { FlightSnapshot } from "@/features/flightSnapshot/types";
import { getCurrentTimestamp } from "@/features/time/getCurrentTimestamp";
import { Flight } from "@/types/flight";

type UseFlightSnapshotResult = {
  snapshot?: FlightSnapshot;
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
        if (isActive) {
          setFlight(mockFlights[0]);
        }
        return;
      }

      const preparedFlight = await getPreparedFlight(id);
      const resolvedFlight = preparedFlight ?? getMockFlightById(id) ?? mockFlights[0];

      if (isActive) {
        setFlight(resolvedFlight);
      }
    }

    void loadFlight();

    return () => {
      isActive = false;
    };
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
