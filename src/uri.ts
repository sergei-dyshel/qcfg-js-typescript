import { URI } from "vscode-uri";
import { filterObjectEntries, mapValues } from "./object";

export { URI };

/** Common interface to match both {@link URI} and VScode's URI */
export interface UriLike {
  readonly scheme: string;
  readonly authority: string;
  readonly path: string;
  readonly query: string;
  readonly fragment: string;

  toString(skipEncoding?: boolean): string;

  get fsPath(): string;
  with(change: {
    scheme?: string;
    authority?: string | null;
    path?: string | null;
    query?: string | null;
    fragment?: string | null;
  }): UriLike;
}

/**
 * Browser-friendly version of NodeJS 'querystring.decode'
 */
export function decodeUriQuery(queryStr: string) {
  return Object.fromEntries(new URLSearchParams(queryStr));
}

export type UriQuery = Record<string, string | number | boolean>;

/**
 * Browser-friendly version of NodeJS 'querystring.encode'.
 *
 * Will skip keys with `undefined` value.
 */
export function encodeUriQuery(query: UriQuery) {
  return new URLSearchParams(
    mapValues(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      filterObjectEntries(query, (_, v) => v !== undefined),
      (_, v) => String(v),
    ),
  ).toString();
}
