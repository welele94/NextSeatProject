import { getCurrentTimestamp } from "./getCurrentTimestamp";

export function createRelativeTimestamp(offsetMinutes: number): string {
    const now = getCurrentTimestamp();

    return new Date(now.getTime() + offsetMinutes * 60 * 1000).toISOString();
}