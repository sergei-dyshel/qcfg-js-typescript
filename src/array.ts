import { fail } from "./error";
import { Iterator } from "./iterator";
import type { Arrayable, CompareFunc, ConstructorOf } from "./types";

export function diffArrays<T>(
  a: T[],
  b: T[],
  equal: (x: T, y: T) => boolean,
): [onlyA: T[], onlyB: T[], common: T[]] {
  const onlyA: T[] = [];
  const onlyB: T[] = [];
  const common: T[] = [];

  for (const x of a) {
    if (b.filter((y) => equal(x, y)).length === 0) onlyA.push(x);
    else common.push(x);
  }
  for (const y of b) {
    if (a.filter((x) => equal(x, y)).length === 0) onlyB.push(y);
  }
  return [onlyA, onlyB, common];
}

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

/**
 * Remove first element matching condition.
 *
 * Return true if found.
 */
export function arrayRemoveFirstOf<T>(array: T[], cond: (val: T) => boolean): boolean {
  const index = array.findIndex(cond);
  if (index != -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
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

export function lexicographicCompare<T>(...keys: Array<(_: T) => unknown>) {
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

function defaultEquals<T>(a: T, b: T) {
  return a === b;
}

export function arrayEquals<T>(
  arr: readonly T[],
  other: readonly T[],
  eq: (x: T, y: T) => boolean = defaultEquals,
) {
  if (arr.length !== other.length) return false;
  for (let i = 0; i < arr.length; ++i) if (!eq(arr[i], other[i])) return false;
  return true;
}

export function sortUniq<T>(arr: T[], compareFn?: (a: T, b: T) => number) {
  compareFn ??= defaultCompare<T>;
  arr.sort(compareFn);
  for (let i = arr.length - 1; i > 0; i--) {
    if (compareFn(arr[i], arr[i - 1]) === 0) arr.splice(i, 1);
  }
  return arr;
}

/** Array of unique elements (works on unsorted too) */
export function arrayUniq<T>(array: T[], equals: (x: T, y: T) => boolean): T[] {
  return array.reduce<T[]>(
    (unique, item) => (unique.some((item1) => equals(item, item1)) ? unique : [...unique, item]),
    [],
  );
}

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

export function reverseIter<T>(array: readonly T[]) {
  return arrayIter(array, array.length - 1, 0, -1);
}

export function arrayReversed<T>(array: readonly T[]) {
  return [...reverseIter(array)];
}

export function pairIter<T>(array: readonly T[]) {
  return Iterator.zip(arrayIter(array, 0, array.length - 1), arrayIter(array, 1, array.length));
}

/** Sort by key extracted from operands */
export function sortByKey<T, K>(array: T[], keyFn: (_: T) => K, compareFn?: CompareFunc<K>) {
  const cmp = compareFn ?? defaultCompare;
  return array.sort((a: T, b: T) => cmp(keyFn(a), keyFn(b)));
}

export function arraySorted<T>(array: T[], cmp?: CompareFunc<T>): T[] {
  return array.slice().sort(cmp);
}

/** Sort elements so that keys will be ordered as in given array */
export function sortInKeyOrder<T, K>(array: T[], keyFn: (_: T) => K, keys: K[]) {
  return sortByKey(array, keyFn, (k1, k2) => defaultCompare(keys.indexOf(k1), keys.indexOf(k2)));
}

/**
 * Maximum element of array.
 *
 * @param cmp Returns negative if x < y, 0 if x === y and positive if x > Y
 */
export function max<T>(array: readonly T[], cmp: CompareFunc<T> = numberCompare) {
  if (!array.length) return;
  return array.reduce((x, y) => (cmp(x, y) < 0 ? y : x));
}

/**
 * Minimum element of array.
 *
 * @param cmp See {@linkcode max}
 */
export function min<T>(array: readonly T[], cmp: CompareFunc<T> = numberCompare) {
  if (!array.length) return;
  return array.reduce((x, y) => (cmp(x, y) < 0 ? x : y));
}

export function removeFirst<T>(array: T[], val: T): boolean {
  const index = array.indexOf(val);
  if (index === -1) return false;
  array.splice(index, 1);
  return true;
}

export function forEachReverse<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => void,
): void {
  array.reduceRight((_, cur, index, array) => {
    callbackfn(cur, index, array);
    return undefined;
  }, undefined);
}

/**
 * Construct sparse array out of (index, value) pairs
 *
 * See https://www.freecodecamp.org/news/sparse-and-dense-arrays-in-javascript/ for more details.
 */
export function sparseArray<T>(elements: Iterable<[number, T]>): T[] {
  const arr: T[] = [];
  for (const [index, value] of elements) arr[index] = value;
  return arr;
}

/**
 * Find duplicates in array.
 *
 * NOTE: Compares using `===` operator (`indexOf`)..
 */
export function arrayFindDuplicates<T>(array: readonly T[]) {
  return array.filter((value, index) => array.indexOf(value) !== index);
}
