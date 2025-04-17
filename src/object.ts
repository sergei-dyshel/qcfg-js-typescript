/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { defaultCompare, mapAsync } from "./array";
import type { Awaitable, Complete, Entries, PlainObject } from "./types";

/** Return copy of object with undefined values removed */
export function omitUndefinedValues<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Object is plain Javascript object, not a class instance */
export function isPlainObject(obj: unknown): obj is PlainObject {
  if (!(obj && typeof obj === "object")) return false;
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
 * If object is undefined, return undefined.
 *
 * Also see {@link Omit}
 */
export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K>;
export function omit<T extends object, K extends keyof T>(
  obj: T | undefined,
  ...keys: K[]
): Omit<T, K> | undefined;
export function omit(obj: undefined, ...keys: string[]): undefined;
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function omit(obj: any | undefined, ...keys: string[]): object | undefined {
  if (obj === undefined) return undefined;
  const ret: any = {};
  for (const key in obj) if (!keys.includes(key)) ret[key] = obj[key];
  return ret;
}

/** Map values of object, leaving keys intact. */
export function mapValues<V, R>(
  obj: Record<string, V>,
  func: (k: string, v: V) => R,
): Record<string, R> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, func(key, value)]));
}

/** Async version of {@link mapValues} */
export async function mapValuesAsync<V, R>(
  obj: Record<string, V>,
  func: (k: string, v: V) => Awaitable<R>,
): Promise<Record<string, R>> {
  return objectFromEntries(
    await mapAsync(objectEntries(obj), async ([key, value]) => [key, await func(key, value)]),
  );
}

/**
 * Return new object with filtered entries
 */
export function filterObjectEntries<K extends string, V>(
  obj: Record<K, V>,
  filter: (key: K, value: V) => boolean,
) {
  return objectFromEntries(objectEntries(obj).filter(([key, value]) => filter(key, value)));
}

/**
 * Return new object with keys mapped through provided function.
 */
export function mapKeys<K extends string, V, R extends string>(
  obj: Record<K, V>,
  func: (k: K, v: V) => R,
): Record<R, V> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [func(key as K, value as V), value]),
  ) as Record<R, V>;
}

/**
 * Construct new object with keys mapped recursively.
 *
 * Only transforms plain objects and arrays.
 */
export function mapKeysDeep(obj: any, func: (key: string) => string): any {
  // Look at https://github.com/sindresorhus/map-obj/blob/main/index.js for another impl
  // Look at https://github.com/sindresorhus/camelcase-keys/blob/main/index.js for changing keys case with caching.
  if (Array.isArray(obj)) return obj.map((elem) => mapKeysDeep(elem, func));
  if (typeof obj === "object" && isPlainObject(obj))
    return mapEntries(obj, (key, value) => [func(key), mapKeysDeep(value, func)] as const);
  return obj;
}

/** Map both keys and values of object. */
export function mapEntries<K1 extends string, V1, K2 extends string, R2>(
  obj: Record<K1, V1>,
  func: (k: K1, v: V1) => readonly [K2, R2],
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

/** Typed version of {@link Object.keys} */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Typed version of {@link Object.entries}
 *
 * If type of object has optional properties one may need to transform type with {@link Complete}.
 */
export function objectEntries<T extends object>(obj: T) {
  return Object.entries(obj) as unknown as Entries<T>;
}

/** Typed version of {@link Object.fromEntries} */
export const objectFromEntries = <const T extends ReadonlyArray<readonly [PropertyKey, unknown]>>(
  entries: T,
): { [K in T[number] as K[0]]: K[1] } =>
  Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
