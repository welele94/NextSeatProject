import { createRelativeTimestamp } from "@/features/time/createRelativeTimestamp";
import { Flight } from "@/types/flight";

export const mockFlights: Flight[] = [
  {
    id: "mock-flight-2",
    flightNumber: "NS 105",
    airline: "Next Seat Airways",
    aircraftType: "Airbus A319",

    origin: {
      code: "LIS",
      name: "Humberto Delgado Airport",
      city: "Lisbon",
      country: "Portugal",
      coordinates: {
        latitude: 38.7742,
        longitude: -9.1342
      }
    },

    destination: {
      code: "OPO",
      name: "Francisco Sa Carneiro Airport",
      city: "Porto",
      country: "Portugal",
      coordinates: {
        latitude: 41.2481,
        longitude: -8.6814
      }
    },

    schedule: {
      // Pre-flight mock: departure is still ahead, so the app opens in preparation mode.
      scheduledDeparture: createRelativeTimestamp(45),
      scheduledArrival: createRelativeTimestamp(105),
      estimatedDurationMinutes: 60
    },

    routeDistanceKm: 280,

    routeCoordinates: [
      {
        id: "lis",
        label: "Lisbon",
        coordinates: { latitude: 38.7742, longitude: -9.1342 },
        distanceFromOriginKm: 0
      },
      {
        id: "central-portugal",
        label: "Central Portugal",
        coordinates: { latitude: 40.0, longitude: -8.4 },
        distanceFromOriginKm: 140
      },
      {
        id: "opo",
        label: "Porto",
        coordinates: { latitude: 41.2481, longitude: -8.6814 },
        distanceFromOriginKm: 280
      }
    ],

    checkpoints: [
      {
        id: "central-portugal-checkpoint",
        label: "Central Portugal",
        coordinates: { latitude: 40.0, longitude: -8.4 },
        distanceFromOriginKm: 140,
        expectedProgressPercent: 50,
        reassuranceMessageId: "steady-progress"
      },
      {
        id: "approach-porto",
        label: "Porto approach",
        coordinates: { latitude: 41.1, longitude: -8.65 },
        distanceFromOriginKm: 250,
        expectedProgressPercent: 90,
        reassuranceMessageId: "nearing-destination"
      }
    ]
  }
];

export function getMockFlightById(id: string): Flight | undefined {
  return mockFlights.find((flight) => flight.id === id);
}
