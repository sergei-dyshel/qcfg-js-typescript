import { Mutex } from "../lock";
import { lockFnWithTimeout } from "../lock-fn";
import { suite, test } from "../testing";

void suite("lock-fn", () => {
  void test("with-timeout", async () => {
    const INTERVAL_MS = 10;
    const NUM_ITERS = 200;

    const stats = {
      acquired: 0,
      timedOut: 0,
    };

    const mutex = new Mutex();

    // use -1 to get more diverse results, i.e. both timedOut and acquire outcomes
    const tryLockFn = lockFnWithTimeout(mutex.lockFn, () => mutex.cancel(), INTERVAL_MS - 1);

    // Run several iterations to exercise the race between timeout and acquire.
    for (let i = 0; i < NUM_ITERS; i++) {
      // start async flow to hold lock
      const releaser = await mutex.acquire();
      const timer = setTimeout(releaser, INTERVAL_MS);

      await using handle = await tryLockFn();
      if (handle) stats.acquired++;
      else stats.timedOut++;

      timer.close();
      if (mutex.isLocked()) releaser();
    }

    console.log(stats);
  });
});
