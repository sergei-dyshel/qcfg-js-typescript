/** Subset of {@link Map} */
export interface MapLike<K, V> {
  clear: () => void;
  delete: (key: K) => boolean;
  get: (key: K) => V | undefined;
  has: (key: K) => boolean;
  set: (key: K, value: V) => this;
  readonly size: number;
  values(): IterableIterator<V>;
}

/**
 * Allows mapping from arbitrary type by providing an adapter - function that converts from given
 * key type to key type that works with {@link Map}
 */
export class MapAdapter<K, V, A> implements MapLike<K, V> {
  private readonly map: Map<A, V>;

  constructor(private readonly adapter: (_: K) => A) {
    this.map = new Map<A, V>();
  }

  clear(): void {
    this.map.clear();
  }

  delete(key: K): boolean {
    return this.map.delete(this.adapter(key));
  }

  get(key: K): V | undefined {
    const a = this.adapter(key);
    return this.map.get(a);
  }

  has(key: K): boolean {
    return this.map.has(this.adapter(key));
  }

  set(key: K, value: V): this {
    this.map.set(this.adapter(key), value);
    return this;
  }

  get size(): number {
    return this.map.size;
  }

  values() {
    return this.map.values();
  }
}

export class UniversalMap<K, V, A> implements Map<K, V> {
  private readonly map = new Map<A, { key: K; value: V }>();

  constructor(private readonly adapter: (_: K) => A) {}

  clear(): void {
    this.map.clear();
  }

  delete(key: K): boolean {
    return this.map.delete(this.adapter(key));
  }

  get(key: K): V | undefined {
    const entry = this.map.get(this.adapter(key));
    if (entry) return entry.value;
    return;
  }

  has(key: K): boolean {
    return this.map.has(this.adapter(key));
  }

  set(key: K, value: V): this {
    this.map.set(this.adapter(key), { key, value });
    return this;
  }

  get size(): number {
    return this.map.size;
  }

  *entries(): IterableIterator<[K, V]> {
    for (const entry of this.map.values()) yield [entry.key, entry.value];
  }

  *values() {
    for (const entry of this.map.values()) yield entry.value;
  }

  *keys(): IterableIterator<K> {
    for (const entry of this.map.values()) yield entry.key;
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    for (const entry of this.map.values()) callbackfn.call(thisArg, entry.value, entry.key, this);
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  get [Symbol.toStringTag](): string {
    return new Map(this)[Symbol.toStringTag];
  }
}

export class DefaultMap<K, V> extends Map<K, V> {
  constructor(protected readonly func: (_: K) => V) {
    super();
  }

  override get(k: K): V {
    let value = super.get(k);
    if (value === undefined) {
      value = this.func(k);
      this.set(k, value);
    }
    return value;
  }
}
