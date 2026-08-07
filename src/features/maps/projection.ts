import type { Coordinates } from "@/types/route";

export type MapPoint = {
  x: number;
  y: number;
};

export type MapViewport = {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isRealCoordinate(coordinates: Coordinates): boolean {
  return coordinates.latitude !== 0 || coordinates.longitude !== 0;
}

export function projectToViewport(
  coordinates: Coordinates,
  viewport: MapViewport,
  width: number,
  height: number
): MapPoint {
  const longitude = clamp(coordinates.longitude, viewport.minLongitude, viewport.maxLongitude);
  const latitude = clamp(coordinates.latitude, viewport.minLatitude, viewport.maxLatitude);

  return {
    x: ((longitude - viewport.minLongitude) / (viewport.maxLongitude - viewport.minLongitude)) * width,
    y: ((viewport.maxLatitude - latitude) / (viewport.maxLatitude - viewport.minLatitude)) * height
  };
}

export function getEquirectangularImageStyle(
  viewport: MapViewport,
  width: number,
  height: number
) {
  const longitudeSpan = viewport.maxLongitude - viewport.minLongitude;
  const latitudeSpan = viewport.maxLatitude - viewport.minLatitude;
  const imageWidth = width * (360 / longitudeSpan);
  const imageHeight = height * (180 / latitudeSpan);

  return {
    width: imageWidth,
    height: imageHeight,
    left: -((viewport.minLongitude + 180) / 360) * imageWidth,
    top: -((90 - viewport.maxLatitude) / 180) * imageHeight
  };
}
