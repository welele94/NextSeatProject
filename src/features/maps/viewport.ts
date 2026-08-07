import type { Coordinates } from "@/types/route";

import type { MapViewport } from "./projection";
import { clamp, isRealCoordinate } from "./projection";

const WORLD_VIEWPORT: MapViewport = {
  minLongitude: -180,
  maxLongitude: 180,
  minLatitude: -90,
  maxLatitude: 90
};

function routePaddingMultiplier(longitudeSpan: number, latitudeSpan: number): number {
  const largestSpan = Math.max(longitudeSpan, latitudeSpan);

  // Short hops need more surrounding geography to stay understandable. Long
  // routes already contain enough context, so excessive padding only makes the
  // route look tiny.
  if (largestSpan <= 5) return 2.0;
  if (largestSpan <= 12) return 1.65;
  if (largestSpan <= 35) return 1.4;
  if (largestSpan <= 80) return 1.25;
  return 1.15;
}

export function computeMapViewport(
  origin: Coordinates,
  destination: Coordinates,
  width: number,
  height: number
): MapViewport {
  if (!isRealCoordinate(origin) || !isRealCoordinate(destination)) return WORLD_VIEWPORT;

  const rawLongitudeSpan = Math.abs(destination.longitude - origin.longitude);
  const rawLatitudeSpan = Math.abs(destination.latitude - origin.latitude);

  // Routes crossing the date line need longitude wrapping rather than a normal
  // rectangular crop. Showing the world is safer than drawing a misleading
  // regional crop until that specialised case is implemented.
  if (rawLongitudeSpan > 180) return WORLD_VIEWPORT;

  const midpointLongitude = (origin.longitude + destination.longitude) / 2;
  const midpointLatitude = (origin.latitude + destination.latitude) / 2;
  const paddingMultiplier = routePaddingMultiplier(rawLongitudeSpan, rawLatitudeSpan);

  let longitudeSpan = Math.max(rawLongitudeSpan * paddingMultiplier, 7);
  let latitudeSpan = Math.max(rawLatitudeSpan * paddingMultiplier, 5.5);

  // Match the geographic crop to the actual card shape. This keeps the
  // latitude/longitude scale consistent instead of stretching the map to make
  // an arbitrary bounding box fit.
  const targetAspect = Math.max(width / height, 0.1);
  const currentAspect = longitudeSpan / latitudeSpan;

  if (currentAspect < targetAspect) {
    longitudeSpan = latitudeSpan * targetAspect;
  } else {
    latitudeSpan = longitudeSpan / targetAspect;
  }

  longitudeSpan = clamp(longitudeSpan, 7, 360);
  latitudeSpan = clamp(latitudeSpan, 5.5, 180);

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
