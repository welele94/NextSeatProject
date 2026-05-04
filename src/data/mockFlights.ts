import { Flight } from "@/types/flight";

export const mockFlights: Flight[] = [
  {
    id: "mock-flight-1",
    flightNumber: "NS 421",
    airline: "Next Seat Airways",
    aircraftType: "Airbus A320",
    origin: {
      code: "OPO",
      name: "Francisco Sa Carneiro Airport",
      city: "Porto",
      country: "Portugal",
      coordinates: {
        latitude: 41.2481,
        longitude: -8.6814
      }
    },
    destination: {
      code: "FRA",
      name: "Frankfurt Airport",
      city: "Frankfurt",
      country: "Germany",
      coordinates: {
        latitude: 50.0379,
        longitude: 8.5622
      }
    },
    schedule: {
      scheduledDeparture: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
      scheduledArrival: new Date(Date.now() + 118 * 60 * 1000).toISOString(),
      estimatedDurationMinutes: 170
    },
    routeDistanceKm: 1650,
    routeCoordinates: [
      {
        id: "opo",
        label: "Porto",
        coordinates: { latitude: 41.2481, longitude: -8.6814 },
        distanceFromOriginKm: 0
      },
      {
        id: "northern-spain",
        label: "Northern Spain",
        coordinates: { latitude: 42.8169, longitude: -1.6432 },
        distanceFromOriginKm: 470
      },
      {
        id: "western-france",
        label: "Western France",
        coordinates: { latitude: 46.5802, longitude: 0.3404 },
        distanceFromOriginKm: 930
      },
      {
        id: "rhine-approach",
        label: "Rhine region",
        coordinates: { latitude: 49.0069, longitude: 8.4037 },
        distanceFromOriginKm: 1490
      },
      {
        id: "fra",
        label: "Frankfurt",
        coordinates: { latitude: 50.0379, longitude: 8.5622 },
        distanceFromOriginKm: 1650
      }
    ],
    checkpoints: [
      {
        id: "northern-spain-checkpoint",
        label: "Northern Spain",
        coordinates: { latitude: 42.8169, longitude: -1.6432 },
        distanceFromOriginKm: 470,
        expectedProgressPercent: 28,
        reassuranceMessageId: "over-checkpoint",
        metadata: {
          note: "Example route marker"
        }
      },
      {
        id: "western-france-checkpoint",
        label: "Western France",
        coordinates: { latitude: 46.5802, longitude: 0.3404 },
        distanceFromOriginKm: 930,
        expectedProgressPercent: 56,
        reassuranceMessageId: "steady-progress"
      },
      {
        id: "rhine-region-checkpoint",
        label: "Rhine region",
        coordinates: { latitude: 49.0069, longitude: 8.4037 },
        distanceFromOriginKm: 1490,
        expectedProgressPercent: 90,
        reassuranceMessageId: "nearing-destination"
      }
    ]
  }
];

export function getMockFlightById(id: string): Flight | undefined {
  return mockFlights.find((flight) => flight.id === id);
}
