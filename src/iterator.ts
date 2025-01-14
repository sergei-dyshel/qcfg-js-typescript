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
