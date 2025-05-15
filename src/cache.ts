import type { MapLike } from "./map";
import type { Awaitable } from "./types";

/**
 * Cache results of async function.
 *
 * When not-yet-cached value is requested multiple times simultaneouly, the function will be called
 * only once.
 */
export class AsyncCache<K, V> {
  private readonly map: AsyncCache.MapType<K, V>;
  constructor(
    private readonly factory: (_: K) => Awaitable<V>,
    private readonly options?: {
      /** Entry expiration timeout */
      timeoutMs?: number;
      /**
       * Custom map for storing the cache, by default uses {@link Map}
       *
       * Useful when cache key cannot be used directly as Map key.
       */
      map?: AsyncCache.MapType<K, V>;
    },
  ) {
    this.map = options?.map ?? new Map<K, AsyncCache.MapValueType<V>>();
  }

  clear() {
    this.map.clear();
  }

  async get(key: K): Promise<V> {
    const entry = this.map.get(key);
    if (entry) {
      if (entry instanceof Promise) return entry;
      if (Date.now() - entry.time > (this.options?.timeoutMs ?? Infinity)) this.map.delete(key);
    }
    const promise = this.factory(key);
    if (promise instanceof Promise) {
      this.map.set(key, promise);
    }
    const value = promise instanceof Promise ? await promise : promise;
    this.map.set(key, { time: Date.now(), value });
    return value;
  }
}

export namespace AsyncCache {
  export type MapValueType<V> = Promise<V> | { time: number; value: V };
  export type MapType<K, V> = MapLike<K, MapValueType<V>>;
}
