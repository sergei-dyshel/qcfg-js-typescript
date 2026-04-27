export function gitShortHash(hash: string) {
  return hash.substring(0, 8);
}

export function callIfDefined<T>(f: ((_: T) => T) | undefined, p: T): T {
  return f ? f(p) : p;
}

/**
 * Create value holder that initializes lazily, e.g. on first use
 */
export function lazyValue<T>(initialize: () => T): () => T {
  let value: T;
  return () => {
    value ??= initialize();
    return value;
  };
}
