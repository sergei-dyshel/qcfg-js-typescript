import { deepEqual } from "node:assert";
import type { AnyFunction, AwaitedUnion } from "./types";

export { rejects as assertRejects, throws as assertThrows } from "node:assert/strict";

export class LoggableError extends Error {
  data?: unknown[];
  protected static namePrefix?: string;

  constructor(
    message: string,
    options?: {
      cause?: unknown;
      data?: unknown[];
    },
  ) {
    super(message, { cause: options?.cause });
    const self = this.constructor as unknown as typeof LoggableError;
    this.name = (self.namePrefix ?? "") + self.name;
    this.data = options?.data;
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
 * Traverses exception stack (using {@link Error.cause} property) and finds the first exception for
 * which given function returns non-null value.
 *
 * Useful to check if certain exception was originally caused by another exception.
 */
export function errorCausedBy<T>(
  err: unknown,
  getReason: (err: unknown) => T | undefined,
): T | undefined {
  const reason = getReason(err);
  if (reason) return reason;
  if (err instanceof Error) {
    const reason = errorCausedBy(err.cause, getReason);
    if (reason) return reason;
  }
  return undefined;
}

export class AssertionError extends LoggableError {
  constructor(message = "Assertion failed", ...data: unknown[]) {
    super(message, { data });
  }
}

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

export function assertDeepEqual<T>(actual: T, expected: T) {
  deepEqual(actual, expected);
}

const errorFormatters: {
  cls: new (...args: unknown[]) => Error;
  format: (error: any) => string;
}[] = [];

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

export function assertNotNull<T>(
  val: T,
  message = "Value is undefined/null",
  ...data: unknown[]
): asserts val is NonNullable<T> {
  assert(val !== undefined && val !== null, message, ...data);
}

export function notNull<T>(val: T, message?: string, ...args: unknown[]): NonNullable<T> {
  assertNotNull(val, message, ...args);
  return val;
}

export class AbortError extends Error {
  constructor(cause?: unknown) {
    super("User cancelled the operation", { cause });
  }

  static is(err: unknown): boolean {
    return err instanceof AbortError || (err instanceof Error && AbortError.is(err.cause));
  }
}

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

export function asInstanceOf<T, C extends T>(value: T, cls: Function & { prototype: C }): C {
  assertInstanceOf(value, cls);
  return value as C;
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
