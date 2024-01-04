export function filterNonNull<T>(array: ReadonlyArray<T | null | undefined>): T[] {
  return array.filter((x) => x !== null && x !== undefined) as T[];
}
