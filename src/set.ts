import { mapAsync, zipArrays } from "./array";
import { objectFromEntries } from "./object";

export function setEqual<T>(set1: Set<T>, set2: Set<T>) {
  return set1.symmetricDifference(set2).size === 0;
}

export function setAddFrom<T>(set: Set<T>, from: Iterable<T>) {
  for (const value of from) set.add(value);
}

/**
 * Map set with string keys to an object with those keys and mapped values.
 */
export async function mapSetToObjAsync<T extends string, R>(
  set: Set<T>,
  fn: (value: T) => Promise<R>,
) {
  const keys = [...set];
  const values = await mapAsync(keys, fn);
  return objectFromEntries(zipArrays(keys, values));
}

// Copied from lib.esnext.collection.d.ts to resolve TS errors
interface ReadonlySetLike<T> {
  /**
   * Despite its name, returns an iterator of the values in the set-like.
   */
  keys(): Iterator<T>;
  /**
   * @returns A boolean indicating whether an element with the specified value exists in the
   *   set-like or not.
   */
  has(value: T): boolean;
  /**
   * @returns The number of (unique) elements in the set-like.
   */
  readonly size: number;
}

/**
 * Create{@link Set}-like object for arbitrary type by providing an adapter - function that converts
 * from given key type to key type that works with {@link Map}
 *
 * If key=>adapter mapping should be 1:1, provide "sanitizer" function that will refine key value.
 */
export class SetAdapter<T, A> implements globalThis.Set<T> {
  protected readonly map: Map<A, T>;

  constructor(
    protected cbs: {
      /** Convert from key type to mappable adapter type */
      adapter: (_: T) => A;
      /** Sanitize key value to allow 1:1 mapping to adapter type */
      sanitizer?: (_: T) => T;
    },
    values: readonly T[] = [],
  ) {
    this.map = new Map<A, T>(values.map((x) => [cbs.adapter(x), this.sanitize(x)]));
  }

  private sanitize(value: T) {
    return this.cbs.sanitizer ? this.cbs.sanitizer(value) : value;
  }

  clear(): void {
    this.map.clear();
  }

  delete(value: T): boolean {
    return this.map.delete(this.cbs.adapter(value));
  }

  has(value: T): boolean {
    return this.map.has(this.cbs.adapter(value));
  }

  add(value: T): this {
    this.map.set(this.cbs.adapter(value), this.sanitize(value));
    return this;
  }

  get size(): number {
    return this.map.size;
  }

  forEach(callbackfn: (value: T, value2: T, set: globalThis.Set<T>) => void, thisArg?: any): void {
    for (const value of this.values()) callbackfn.call(thisArg, value, value, this);
  }

  *entries(): SetIterator<[T, T]> {
    for (const value of this.values()) yield [value, value];
  }

  keys() {
    return this.values();
  }
  values() {
    return this.map.values();
  }

  [Symbol.iterator](): SetIterator<T> {
    return this.values();
  }

  get [Symbol.toStringTag](): string {
    return new Set(this.values())[Symbol.toStringTag];
  }

  // see definitions in lib.esnext.collection.d.ts

  union<U>(_other: ReadonlySetLike<U>): Set<T | U> {
    throw new Error("Operation not supported");
  }

  intersection<U>(_other: ReadonlySetLike<U>): Set<T & U> {
    throw new Error("Operation not supported");
  }

  difference<U>(_other: ReadonlySetLike<U>): Set<T> {
    throw new Error("Operation not supported");
  }

  symmetricDifference<U>(_other: ReadonlySetLike<U>): Set<T | U> {
    throw new Error("Operation not supported");
  }

  isSubsetOf(_other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Operation not supported");
  }

  isSupersetOf(_other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Operation not supported");
  }

  isDisjointFrom(_other: ReadonlySetLike<unknown>): boolean {
    throw new Error("Operation not supported");
  }
}
