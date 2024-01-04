/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AssertionError } from "./error";
import { isPlainObject } from "./object";
import { PlainObject } from "./types";

export class DeepMergeError extends AssertionError {}

export function deepMergeInto<T extends PlainObject>(target: T, ...sources: (T | undefined)[]) {
  DeepMergeError.assert(isPlainObject(target), "Merge target must be a plain object", target);
  for (const source of sources) {
    if (source === undefined) continue;
    DeepMergeError.assert(isPlainObject(source), "Merge source must be a plain object", source);
    for (const key in source) {
      const sourceVal = source[key];
      const targetVal = target[key];
      if (sourceVal === undefined) continue;
      if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
        (targetVal as unknown[]).push(...(sourceVal as unknown[]));
      } else if (isPlainObject(targetVal)) {
        DeepMergeError.assert(
          isPlainObject(sourceVal),
          "Can merge only plain object into plain object",
          sourceVal,
        );
        deepMergeInto(targetVal, sourceVal);
      } else target[key] = source[key];
    }
  }
}

export function deepMerge<T extends PlainObject>(...sources: (T | undefined)[]): T {
  const target = {} as T;
  deepMergeInto(target, ...sources);
  return target;
}
