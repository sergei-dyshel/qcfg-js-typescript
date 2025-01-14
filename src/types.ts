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
export type ElementType<T> = T extends ReadonlyArray<infer E> ? E : never;

/** Type for {@link Object.entries} */
export type Entries<T> = { [K in keyof T]: readonly [K, T[K]] }[keyof T][];

/**
 * Similar to {@link Required} but allow undefined for transformed optional properties
 *
 * Example:
 *
 * ```ts
 * Complete<{ a: string; b?: string }>;
 * ```
 *
 * Is equivalent to
 *
 * ```ts
 * { a: string, b: string | undefined }
 * ```
 *
 * See
 * https://medium.com/terria/typescript-transforming-optional-properties-to-required-properties-that-may-be-undefined-7482cb4e1585
 */
export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined;
};

/**
 * Useful for making sure value's type extends given type without loosing type information
 *
 * ```ts
 * const x = extendsType<string>()("hello");
 * // const x: "hello"
 *
 * const y = extendsType<string>()(123);
 * // error: Argument of type 'number' is not assignable to parameter of type 'string'
 * ```
 */
export function extendsType<T>() {
  return <E extends T>(value: E) => value;
}

/**
 * Extracts only keys of type T that are assignable to type `string`.
 */
export type StringKeyOf<T> = Extract<keyof T, string>;

export type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type KebabToCamelCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${Capitalize<KebabToCamelCase<U>>}`
  : S;

export type KebabToCamelCaseKeys<T> = {
  [P in StringKeyOf<T> as KebabToCamelCase<P>]: T[P];
};

/** Specify that value still can be undefined despite its type */
export function canBeUndefined<T, N extends NonNullable<T>>(value: N): N | undefined {
  return value;
}
