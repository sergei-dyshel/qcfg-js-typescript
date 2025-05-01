export class AsyncCache<K, V> {
  private readonly map = new Map<K, Promise<V> | { time: number; value: V }>();
  constructor(
    private readonly factory: (_: K) => Promise<V>,
    private readonly options?: {
      timeoutMs: number;
    },
  ) {}

  clear() {
    this.map.clear();
  }

  async get(key: K): Promise<V> {
    const entry = this.map.get(key);
    if (entry) {
      if (entry instanceof Promise) return entry;
      if (Date.now() - entry.time > (this.options?.timeoutMs ?? Infinity)) this.map.delete(key);
    }
    const promise = this.factory(key);
    this.map.set(key, promise);
    const value = await promise;
    this.map.set(key, { time: Date.now(), value });
    return value;
  }
}
