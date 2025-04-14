// stolen from https://blog.ndpsoftware.com/2022/10/strong-typing-regexp
// also see https://github.com/phenax/typed-regex/blob/main/src/index.ts

type ExtractGroupNames<S extends string> = S extends `${string}(?<${infer Name}>${infer Rest}`
  ? Record<Name, string> & ExtractGroupNames<Rest>
  : Record<never, any>;

export class RegExpWithNamedGroups<S extends string> extends RegExp {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(source: S, flags?: string) {
    super(source, flags);
  }
  override exec(s: string) {
    return super.exec(s) as RegExpMatchedGroups<S> | null;
  }
}

// template-ized results type
export interface RegExpMatchedGroups<S extends string> extends RegExpExecArray {
  groups?: ExtractGroupNames<S>;
}

export type RegExpWithNamedGroupsType<R> =
  R extends RegExpWithNamedGroups<infer S> ? RegExpMatchedGroups<S> : never;

/**
 * Escape special RexExp characters in string
 *
 * Implementation taken from https://github.com/lodash/lodash/blob/4.17.15/lodash.js#L14273.
 */
export function escapeRegExp(s: string) {
  const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  const reHasRegExpChar = RegExp(reRegExpChar.source);
  return s && reHasRegExpChar.test(s) ? s.replace(reRegExpChar, "\\$&") : s;
}
