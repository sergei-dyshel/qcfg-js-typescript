import { PlainObject } from "./types";

/** Return copy of object with undefined values removed */
export function omitUndefinedValues<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Assign default values for missing or undefined values*/
export function assignDefaults<T extends object>(obj: T, defaults: Partial<T>): T {
  return { ...defaults, ...omitUndefinedValues(obj) };
}

export function isPlainObject(obj: unknown): obj is PlainObject {
  if (!(typeof obj === "object")) return false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const prototype = Object.getPrototypeOf(obj);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}
