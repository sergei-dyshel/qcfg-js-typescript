export function* mapSet<T, V>(set: Set<T>, fn: (value: T) => V) {
  for (const value of set) yield fn(value);
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
 * Allows mapping from arbitrary type by providing an adapter - function that converts from given
 * key type to key type that works with {@link Map}
 */
export class SetAdapter<T, A> implements Set<T> {
  protected readonly map: Map<A, T>;

  constructor(
    protected cbs: { adapter: (_: T) => A; sanitizer?: (_: T) => T },
    values: readonly T[] = [],
  ) {
    this.map = new Map<A, T>(values.map((x) => [cbs.adapter(x), x]));
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
    this.map.set(this.cbs.adapter(value), this.cbs.sanitizer ? this.cbs.sanitizer(value) : value);
    return this;
  }

  get size(): number {
    return this.map.size;
  }

  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    for (const value of this.values()) callbackfn.call(thisArg, value, value, this);
  }

  *entries(): IterableIterator<[T, T]> {
    for (const value of this.values()) yield [value, value];
  }
  keys() {
    return this.values();
  }
  values() {
    return this.map.values();
  }

  [Symbol.iterator](): IterableIterator<T> {
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
