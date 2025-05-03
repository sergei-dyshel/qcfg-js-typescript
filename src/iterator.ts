import { match, P } from "./pattern";

export namespace Iterator {
  /**
   * Get max element in sequence by providing compare function similar to {@link Array.sort}
   */
  export function max<T>(values: Iterable<T>, compare: (a: T, b: T) => number) {
    let max: T | undefined = undefined;

    for (const x of values) {
      if (max === undefined || compare(x, max) > 0) {
        max = x;
      }
    }

    return max;
  }

  export function min<T>(values: Iterable<T>, compare: (a: T, b: T) => number) {
    return max(values, (a, b) => -compare(a, b));
  }

  /**
   * Turn iterator over arrays into iterator over elements
   */
  export async function* flattenAsyncIterator<T>(iter: AsyncIterable<T[]>) {
    for await (const values of iter) for (const value of values) yield value;
  }

  export function* serialize<T>(...iters: IterableIterator<T>[]) {
    for (const iter of iters) {
      for (const value of iter) {
        yield value;
      }
    }
  }

  export function* filter<T>(iter: IterableIterator<T>, predicate: (value: T) => boolean) {
    for (const value of iter) {
      if (predicate(value)) yield value;
    }
  }

  export function count<T>(iter: IterableIterator<T>) {
    let count = 0;
    for (const _ of iter) count++;
    return count;
  }

  /**
   * Generate sequence of numbers from `start` to `end` (exclusive)
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  export function range(start: number, end: number, step: number): Generator<number, void>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  export function range(start: number, end: number): Generator<number, void>;
  export function range(end: number): Generator<number, void>;
  export function range(
    ...args: [number, number, number | undefined] | [number, number] | [number]
  ): Generator<number, void> {
    return match(args)
      .with([P.number, P.number, P.number.optional()], ([start, end, step]) =>
        rangeGenerator(start, end, step),
      )
      .with([P.number, P.number], ([start, end]) => rangeGenerator(start, end))
      .with([P.number], ([end]) => rangeGenerator(0, end))
      .exhaustive();
  }

  function* rangeGenerator(start: number, end: number, step?: number) {
    for (let i = start; i < end; i += step ?? 1) yield i;
  }
}
