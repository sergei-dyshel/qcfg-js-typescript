/**
 * @file Typescript type definitions
 *
 *   Some are borrowed from:
 *
 *   - https://github.com/sindresorhus/type-fest
 */

export { type Optional } from "utility-types";

export type AnyFunction<T extends any[] = any[], R = any> = (...args: T) => R;

export type UnaryFunction<T = any, R = any> = AnyFunction<[T], R>;

export type FunctionWithArgs = (arg: any, ...args: any) => any;

export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/**
 * NOTE: Must used `undefined` because just using `void` wouldn't work, see
 * https://stackoverflow.com/questions/57951850/is-there-not-promise-type-in-typescipt
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type VoidFunction = (...args: any[]) => void | undefined;

export type IdentityFunction<T> = UnaryFunction<T, T>;

/**
 * Resolves only when for non-promise types.
 *
 * Usefull for type signatures for type functions.
 */
export type NotPromise<T> = T extends Promise<unknown> ? never : T;

export type SyncFunction<T = unknown> = (...args: unknown[]) => NotPromise<T>;

/** Something we can do `await on */
export type Awaitable<T> = T | Promise<T>;

export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** Add type `U` (e.g. null/undefined) into awaited type */
export type AwaitedUnion<T, U> = T extends Promise<infer R> ? Promise<R | U> : T | U;

/** Make only specific properties required, combines {@link Pick} and {@link Required} */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Deep(nested) variation of {@link Required}.
 *
 * Taken from
 * https://stackoverflow.com/questions/57835286/deep-recursive-requiredt-on-specific-properties.
 */
export type DeepRequired<T> = Required<{
  [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
}>;

/** For use with objects that are not a class */
export type PlainObject = Record<string, unknown>;

/** Object's property value type */
export type ValueOf<T> = T[keyof T];

/** Object entry type (as returned by {@link Object.entries}) */
export type RecordEntry<T> = T extends Record<infer K, infer V> ? [K, V] : never;

/** Array element type */
export type ElementType<T> = T extends ReadonlyArray<infer E> ? E : never;

/** Type for {@link Object.entries} */
export type Entries<T> = { [K in StringKeyOf<T>]: readonly [K, T[K]] }[StringKeyOf<T>][];

/** Type of last element of tuple */
export type Last<T extends [any, ...any[]]> = T extends [...infer _I, infer L] ? L : never;

/** All elements of tuple except for the first one */
export type Tail<T extends [any, ...any[]]> = T extends [infer _I, ...infer A] ? A : never;

export type AssertExtends<T, U> = T extends U ? T : never;

export type Equals<X, Y> = (() => X extends Y ? 1 : 2) extends () => Y extends X ? 1 : 2
  ? true
  : false;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type AssertTrue<_T extends true> = void;

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
 * Useful for making sure value's type extends (satisfies) given type without loosing type
 * information.
 *
 * It serves the same purpose as new Typescript 4.9 `satisfies` keyword.
 *
 * See:
 *
 * - https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator
 *
 * ```ts
 * const x = extendsType<string>()("hello");
 * // const x: "hello"
 *
 * const y = extendsType<string>()(123);
 * // error: Argument of type 'number' is not assignable to parameter of type 'string'
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T is used as constraint for inner function's E
export function extendsType<T>() {
  return <E extends T>(value: E): E => value;
}

/**
 * Extracts only keys of type T that are assignable to type `string`.
 */
// export type StringKeyOf<T> = Extract<keyof T, string>;

export type StringKeyOf<T> = keyof T & string;

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

/** Value that can be converted to array of zero, one or multiple elements */
export type Arrayable<T> = T | T[] | undefined;

/** Constructor function for given type */
export type ConstructorOf<T> = abstract new (...args: any[]) => T;

/**
 * Replace properties from T by properties with same name from U.
 *
 * NOTE: This is a better approach than just `T & U` because the later will also merge types of
 * properties with same name, not replace.
 */
export type Replace<T, U extends { [key in keyof T]: any }> = Omit<T, keyof U> & U;

/**
 * Generic type for comparison function used in algorithms and data structures.
 *
 * Should return negative if `x < y`, 0 if `x = y` and positive if `x > y`.
 */
export type CompareFunc<T> = (x: T, y: T) => number;

/**
 * Convert properties that can be undefined into optional.
 *
 * Also see
 * https://stackoverflow.com/questions/56146819/typescript-how-to-transfrom-undefined-property-to-optional-property
 */
export type OptionalFromUndefined<T extends object> = {
  // keys that can be undefined -> optional, without undefined
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<T[K], undefined>;
} & {
  // all other keys unchanged
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/** Check if function is constructor (not 100% accurate) */
export function isConstructor(func: Function) {
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return !!func.prototype && func.prototype.constructor === func;
}

export type FirstParameter<T extends (arg1: any, ...args: any) => any> = T extends (
  arg1: infer P,
  ...args: any
) => any
  ? P
  : never;

export function discardReturn<T extends AnyFunction>(func: T): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    func(...args);
  };
}

/**
 * Type that matches any type except for array
 *
 * See
 * https://stackoverflow.com/questions/61148466/typescript-type-that-matches-any-object-but-not-arrays
 */
export type NotArray = (Record<string, unknown> | string | bigint | number | boolean) & {
  length?: never;
};
