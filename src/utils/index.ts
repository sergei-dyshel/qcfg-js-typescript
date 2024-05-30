export * from "./disposable";

export function callIfDefined<T, F extends (_: T) => T>(f: F | undefined, p: T): T {
  return f ? f(p) : p;
}
