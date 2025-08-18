import dedent from "ts-dedent";
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
): [start: number, length: number] | undefined {
  if (typeof pattern === "string") {
    const start = str.indexOf(pattern);
    if (start === -1) return;
    return [start, pattern.length];
  }
  const match = pattern.exec(str);
  if (!match) return;
  return [match.index, match[0].length];
}

export function dashesToUnderscores(str: string) {
  return str.replaceAll("-", "_");
}
