import { gitShortHash } from "@sergei-dyshel/typescript";
import { formatDate } from "@sergei-dyshel/typescript/datetime";
import * as fail from "@sergei-dyshel/typescript/error";
import type { UriLike } from "@sergei-dyshel/typescript/uri";
import linkifyStr from "linkify-string";
import { randomBytes } from "node:crypto";
import { dedent } from "./string";

export function escape(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type TagAttrs = Record<string, string | number | boolean>;

export function details(summary: string, body: string, open = false) {
  return tag("details", { open }, tag("summary", {}, summary) + body);
}

function formatAttrs(attrs?: TagAttrs) {
  let attr = Object.entries(attrs ?? ({} as TagAttrs))
    .map(([name, value]) => {
      if (typeof value === "boolean") return value ? name : "";
      return `${name}="${value}"`;
    })
    .join(" ");
  if (attr !== "") attr = " " + attr;
  return attr;
}

/* REFACTOR: Allow using Html.tag without attrs */
export function tag(tag: string, attrs?: TagAttrs, inner = "", padded = false) {
  const pad = padded ? "\n\n" : "";
  return `${pad}<${tag}${formatAttrs(attrs)}>${pad}${inner}${pad}</${tag}${pad}>`;
}

export function voidTag(tag: string, attrs?: TagAttrs) {
  return `<${tag}${formatAttrs(attrs)}>`;
}

export function anchor(inner: string, attrs?: TagAttrs) {
  return tag("a", attrs, inner);
}

export function link(text: string, uri: UriLike) {
  return anchor(text, { href: uri.toString() });
}

export function copyableLink(uri: UriLike, text?: string) {
  if (!text) text = uri.toString(true /* skipEncoding */);
  return link(text, uri) + " " + copyButton(uri.toString());
}

export function copyableCode(text: string) {
  return code(text) + " " + copyButton(text);
}

export function bold(inner: string) {
  return tag("b", {}, inner);
}

export function italic(inner: string) {
  return tag("i", {}, inner);
}

export function paragraph(inner: string, attrs?: TagAttrs) {
  return tag("p", attrs, inner);
}

export function code(text: string) {
  return tag("code", {}, text);
}

export function pre(text: string) {
  return tag("pre", {}, text);
}

export function linkify(text: string) {
  return linkifyStr(text);
}

export function div(attrs: { class?: "column" | "row" } & TagAttrs, inner: string, padded = false) {
  return tag("div", attrs, inner, padded);
}

export function copyButton(text: string, label = "copy", tooltip = "Copy to clipboard") {
  // use combination of style/href so that cursor shape changes but without underline
  // return anchor('📋', {
  // 	style: 'text-decoration: inherit',
  // 	href: '',
  // 	title: 'Copy to clipboard',
  // 	text,
  // 	onclick: 'copyText(event)',
  // });
  return tag(
    "button",
    {
      type: "button",
      style: "padding: 0; margin: 0; line-height: normal",
      title: tooltip,
      text,
      onclick: "copyText(event)",
    },
    label,
  );
}

export function copyableHash(hash: string) {
  const short = gitShortHash(hash);
  return (
    code(short) +
    " " +
    copyButton(short, "Copy", "Copy short hash") +
    " " +
    copyButton(hash, "Copy full", "Copy full hash")
  );
}

export function paragraphs(...lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => paragraph(line, { style: "margin-top: 0.5em; margin-bottom: 0.5em" }))
    .join(" ");
}

export function sections(...parts: string[]) {
  return parts.filter((part) => part !== "").join("\n<hr />\n");
}

export function prefixed(prefix: string, value: string) {
  value = value.trim();
  if (value !== "") return `${bold(prefix)}: ${value}`;
  return "";
}

export function table(
  header: string[] | undefined,
  rows: (
    | string
    | [attrs: { ["vertical-align"]: "top" | "bottom" | "middle" } & TagAttrs, text: string]
  )[][],
  padded = false,
) {
  const headsHtml =
    header === undefined
      ? ""
      : tag(
          "thead",
          undefined,
          tag(
            "tr",
            undefined,
            header.map((heading) => tag("th", { scope: "col" }, heading, padded)).join(""),
            padded,
          ),
          padded,
        );

  const rowTags = rows.map((row) => {
    fail.assert(
      !header || row.length === header.length,
      `Length of table row ${row.length} does not match header`,
    );
    return tag(
      "tr",
      undefined,
      row
        .map((cell) => {
          const [attrs, text] = typeof cell === "string" ? [undefined, cell] : cell;
          return tag("td", attrs, text, padded);
        })
        .join(""),
      padded,
    );
  });
  const rowHtml = tag("tbody", undefined, rowTags.join(""), padded);

  return tag("table", undefined, headsHtml + rowHtml, padded);
}

export function img(
  src: string | UriLike,
  alt: string,
  attrs?: TagAttrs & { width?: number; height?: number },
) {
  return voidTag("img", {
    src: typeof src === "string" ? src : src.toString(true /* skipEncoding */),
    alt,
    ...attrs,
  });
}

export function relativeTime(date: Date) {
  const id = randomBytes(8).toString("hex");
  const epoch = date.getTime();
  return (
    anchor(italic(""), {
      id,
      style: "text-decoration: inherit; color: inherit",
      title: formatDate(date, "yyyy-MM-dd HH:mm"),
    }) +
    tag(
      "script",
      {},
      dedent`
				updateRelativeTime(document.getElementById('${id}').children[0], '${epoch}');
			`,
    )
  );
}

export interface Message {
  command: "copyToClipboard";
  text: string;
}

export function email(name: string, address: string) {
  return name + escape(" <") + code(address) + escape(">");
}
