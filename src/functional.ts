import type { AnyFunction, UnaryFunction } from "./types";

export function pipe2<F1 extends AnyFunction, F2 extends UnaryFunction<ReturnType<F1>>>(
  f1: F1,
  f2: F2,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
  return (...args: Parameters<F1>) => f2(f1(...args)) as ReturnType<F2>;
}

export function identity<T>(arg: T): T {
  return arg;
}
