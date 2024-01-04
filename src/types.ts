/**
 * @file Typescript type definitions
 *
 *   Some are borrowed from:
 *
 *   - https://github.com/sindresorhus/type-fest
 */

export type AnyFunction = (...args: unknown[]) => unknown;

/** Make only specific properties required, combines {@link Pick} and {@link Required} */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/** For use with objects that are not a class */
export type PlainObject = Record<string, unknown>;
