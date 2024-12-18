/**
 * Return array or pariwise combinations of two arrays
 *
 * Pairs([x, y], [a, b]) => [[x, a], [x, b], [y, a], [y, b]]
 */
export function pairs<X, Y>(xArr: readonly X[], yArr: readonly Y[]) {
  const res: [X, Y][] = [];
  for (const x of xArr) for (const y of yArr) res.push([x, y]);

  return res;
}

export function arrayRemove<T>(array: T[], item: T): boolean {
  const index = array.indexOf(item);
  if (index != -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

/** Default comparison function for primitive types, for use with {@link Array.sort} */
export function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a === b) return 0;
  return 1;
}

/** Convert less-style comparison function to comparison function for use with {@link Array.sort} */
export function lessCompare<T>(lessFn: (a: T, b: T) => boolean) {
  return (a: T, b: T) => {
    if (lessFn(a, b)) return -1;
    if (lessFn(b, a)) return 1;
    return 0;
  };
}

export function lexicographicCompare<T, V>(...keys: Array<(_: T) => V>) {
  return (a: T, b: T) => {
    for (const key of keys) {
      const cmp = defaultCompare(key(a), key(b));
      if (cmp !== 0) return cmp;
    }
    return 0;
  };
}
export function arrayEquals<T>(arr: readonly T[], other: readonly T[]) {
  if (arr.length !== other.length) return false;
  for (let i = 0; i < arr.length; i++) if (arr[i] !== other[i]) return false;
  return true;
}
export function sortUniq<T>(arr: T[], compareFn?: (a: T, b: T) => number) {
  if (!compareFn) compareFn = defaultCompare<T>;
  arr.sort(compareFn);
  for (let i = arr.length - 1; i > 0; i--) {
    if (compareFn(arr[i], arr[i - 1]) === 0) arr.splice(i, 1);
  }
  return arr;
} /** @scopeDefault . */

export function filterNonNull<T>(arr: readonly T[]) {
  return arr.filter((x) => x !== undefined && x !== null) as NonNullable<T>[];
}
export function mapAsync<T, P>(arr: readonly T[], f: (_: T, index: number) => Promise<P>) {
  return Promise.all(arr.map(f));
}

/** Create bbject with array elements as keys and values by applying function to each element */
export function mapToObjectValues<K extends PropertyKey, V>(
  arr: readonly K[],
  f: (_: K) => V,
): Record<K, V> {
  // Object.fromEntries is typed as returning only string-valued keys
  // but https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
  // describes that it can create symbols as keys too
  return Object.fromEntries(arr.map((k) => [k, f(k)])) as Record<K, V>;
}

export function zipArrays<T1, T2>(a: readonly T1[], b: readonly T2[]): Array<[T1, T2]> {
  return a.map((k, i) => [k, b[i]]);
}

/**
 * Map array through function and filter out those returned `undefined`. Return array of [value,
 * mapped value] pairs.
 */
export async function mapSomeAsyncAndZip<V, R>(
  arr: readonly V[],
  func: (v: V) => Promise<R | undefined>,
): Promise<Array<[V, R]>> {
  const results: Array<R | undefined> = await mapAsync(arr, func);
  return zipArrays(arr, results).filter((tuple) => tuple[1] !== undefined) as Array<[V, R]>;
}

/**
 * Map array through function and filter out those returned MAP_UNDEFINED. Return array of mapped
 * values.
 */
export async function mapSomeAsync<V, R>(
  arr: readonly V[],
  func: (v: V) => Promise<R | undefined>,
): Promise<R[]> {
  const zip = await mapSomeAsyncAndZip(arr, func);
  return zip.map((pair) => pair[1]);
}
