import type { Coordinates } from "@/types/route";

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

export function greatCircleRoute(
  origin: Coordinates,
  destination: Coordinates,
  samples = 32
): Coordinates[] {
  const lat1 = toRadians(origin.latitude);
  const lon1 = toRadians(origin.longitude);
  const lat2 = toRadians(destination.latitude);
  const lon2 = toRadians(destination.longitude);

  const delta = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
  ));

  if (!Number.isFinite(delta) || delta < 1e-6) {
    return Array.from({ length: samples }, () => origin);
  }

  const sinDelta = Math.sin(delta);

  return Array.from({ length: samples }, (_, index) => {
    const fraction = index / (samples - 1);
    const a = Math.sin((1 - fraction) * delta) / sinDelta;
    const b = Math.sin(fraction * delta) / sinDelta;

    const x = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
    const y = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);

    const latitude = Math.atan2(z, Math.sqrt(x * x + y * y));
    const longitude = Math.atan2(y, x);

    return {
      latitude: toDegrees(latitude),
      longitude: toDegrees(longitude)
    };
  });
}
