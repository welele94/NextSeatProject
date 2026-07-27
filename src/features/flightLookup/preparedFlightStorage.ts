import { Flight } from "@/types/flight";

const STORAGE_PREFIX = "next-seat:prepared-flight:";
const memoryStore = new Map<string, Flight>();

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

export async function savePreparedFlight(flight: Flight): Promise<void> {
  memoryStore.set(flight.id, flight);

  try {
    globalThis.localStorage?.setItem(storageKey(flight.id), JSON.stringify(flight));
  } catch {
    // Memory storage keeps the current session working when localStorage is unavailable.
  }
}

export async function getPreparedFlight(id: string): Promise<Flight | undefined> {
  const memoryFlight = memoryStore.get(id);
  if (memoryFlight) return memoryFlight;

  try {
    const stored = globalThis.localStorage?.getItem(storageKey(id));
    if (!stored) return undefined;

    const parsed = JSON.parse(stored) as Flight;
    memoryStore.set(id, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}

export async function removePreparedFlight(id: string): Promise<void> {
  memoryStore.delete(id);
  try {
    globalThis.localStorage?.removeItem(storageKey(id));
  } catch {
    // The in-memory copy is already removed.
  }
}
