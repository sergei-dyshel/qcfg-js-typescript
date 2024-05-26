import { Mutex } from "async-mutex";
import { DefaultMap } from "./map";
import type { Awaitable } from "./types";

export class Lock extends Mutex {
  async with<T>(f: () => Awaitable<T>) {
    const release = await this.acquire();
    try {
      return await f();
    } finally {
      release();
    }
  }
}

export class LockMap<K> {
  private map = new DefaultMap<K, Lock>(() => new Lock());

  with<T>(key: K, f: () => Promise<T>) {
    return this.map.get(key).with(f);
  }
}
