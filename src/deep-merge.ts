import { AssertionError } from "./error";
import { isPlainObject } from "./object";

export class DeepMergeError extends AssertionError {}

/**
 * Recursively merge source objects into target object.
 *
 * Rules for merging:
 *
 * - Arrays are fully overriden.
 * - Objects are merged recursively. Both missing and undefined values are assigned.
 */
export function deepMergeInto<T>(
  target: T,
  sources: (T | undefined)[],
  options?: {
    /** Only assign defaults, i.e. merge into missing (undefined) target values */
    defaultsOnly?: boolean;
  },
) {
  DeepMergeError.assert(isPlainObject(target), "Merge target must be a plain object", target);
  for (const source of sources) {
    if (source === undefined) continue;
    if (target === source) throw new DeepMergeError("Can't merge into itself");
    DeepMergeError.assert(isPlainObject(source), "Merge source must be a plain object", source);
    for (const key in source) {
      const sourceVal = source[key];
      let targetVal = target[key];
      if (sourceVal === undefined) continue;
      if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
        (targetVal as unknown[]).push(...(sourceVal as unknown[]));
      } else if (isPlainObject(sourceVal)) {
        if (targetVal === undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (target as any)[key] = targetVal = {};
        } else if (!isPlainObject(targetVal))
          throw new DeepMergeError("Can not merge plain object into non-plain object", sourceVal);
        deepMergeInto(targetVal, [sourceVal], options);
      } else {
        // source value is not a plain object, so just assign
        if (isPlainObject(targetVal))
          throw new DeepMergeError("Can not merge non-plain object into plain object", sourceVal);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (targetVal === undefined || !options?.defaultsOnly) (target as any)[key] = sourceVal;
      }
    }
  }
}

/**
 * Recursively merge multiple objects.
 *
 * See {@link deepMergeInto}.
 */
export function deepMerge<T>(...sources: (T | undefined)[]): T {
  const target = {} as T;
  deepMergeInto(target, sources);
  return target;
}

/** Like {@link deepMerge } but only merge missing values */
export function deepMergeDefaults<T>(...sources: (T | undefined)[]): T {
  const target = {} as T;
  deepMergeInto(target, sources, { defaultsOnly: true });
  return target;
}
