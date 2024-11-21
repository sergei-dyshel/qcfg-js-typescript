import dedent from "ts-dedent";
export * from "case-anything";

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
