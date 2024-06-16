import * as marked from "marked";
import type { UriLike } from "../uri";

export function render(markdown: string) {
  const html = marked.marked.parse(markdown, { gfm: true });
  return html;
}

export function inline(markdown: string) {
  const html = marked.marked.parseInline(markdown, { gfm: true });
  return html;
}

export const HORIZONTAL_LINE = "\n\n---\n\n";

export function link(text: string, uri: UriLike) {
  return `[${text}](${uri.toString()})`;
}
