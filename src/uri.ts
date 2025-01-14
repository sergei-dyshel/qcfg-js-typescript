import { URI } from "vscode-uri";

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
