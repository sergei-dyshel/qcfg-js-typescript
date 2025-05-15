import { AsyncCache } from "./cache";
import { jsonStableStringify } from "./json";
import { MapAdapter } from "./map";
import type { Awaitable } from "./types";

/**
 * Memoize async function.
 */
export function memoizeAsync<V, F extends (...args: any[]) => Awaitable<V>>(func: F): F {
  const cache = new AsyncCache<Parameters<F>, V>((params) => func(...params), {
    map: new MapAdapter((params) => jsonStableStringify(params)),
  });
  return ((...args: Parameters<F>) => cache.get(args)) as F;
}
