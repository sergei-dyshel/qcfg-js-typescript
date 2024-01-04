export class LoggableError extends Error {
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
  constructor(message: string = "Assertion failed", ...data: unknown[]) {
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
