import { RouteCheckpoint } from "@/types/route";

export function getNextCheckpoint(
  checkpoints: RouteCheckpoint[],
  progressPercent: number
): RouteCheckpoint | undefined {
  return [...checkpoints]
    .sort((a, b) => a.expectedProgressPercent - b.expectedProgressPercent)
    .find((checkpoint) => checkpoint.expectedProgressPercent > progressPercent);
}
