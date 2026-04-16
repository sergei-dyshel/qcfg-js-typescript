import { default as dedent } from "ts-dedent";
import { memoizeWithExc } from "./memoize";
export { camelCase, kebabCase, snakeCase } from "case-anything";

export { dedent };

export function lowerCaseFirstLetter(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function fieldsToString(fields: Record<string, boolean>) {
  return Object.keys(fields)
    .filter((field) => fields[field])
    .join(", ");
}

export function removePrefix(str: string, prefix: string): string {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  }
  return str;
}

export function removeSuffix(str: string, suffix: string): string {
  if (str.endsWith(suffix)) {
    return str.substring(0, str.length - suffix.length);
  }
  return str;
}

/** Split out suffix matching regexp */
export function splitSuffixRegexp(str: string, suffix: RegExp): [string, string | undefined] {
  const match = new RegExp(`^(.*)(${suffix.source})$`).exec(str);
  if (match) {
    return [match[1], match[2]];
  }
  return [str, undefined];
}

export function upperCaseFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Like {@link dedent} but also replaces newlines with spaces.
 *
 * Useful for long text which will be reformatted anyway, e.g. by cmd-line parser.
 */
export function dedentAndJoin(s: TemplateStringsArray | string, ...args: unknown[]) {
  return dedent(s, ...args).replace(/\n/g, " ");
}

export class TemplateError extends Error {}

/**
 * Expand JS-style templates
 */
export function expandTemplate(
  text: string,
  substitute: Record<string, string | undefined>,
  throwWhenNotExist = false,
): string {
  return text.replaceAll(/\${([a-zA-Z\d]+)}/g, (_, varname: string) => {
    const sub = substitute[varname];
    if (sub === undefined) {
      if (throwWhenNotExist) throw new TemplateError(`Could not substitute var "${varname}"`);
      return "";
    }
    return sub;
  });
}

// REFACTOR: disallow undefined argument (can be done with callIfDefined)
export function parseNumber(s: string): number;
export function parseNumber(s: string | undefined): number | undefined;
export function parseNumber(s: string | undefined, default_: number): number;
export function parseNumber(s: string | undefined, default_?: number): number | undefined {
  if (s === undefined) return default_;
  const num = Number(s);
  if (Number.isNaN(num) || s === "") throw new Error(`${s} is not a number`);
  return num;
}

export function buildFuzzyPattern(query: string): string {
  const goodChars = query.replaceAll(/\W/g, "");
  return [...goodChars].join(".*");
}

export function fuzzyMatch(text: string, query: string): boolean {
  return text.search(new RegExp(buildFuzzyPattern(query), "i")) !== -1;
}

export function buildAbbrevPattern(query: string): string {
  const goodChars = query.replaceAll(/\W/g, "");
  const midPattern = [...goodChars]
    .map((ch) => {
      if (/[A-Za-z]/.test(ch)) {
        const lower = ch.toLowerCase();
        const upper = ch.toUpperCase();
        const anyCase = `(.*[^a-zA-Z])?[${lower}${upper}]`;
        const camelCase = `(.*[^A-Z])?${upper}`;
        return `(${anyCase}|${camelCase})`;
      }
      if (/\d+/.test(ch)) {
        return `(.*[^0-9])?${ch}`;
      }
      return `.*${ch}`;
    })
    .join("");
  return "^" + midPattern + ".*";
}

export function abbrevMatch(text: string, query: string): boolean {
  return text.search(new RegExp(buildAbbrevPattern(query))) !== -1;
}

// REFACTOR: merge this with split function below (see the STUB comment)
export function splitWithRemainder(str: string, regex: RegExp, limit: number): string[] {
  const result: string[] = [];
  while (str && limit) {
    const match = regex.exec(str);
    if (!match?.index) {
      result.push(str);
      break;
    }
    if (match[0].length === 0) throw new Error("Empty match inside split");
    result.push(str.slice(0, Math.max(0, match.index)));
    str = str.slice(Math.max(0, match.index + match[0].length));
    limit -= 1;
  }
  if (str !== "" || result.length === 0) result.push(str);
  return result;
}

export function ellipsize(str: string, maxLen: number, options?: { delimiter?: string }): string {
  if (str.length <= maxLen) return str;
  const delimiter = options?.delimiter ?? "...";
  const left = Math.ceil(maxLen / 2);
  const right = maxLen - left;
  return str.slice(0, left) + delimiter + str.slice(str.length - right);
}

/**
 * Similar to Python's split https://docs.python.org/3/library/stdtypes.html#str.split
 *
 * If `maxSplit` is given, at most `maxSplit` splits are done (thus, the list will have at most
 * `maxSplit+1` elements). If `maxSplit` is not specified or -1, then there is no limit on the
 * number of splits (all possible splits are made).
 */
export function split(str: string, separator: string | RegExp, maxSplit?: number): string[] {
  if (maxSplit === undefined) return str.split(separator);
  if (typeof separator === "string") {
    const parts = str.split(separator);
    return parts.slice(0, maxSplit).concat([parts.slice(maxSplit).join(separator)]);
  }
  // separator regexp
  // STUB: implement using lastIndex: https://stackoverflow.com/questions/41723539/efficient-regexp-matching-starting-from-given-index-within-string
  throw new Error("Not implemented");
}

/**
 * Search first occurence of pattern and return the match's [start, length]
 */
export function searchFirst(
  str: string,
  pattern: string | RegExp,
): [start: number, length: number, text: string] | undefined {
  if (typeof pattern === "string") {
    const start = str.indexOf(pattern);
    if (start === -1) return;
    return [start, pattern.length, pattern];
  }
  const match = pattern.exec(str);
  if (!match) return;
  return [match.index, match[0].length, match[0]];
}

export function searchLast(
  str: string,
  pattern: string | RegExp,
): [start: number, length: number, text: string] | undefined {
  if (typeof pattern === "string") {
    const start = str.lastIndexOf(pattern);
    if (start === -1) return;
    return [start, pattern.length, pattern];
  }
  const matches = [...str.matchAll(pattern)];
  if (matches.length === 0) return;
  const match = matches[matches.length - 1];
  return [match.index, match[0].length, match[0]];
}

export function dashesToUnderscores(str: string) {
  return str.replaceAll("-", "_");
}

export function underscoresToDashes(str: string) {
  return str.replaceAll("_", "-");
}

/**
 * Thrown by {@link expandTemplateLiteral} in case of template literal compiling/expanding error
 */
export class TemplateLiteralError extends Error {}

function buildTemplateFunction(keys: string[], template: string) {
  try {
    // convert string to JS syntax and strip quotes, otherwise escape characters
    // used in regexps are lost
    const body = "return `" + JSON.stringify(template).slice(1, -1) + "`;";
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    return new Function(...keys, body);
  } catch (err) {
    if (err instanceof SyntaxError)
      throw new TemplateLiteralError(
        `Error compiling template '${template}' with vars ${keys}: ${err.message}`,
      );
    throw err;
  }
}

const memoizedBuildTemplateFunction = memoizeWithExc(TemplateLiteralError, buildTemplateFunction);

/**
 * Expand ES6 template literal dynamically
 *
 * NOTE: INSECURE!!! since all global variables/functions are available
 */
export function expandTemplateLiteral(template: string, vars: Record<string, unknown>): string {
  const func = memoizedBuildTemplateFunction(Object.keys(vars), template);
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return func(...Object.values(vars));
  } catch (err) {
    throw new TemplateLiteralError(`Error expanding template '${template}': ${String(err)}`);
  }
}
