import type { Coordinates } from "@/types/route";

import type { MapViewport } from "./projection";
import { clamp, isRealCoordinate } from "./projection";

const WORLD_VIEWPORT: MapViewport = {
  minLongitude: -180,
  maxLongitude: 180,
  minLatitude: -90,
  maxLatitude: 90
};

export function computeMapViewport(
  origin: Coordinates,
  destination: Coordinates,
  width: number,
  height: number
): MapViewport {
  if (!isRealCoordinate(origin) || !isRealCoordinate(destination)) return WORLD_VIEWPORT;

  const midpointLongitude = (origin.longitude + destination.longitude) / 2;
  const midpointLatitude = (origin.latitude + destination.latitude) / 2;

  const rawLongitudeSpan = Math.abs(destination.longitude - origin.longitude);
  const rawLatitudeSpan = Math.abs(destination.latitude - origin.latitude);

  // Keep the route comfortably inside the card while preserving regional context.
  let longitudeSpan = Math.max(rawLongitudeSpan * 1.45, 8);
  let latitudeSpan = Math.max(rawLatitudeSpan * 1.45, 6);

  const targetAspect = width / height;
  const currentAspect = longitudeSpan / latitudeSpan;

  if (currentAspect < targetAspect) {
    longitudeSpan = latitudeSpan * targetAspect;
  } else {
    latitudeSpan = longitudeSpan / targetAspect;
  }

  longitudeSpan = clamp(longitudeSpan, 8, 360);
  latitudeSpan = clamp(latitudeSpan, 6, 180);

  let minLongitude = midpointLongitude - longitudeSpan / 2;
  let maxLongitude = midpointLongitude + longitudeSpan / 2;
  let minLatitude = midpointLatitude - latitudeSpan / 2;
  let maxLatitude = midpointLatitude + latitudeSpan / 2;

  if (minLongitude < -180) {
    maxLongitude += -180 - minLongitude;
    minLongitude = -180;
  }
  if (maxLongitude > 180) {
    minLongitude -= maxLongitude - 180;
    maxLongitude = 180;
  }
  if (minLatitude < -90) {
    maxLatitude += -90 - minLatitude;
    minLatitude = -90;
  }
  if (maxLatitude > 90) {
    minLatitude -= maxLatitude - 90;
    maxLatitude = 90;
  }

  return {
    minLongitude,
    maxLongitude,
    minLatitude,
    maxLatitude
  };
}
