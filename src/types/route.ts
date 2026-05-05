export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type RoutePoint = {
  id: string;
  label: string;
  coordinates: Coordinates;
  distanceFromOriginKm: number;
};

export type Checkpoint = {
  name: String;
  timestamp: Date;
};

export type RouteCheckpoint = RoutePoint & {
  expectedProgressPercent: number;
  reassuranceMessageId?: string;
  metadata?: Record<string, string | number | boolean>;
};
