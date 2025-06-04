export const GREETING = "Hello from @yellow-mobile/config";

export function loadConfig() {
  console.log("Loading configuration...");
  // In a real scenario, this function would load and return configuration.
  return {
    greeting: GREETING
  };
}
