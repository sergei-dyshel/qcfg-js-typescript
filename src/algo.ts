/**
 * @file Various algorithms
 */

import { numberCompare } from "./array";
import type { Awaitable } from "./types";

/**
 * Binary search last index not satisfying predicate or first index specifying it
 *
 * Assumes that array elements are ordered as `[false, false, ....false, true, ..., true]`
 *
 * `mode` determines how to act when there is no exact match.
 *
 * In `left` mode return LARGEST index NOT satisfying predicate. If all elements satisfy (or empty),
 * return -1.
 *
 * In `right` mode return SMALLEST index satisfying predicate, if all elements satisfy (or empty),
 * return `array.length`.
 */
export function binarySearchPred<T>(
  arr: ReadonlyArray<T>,
  predicate: (_: T) => boolean,
  mode: "left" | "right",
): number {
  let [left, right] = mode === "left" ? [-1, arr.length - 1] : [0, arr.length];
  while (left < right) {
    const mid = (mode === "left" ? Math.ceil : Math.floor)((left + right) / 2);
    const satisfies = predicate(arr[mid]);

    switch (mode) {
      case "left":
        if (satisfies) right = mid - 1;
        else left = mid;
        break;
      case "right":
        if (satisfies) right = mid;
        else left = mid + 1;
    }
  }
  return left;
}

/**
 * Async version {@link binarySearchPred}
 */
export async function binarySearchPredAsync<T>(
  arr: ReadonlyArray<T>,
  predicate: (_: T) => Awaitable<boolean>,
  mode: "left" | "right",
): Promise<number> {
  let [left, right] = mode === "left" ? [-1, arr.length - 1] : [0, arr.length];
  while (left < right) {
    const mid = (mode === "left" ? Math.ceil : Math.floor)((left + right) / 2);
    const satisfies = await predicate(arr[mid]);

    switch (mode) {
      case "left":
        if (satisfies) right = mid - 1;
        else left = mid;
        break;
      case "right":
        if (satisfies) right = mid;
        else left = mid + 1;
    }
  }
  return left;
}

/**
 * Binary search value and return its index.
 *
 * Assumes array is sorted in non-strictly increasing order.
 *
 * `mode` determines how to act when there is no exact match.
 *
 * In `left` mode return LARGEST `i` so that `a[i] <= value`. If `a[0] > value` (or empty), return
 * `-1`.
 *
 * In `right` mode return SMALLEST `i` so that `a[i] >= value`. If `a[n-1] < value` (or empty),
 * return `array.length`.
 */
export function binarySearch<T>(
  array: ReadonlyArray<T>,
  value: T,
  compare = numberCompare,
  mode: "left" | "right",
): number {
  return binarySearchPred(
    array,
    mode === "left" ? (x) => !(compare(x, value) <= 0) : (x) => compare(x, value) >= 0,
    mode,
  );
}
