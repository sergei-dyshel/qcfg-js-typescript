/**
 * @file Typescript type definitions
 *
 *   Some are borrowed from:
 *
 *   - https://github.com/sindresorhus/type-fest
 */

export type AnyFunction = (...args: any[]) => any;

export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;

/**
 * Resolves only when for non-promise types.
 *
 * Usefull for type signatures for type functions.
 */
export type NotPromise<T> = T extends Promise<unknown> ? never : T;

export type SyncFunction<T = unknown> = (...args: unknown[]) => NotPromise<T>;

/** Something we can do `await on */
export type Awaitable<T> = T | Promise<T>;

/** Make only specific properties required, combines {@link Pick} and {@link Required} */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/** For use with objects that are not a class */
export type PlainObject = Record<string, unknown>;

/** Object's property value type */
export type ValueOf<T> = T[keyof T];

/** Object entry type (as returned by {@link Object.entries}) */
export type RecordEntry<T> = T extends Record<infer K, infer V> ? [K, V] : never;

/** Array element type */
export type ElementType<T> = T extends Array<infer E> ? E : never;
