import { RouteCheckpoint } from "@/types/route";

export function getCurrentCheckpoint(
  checkpoints: RouteCheckpoint[],
  progressPercent: number
): RouteCheckpoint | undefined {
  return [...checkpoints]
    .sort((a, b) => b.expectedProgressPercent - a.expectedProgressPercent)
    .find((checkpoint) => checkpoint.expectedProgressPercent <= progressPercent);
}
