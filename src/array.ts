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
} /** @scope default . */

export function filterNonNull<T>(arr: readonly T[]) {
  return arr.filter((x) => x !== undefined && x !== null) as NonNullable<T>[];
}
export function mapAsync<T, P>(arr: readonly T[], f: (_: T, index: number) => Promise<P>) {
  return Promise.all(arr.map(f));
}
