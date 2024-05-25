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
}
