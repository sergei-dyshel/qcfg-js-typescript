export * from "./disposable";

export * as Html from "./html";

export function gitShortHash(hash: string) {
  return hash.substring(0, 8);
}

export function callIfDefined<T, F extends (_: T) => T>(f: F | undefined, p: T): T {
  return f ? f(p) : p;
}
