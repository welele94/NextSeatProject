export type ExpectedMovement = "smooth" | "light" | "moderate";

export interface EnvironmentContext {
  /**
   * Future-ready placeholder for pre-flight/environment signals.
   * This is intentionally not wired to weather APIs yet.
   */
  expectedMovement?: ExpectedMovement;
  weatherActivity?: boolean;
}
