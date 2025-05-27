/**
 * Utility function to simulate network latency
 * @param ms Milliseconds to delay (defaults to random between 100-200ms)
 * @returns Promise that resolves after the specified delay
 */
export function delay(ms?: number): Promise<void> {
  const delayTime = ms ?? 100 + Math.floor(Math.random() * 100);
  return new Promise(resolve => setTimeout(resolve, delayTime));
}
