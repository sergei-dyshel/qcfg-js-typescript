import { deepEqual } from "node:assert";
import type { AnyFunction, AwaitedUnion, ConstructorOf } from "./types";

export { rejects as assertRejects, throws as assertThrows } from "node:assert/strict";

/**
 * Error that supports storing additional data for logging purposes.
 */
export class LoggableError extends Error {
  data?: unknown[];

  /** Prefix (e.g. namespace) to prepend to error name */
  protected static namePrefix?: string;

  constructor(
    message: string,
    options?: {
      cause?: unknown;
      data?: unknown[];
    },
  ) {
    super(message, { cause: options?.cause });
    this.data = options?.data;

    // get real subclass name in case of inherited constructor
    const self = this.constructor as unknown as typeof LoggableError;
    this.name = (self.namePrefix ?? "") + self.name;
  }

  static wrap(cause: unknown, message: string, ...data: unknown[]) {
    return new this(message, { cause, data });
  }

  static assert(
    condition: boolean | undefined | null,
    message: string,
    ...data: unknown[]
  ): asserts condition {
    if (!condition) {
      throw new this(message, { data });
    }
  }
}

/**
 * Should be used for asserting logic invariants in code.
 *
 * When this error is thrown, it means there is a bug in the code.
 */
export class AssertionError extends LoggableError {
  constructor(message = "Assertion failed", ...data: unknown[]) {
    super(message, { data });
  }
}

/**
 * Non-critical exception that usually abort flow.
 *
 * Must supply message, that will be shown to user.
 *
 * Also can override severity between `error/warn` that will apply to logging/notification.
 */
export class NonCriticalError extends LoggableError {
  constructor(
    message: string,
    protected options?: { severity?: "warn" | "error"; data?: unknown[] },
  ) {
    super(message, { data: options?.data });
  }

  get severity() {
    return this.options?.severity ?? "error";
  }
}

/**
 * Thrown when users cancels operation.
 *
 * Can be logged but should not be shown to user directly.
 */
export class UserCancelError extends NonCriticalError {
  constructor(message: string) {
    super(message, { severity: "warn" });
  }
}

/**
 * Traverses exception stack (using {@link Error.cause} property) and finds the first exception for
 * which given function returns non-null value.
 *
 * Useful to check if certain exception was originally caused by another exception.
 */
export function causedByReason<T>(
  err: unknown,
  getReason: (err: unknown) => T | undefined,
): T | undefined {
  const reason = getReason(err);
  if (reason) return reason;
  if (err instanceof Error) {
    const reason = causedByReason(err.cause, getReason);
    if (reason) return reason;
  }
  return undefined;
}

export function causedByInstance<T>(err: unknown, cls: ConstructorOf<T>): T | undefined {
  return causedByReason(err, (err) => (err instanceof cls ? err : undefined));
}

/**
 * Throw assertion error unconditionally.
 */
export function fail(message: string, ...data: unknown[]): never {
  throw new AssertionError(message, ...data);
}

export function assert(
  condition: boolean | undefined | null,
  message = "Assertion failed",
  ...data: unknown[]
): asserts condition {
  if (!condition) {
    fail(message, ...data);
  }
}

/**
 * Type-safe variant of {@link deepEqual} for use in testing.
 */
export function assertDeepEqual<T>(actual: T, expected: T) {
  deepEqual(actual, expected);
}

/**
 * Register custom error class formatter.
 *
 * Used by {@link formatError}.
 */
export function registerErrorFormatter<E extends Error, C extends new (...args: any[]) => E>(
  cls: C,
  format: (error: E) => string,
) {
  errorFormatters.push({ cls, format });
}

function errorMessage(error: Error): string {
  for (const { cls, format } of errorFormatters) {
    if (error instanceof cls) return format(error);
  }
  return error.message;
}

/** Produce single line error message, optionally including cause */
export function formatError(
  error: unknown,
  options?: {
    /** Hide error class name */
    hideName?: boolean;

    /** Recursively include all cause errors */
    showCause?: boolean;
  },
): string {
  if (error instanceof Error) {
    const errMsg = errorMessage(error);
    let msg = error.name === "Error" || options?.hideName ? errMsg : `${error.name}: ${errMsg}`;
    if (error.cause && options?.showCause)
      msg += ", caused by: " + formatError(error.cause, options);
    return msg;
  }
  return String(error);
}

export function assertNull<T>(
  val: T | undefined | null,
  message = "Value is not null/undefined",
  ...data: unknown[]
) {
  assert(val == null, message, ...data);
}

export function assertNotNull<T>(
  val: T,
  message = "Value is undefined/null",
  ...data: unknown[]
): asserts val is NonNullable<T> {
  assert(val !== undefined && val !== null, message, ...data);
}

/**
 * Assert that value is not null and return it, for use in expressions
 */
export function notNull<T>(val: T, message?: string, ...args: unknown[]): NonNullable<T> {
  assertNotNull(val, message, ...args);
  return val;
}

/**
 * Asserts value is instance of given class.
 */
export function assertInstanceOf<T, C extends T>(
  value: T,
  cls: Function & { prototype: C },
  message?: string,
  ...data: unknown[]
): asserts value is C {
  if (value instanceof cls) return;
  if (!message) {
    message = `Expected type '${cls.name}`;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const obj = value as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const objType = obj?.constructor?.name ?? typeof value;
    message += `, got ${String(objType)}`;
    if (data.length === 0) data = [value];
  }
  fail(message, ...data);
}

/**
 * Asserts value is instance of given class and returns it.
 */
export function asInstanceOf<T, C extends T>(value: T, cls: Function & { prototype: C }): C {
  assertInstanceOf(value, cls);
  return value as C;
}

/**
 * Similar to {@link assert} but thorws non-critical exception that should be presented to user in
 * non-disruptive way.
 */
export function check(condition: boolean, message: string): asserts condition {
  if (!condition) throw new NonCriticalError(message, { severity: "warn" });
}

/**
 * See {@link check}.
 */
export function checkNotNull<T>(val: T, message: string): asserts val is NonNullable<T> {
  if (val === undefined || val === null) throw new NonCriticalError(message);
}

export function wrapWithCatch<F extends AnyFunction, R>(
  func: F,
  catchHandler: (err: unknown) => R,
) {
  return (async (...args: unknown[]) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await func(...args);
    } catch (err) {
      return catchHandler(err);
    }
  }) as unknown as (...funcArgs: Parameters<F>) => AwaitedUnion<ReturnType<F>, R>;
}

const errorFormatters: {
  cls: new (...args: unknown[]) => Error;
  format: (error: any) => string;
}[] = [];
