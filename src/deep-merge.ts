import { AssertionError } from "./error";
import { isPlainObject } from "./object";

export class DeepMergeError extends AssertionError {}

export function deepMergeInto<T>(target: T, ...sources: (T | undefined)[]) {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else (target as any)[key] = source[key];
    }
  }
}

export function deepMerge<T>(...sources: (T | undefined)[]): T {
  const target = {} as T;
  deepMergeInto(target, ...sources);
  return target;
}
