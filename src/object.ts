/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { defaultCompare } from "./array";
import type { PlainObject } from "./types";

/** Return copy of object with undefined values removed */
export function omitUndefinedValues<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Object is plain Javascript object, not a class instance */
export function isPlainObject(obj: unknown): obj is PlainObject {
  if (!(typeof obj === "object")) return false;
  const prototype = Object.getPrototypeOf(obj);
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}

/**
 * Subset of the object with given keys.
 *
 * Also see {@link Pick}.
 */
export function pick<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const ret: any = {};
  for (const key of keys) if (key in obj) ret[key] = obj[key];
  return ret;
}

/**
 * Subset of the object without given keys.
 *
 * Also see {@link Omit}
 */
export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const ret: any = {};
  for (const key in obj) if (!keys.includes(key as unknown as K)) ret[key] = obj[key];
  return ret;
}

/** Map values of object, leaving keys intact. */
export function mapValues<V, R>(
  obj: Record<string, V>,
  func: (k: string, v: V) => R,
): Record<string, R> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, func(key, value)]));
}

export function mapKeys<K extends string, V, R extends string>(
  obj: Record<K, V>,
  func: (k: K, v: V) => R,
): Record<R, V> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [func(key as K, value as V), value]),
  ) as Record<R, V>;
}

/** Map both keys and values of object. */
export function mapEntries<K1 extends string, V1, K2 extends string, R2>(
  obj: Record<K1, V1>,
  func: (k: K1, v: V1) => [K2, R2],
): Record<K2, R2> {
  const entries = Object.entries(obj).map(([key, value]) => func(key as K1, value as V1));
  return Object.fromEntries(entries) as Record<K2, R2>;
}

/** Return property of object or create it using provided factory */
export function objectGetOrSetProperty<T>(obj: any, name: PropertyKey, factory: () => T): T {
  let prop = obj[name] as T;
  if (!prop) {
    prop = factory();
    obj[name] = prop;
  }
  return prop;
}

/**
 * Return copy of object sorted by key.
 *
 * May be useful when serializing to JSON.
 */
export function sortObjectKeys(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).sort(([key1, _1], [key2, _2]) => defaultCompare(key1, key2)),
  );
}

export function objectKeys<T extends Record<string, any>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}
