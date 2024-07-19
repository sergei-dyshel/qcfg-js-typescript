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
interface RegExpMatchedGroups<S extends string> extends RegExpExecArray {
  groups?: ExtractGroupNames<S>;
}
