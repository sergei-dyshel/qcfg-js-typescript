import * as Assert from "node:assert/strict";
export { Assert };

export class LoggableError extends Error {
  override name = "Error";
  data?: unknown[];

  constructor(
    message: string,
    options?: {
      cause?: unknown;
      data?: unknown[];
    },
  ) {
    super(message, { cause: options?.cause });
    this.data = options?.data;
  }

  static new(message: string, ...data: unknown[]) {
    return new LoggableError(message, { data });
  }

  static wrap(cause: unknown, message: string, ...data: unknown[]) {
    return new LoggableError(message, { cause, data });
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

export function assertNotNull<T>(
  val: T,
  message = "Value is undefined/null",
  ...data: unknown[]
): asserts val is NonNullable<T> {
  assert(val !== undefined && val !== null, message, ...data);
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
