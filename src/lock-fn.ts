/**
 * @file Locking in a "functional" paradigm.
 *
 *   Any lock can be represented as function that returns a (async) disposable "handle" (see
 *   [Symbol.dispose](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/dispose)
 *   ) that is used to unlock. This allows easy use, by using [using
 *   statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using)
 *   and simplify composition and modification of locks in a functional manner.
 *
 *   Since locking is already async, it's easier to require `Symbol.asyncDispose` even for cases where
 *   `Symbol.dispose` would be enough.
 */

import { setTimeout } from "node:timers/promises";
import type { Awaitable } from "./types";

/**
 * Lock handle that is used to release the lock.
 *
 * Note that in {@link AsyncDisposable} `Symbol.asyncDispose` should return promise-like void.
 * Javascript allows regular void return but Typescript typing was intentional, see
 * https://github.com/microsoft/TypeScript/issues/63299.
 */
export type LockFnHandle = AsyncDisposable;

/**
 * Lock function that returns a "handle" object.
 */
export type LockFn<H extends LockFnHandle = LockFnHandle> = () => Awaitable<H>;

/**
 * Lock function that is expected to return without acquiring (d.e. due to timeout or bailing out
 * early).
 */
export type TryLockFn<H extends LockFnHandle = LockFnHandle> = () => Awaitable<H | undefined>;

export async function withLockFn<H extends LockFnHandle, T>(
  lockFn: LockFn<H>,
  f: () => Awaitable<T>,
) {
  await using _ = await lockFn();
  return await f();
}

export function wrapWithLockFn<T extends any[], R>(
  lockFn: LockFn,
  fn: (...args: T) => Awaitable<R>,
): (...args: T) => Awaitable<R> {
  return (...args) => withLockFn(lockFn, () => fn(...args));
}

/**
 * Augument lock function with pre/post acquire/release hooks.
 *
 * - If `preAcquire` throws, lock is not acquired
 * - `postAcquire` is called only if acquired. If it throws, we release the handle and rethrow.
 * - If `preRelease` throws, we still release the handle.
 * - `postRelease` only called if released.
 */
export function lockFnWithHooks(
  lockFn: LockFn,
  hooks: {
    preAcquire?: () => Awaitable<void>;
    postAcquire?: () => Awaitable<void>;
    preRelease?: () => Awaitable<void>;
    postRelease?: () => Awaitable<void>;
  },
): LockFn {
  return async () => {
    await hooks.preAcquire?.();
    const handle = await lockFn();
    try {
      await hooks.postAcquire?.();
    } catch (err) {
      await handle[Symbol.asyncDispose]();
      throw err;
    }

    return {
      [Symbol.asyncDispose]: async () => {
        try {
          await hooks.preRelease?.();
        } finally {
          await handle[Symbol.asyncDispose]();
          await hooks.postRelease?.();
        }
      },
    };
  };
}

/**
 * Create lock function that aborts waiting after certain period of time.
 *
 * Requires base lock with cancellation mechanism. Cancel function is supposed to be sync and simple
 * and do not throw (e.g. `AbortSignal.abort`).
 */
export function lockFnWithTimeout(
  lockFn: LockFn,
  cancelFn: () => void,
  timeoutMs: number,
): TryLockFn {
  return async () => {
    const promise = lockFn();
    const handle = await Promise.race([promise, setTimeout(timeoutMs)]);
    // lockFn acquired
    if (handle) return handle;

    cancelFn();
    try {
      // lockFn returned despite cancellation, means acquired
      return await promise;
    } catch {
      // ignore error
      return undefined;
    }
  };
}
