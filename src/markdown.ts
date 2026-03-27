import * as marked from "marked";
import markedPlaintify from "marked-plaintify";
import type { UriLike } from "./uri";
// (presumably) faster alternative to plaintify (doesn't strip [//] comments though)
export { default as strip } from "remove-markdown";

export interface RenderOptions {
  plaintify?: boolean;
}

export function render(markdown: string, options?: RenderOptions) {
  const html = createRenderer(options).parse(markdown, {
    gfm: true,
    async: false,
  });
  return html;
}

export function inline(markdown: string, options?: RenderOptions) {
  const html = createRenderer(options).parseInline(markdown, { gfm: true, async: false });
  return html;
}

export const HORIZONTAL_LINE = "\n\n---\n\n";

export function link(text: string, uri: UriLike) {
  return `[${text}](${uri.toString()})`;
}

function createRenderer(options?: RenderOptions) {
  const renderer = new marked.Marked({ gfm: true });
  if (options?.plaintify) {
    renderer.use(markedPlaintify());
  }
  return renderer;
}
