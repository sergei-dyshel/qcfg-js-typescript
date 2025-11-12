import dedent from "ts-dedent";
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
