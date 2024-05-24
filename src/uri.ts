export { URI } from "vscode-uri";
export { Utils as uriUtils } from "vscode-uri";

/** Common interface to match both {@link URI} and VScode's URI */
export interface UriLike {
  readonly scheme: string;
  readonly authority: string;
  readonly path: string;
  readonly query: string;
  readonly fragment: string;

  toString(skipEncoding?: boolean): string;
}
