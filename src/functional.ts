import type { AnyFunction, UnaryFunction } from "./types";

export function pipe2<F1 extends AnyFunction, F2 extends UnaryFunction<ReturnType<F1>>>(
  f1: F1,
  f2: F2,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return (...args: Parameters<F1>) => f2(f1(...args)) as ReturnType<F2>;
}

export function identity<T>(arg: T): T {
  return arg;
}

/**
 * Takes function that does not accept undefined argument and returns function that accepts it and
 * returns undefined in that case
 */
export function liftOptional<T, Q>(f: (x: T) => Q): (x: T | undefined) => Q | undefined {
  return (x: T | undefined): Q | undefined => {
    if (x !== undefined) return f(x);
    return x as undefined;
  };
}
