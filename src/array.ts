import { fail } from "./error";
import { Iterator } from "./iterator";
import type { Arrayable, ConstructorOf } from "./types";

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

/** Remove all elements */
export function arrayClear<T>(array: T[]) {
  array.splice(0, array.length);
}

export function arrayFirstOf<T>(array: readonly T[], cond: (val: T) => boolean): T | undefined {
  const idx = array.findIndex(cond);
  if (idx === -1) return undefined;
  return array[idx];
}

export function arraySum(array: number[]): number {
  return array.reduce((a, b) => a + b, 0);
}

/** Group (sorted) array by binary predicate, return array of groups */
export function arrayGroup<T>(array: readonly T[], func: (x: T, y: T) => boolean) {
  return array.reduce<T[][]>((prev: T[][], cur: T) => {
    if (prev.length === 0 || !func(prev.at(-1)![0], cur)) {
      prev.push([cur]);
    } else {
      prev.at(-1)!.push(cur);
    }
    return prev;
  }, []);
}

/** Default comparison function for primitive types, for use with {@link Array.sort} */
export function defaultCompare<T>(a: T, b: T): number {
  if (typeof a === "string") return a.localeCompare(b as string);
  if (a instanceof Date) return a.getTime() - (b as Date).getTime();
  if (typeof a === "number") return a - (b as number);
  fail(`Invalid type of compare operands: ${typeof a} and ${typeof b}`);
}

/** Convert less-style comparison function to comparison function for use with {@link Array.sort} */
export function lessCompare<T>(lessFn: (a: T, b: T) => boolean) {
  return (a: T, b: T) => {
    if (lessFn(a, b)) return -1;
    if (lessFn(b, a)) return 1;
    return 0;
  };
}

/** Compose multiple compare function in lexicographic order */
export function composeCompare<T>(...comparators: Array<(a: T, b: T) => number>) {
  return (a: T, b: T) => {
    let cmp = 0;
    for (const comparator of comparators) {
      cmp = comparator(a, b);
      if (cmp !== 0) return cmp;
    }
    return cmp;
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
export function numberCompare<T>(x: T, y: T): number {
  const xNum = x as unknown as number;
  const yNum = y as unknown as number;
  if (xNum < yNum) return -1;
  if (xNum === yNum) return 0;
  return 1;
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

/**
 * Filters instances of given class(ctor) from array
 */
export function filterInstanceOf<T extends object, C extends ConstructorOf<T>>(
  arr: readonly T[],
  ctor: C,
): InstanceType<C>[] {
  return arr.filter((x) => x instanceof ctor) as InstanceType<C>[];
}

export function mapAsync<T, P>(arr: readonly T[], f: (_: T, index: number) => Promise<P>) {
  return Promise.all(arr.map(f));
}

export async function mapSync<T, P>(arr: readonly T[], f: (_: T, index: number) => Promise<P>) {
  const results: P[] = [];
  for (const x of arr) {
    results.push(await f(x, 0));
  }
  return results;
}

export async function filterAsync<T>(
  arr: readonly T[],
  f: (_: T, index: number) => Promise<boolean>,
) {
  const mapped = await mapAsync(arr, async (x, i) => [x, await f(x, i)] as const);
  return mapped.filter(([_, ok]) => ok).map(([x, _]) => x);
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

/** Convert scalar to array if needed */
export function normalizeArray<T>(x: Arrayable<T>): T[] {
  if (x === undefined) return [];
  if (Array.isArray(x)) return x;
  return [x];
}

/**
 * Binary search value and return its index.
 *
 * `mode` determines how to act when there is no exact match.
 *
 * In `left` mode return LARGEST `i` so that `a[i] <= x`. If already `a[0] > x`, return `0`.
 *
 * In `right` mode return SMALLEST `i` so that `a[i] >= x`. If already `a[n-1] < x`, return `n`.
 *
 * XXX: currently unused
 */
export function binarySearch<T>(
  this: ReadonlyArray<T>,
  value: T,
  compare = numberCompare,
  mode: "left" | "right" = "right",
): number {
  let left = 0;
  let right = this.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const cmp = compare(this[mid], value);

    if (mode === "left") {
      if (cmp > 0) right = mid;
      left = mid + 1;
    } else {
      if (cmp < 0) left = mid + 1;
      right = mid;
    }
  }
  return left;
}

/**
 * Indexes of all elements equal to given one See {@link Array.indexOf}.
 */
export function allIndexesOf<T>(array: T[], searchElement: T, fromIndex?: number): number[] {
  const inds: number[] = [];
  for (;;) {
    const ind = array.indexOf(searchElement, fromIndex);
    if (ind === -1) {
      break;
    } else {
      inds.push(ind);
      fromIndex = ind + 1;
    }
  }
  return inds;
}

/**
 * Iterate over array in order of provided index iterator
 */
export class ArrayIterator<T> implements IterableIterator<T> {
  constructor(
    private readonly array: ArrayLike<T>,
    private readonly numIter: IterableIterator<number>,
  ) {}

  next(): IteratorResult<T> {
    const numRes = this.numIter.next();
    if (numRes.done) return { done: true, value: undefined };
    return { done: false, value: this.array[numRes.value] };
  }

  [Symbol.iterator]() {
    return this;
  }
}

export function arrayIter<T>(array: readonly T[], start?: number, end?: number, step?: number) {
  if (step === 0) throw new Error("Can not have zero step");
  return new ArrayIterator<T>(array, Iterator.range(start ?? 0, end ?? array.length, step ?? 1));
}

export function arrayReverseIter<T>(array: readonly T[]) {
  return arrayIter(array, array.length - 1, 0, -1);
}

export function arrayReversed<T>(array: readonly T[]) {
  return [...arrayReverseIter(array)];
}

export function arrayPairIter<T>(array: readonly T[]) {
  return Iterator.zip(arrayIter(array, 0, array.length - 1), arrayIter(array, 1, array.length));
}
