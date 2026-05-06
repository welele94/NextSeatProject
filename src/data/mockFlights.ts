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
      code: "MAD",
      name: "Adolfo Suárez Madrid–Barajas Airport",
      city: "Madrid",
      country: "Spain",
      coordinates: {
        latitude: 40.4983,
        longitude: -3.5676
      }
    },

    schedule: {
      // já passou bastante → estamos perto do fim
      scheduledDeparture: createRelativeTimestamp(-90),
      scheduledArrival: createRelativeTimestamp(15),
      estimatedDurationMinutes: 105
    },

    routeDistanceKm: 500,

    routeCoordinates: [
      {
        id: "lis",
        label: "Lisbon",
        coordinates: { latitude: 38.7742, longitude: -9.1342 },
        distanceFromOriginKm: 0
      },
      {
        id: "central-spain",
        label: "Central Spain",
        coordinates: { latitude: 39.5, longitude: -6.0 },
        distanceFromOriginKm: 250
      },
      {
        id: "mad",
        label: "Madrid",
        coordinates: { latitude: 40.4983, longitude: -3.5676 },
        distanceFromOriginKm: 500
      }
    ],

    checkpoints: [
      {
        id: "central-spain-checkpoint",
        label: "Central Spain",
        coordinates: { latitude: 39.5, longitude: -6.0 },
        distanceFromOriginKm: 250,
        expectedProgressPercent: 50,
        reassuranceMessageId: "steady-progress"
      },
      {
        id: "approach-madrid",
        label: "Madrid approach",
        coordinates: { latitude: 40.2, longitude: -3.7 },
        distanceFromOriginKm: 450,
        expectedProgressPercent: 90,
        reassuranceMessageId: "nearing-destination"
      }
    ]
  }

  
  
];

export function getMockFlightById(id: string): Flight | undefined {
  return mockFlights.find((flight) => flight.id === id);
}
