# Agent instructions for TypeScript development

This is the entry point (prompt) for AI agents when developing any TypeScript code in this monorepo.
Read this file before writing or modifying TypeScript source.

For monorepo-wide instructions (build system, architecture, conventions), see the root
[AGENTS.md](../../AGENTS.md). Also read dependency instructions:

- [packages/eslint-config/AGENTS.md](../eslint-config/AGENTS.md)
- [packages/prettier-config/AGENTS.md](../prettier-config/AGENTS.md)

## Running as a VSCode extension

- [ ] These rules apply when the agent runs inside a VSCode extension host (e.g., Claude Code's
      VSCode extension, GitHub Copilot, Continue, etc.) and has access to live editor state and
      diagnostics:

- **Diagnostics — ignore "info" severity.** Only `error` and `warning` level diagnostics indicate
  real issues. `info` (and `hint`) entries are almost always cosmetic noise from spell-checkers
  (LTeX, Code Spell Checker), prose linters, or styling suggestions — do not act on them, do not
  report them as problems, and do not edit code/text to silence them unless the user explicitly
  asks.

- When the harness surfaces post-edit diagnostics, filter the list down to `error` and `warning`
  before deciding whether to react.

## Package overview

`qcfg-js-typescript` (`@sergei-dyshel/typescript`) is the foundation library — pure TypeScript
utilities usable in both browser and Node environments. All other packages in the monorepo depend on
it.

Before adding a new utility function, check if it already exists here. Browse the source modules by
topic: `array.ts`, `string.ts`, `enum.ts`, `error.ts`, `datetime.ts`, `map.ts`, `set.ts`,
`object.ts`, `json.ts`, `regex.ts`, `math.ts`, etc.

## Repo layout

Each package follows the same layout, rooted at the package directory:

- `src/` — all source code.
- `src/test/` — all test files (`*.test.ts`).

Do not place source or tests anywhere else (e.g., no top-level `tests/`, `lib/`, or `source/`
directories).

## TypeScript conventions

- All code is strict ESM (`"type": "module"`) with strict TypeScript (`strict: true`).
- Use the shared `tsconfig.json` exported by this package as the base for all dependent packages.
- Prefer pure functions and immutable patterns where practical.
- Use `zod` for runtime validation schemas (re-exported from this package).
- When writing test files, use the `*.test.ts` suffix and the testing utilities provided by this
  package — see [testing.md](testing.md) for conventions and assertion helpers.

## Adding new code

- New utility modules go in `src/` with a descriptive filename matching the topic.
- Keep modules focused — one concept per file. If a module grows beyond ~300 lines, consider
  splitting.
- This package must remain environment-agnostic (no Node-specific or browser-specific APIs). Node
  utilities belong in `qcfg-js-node`.

### How to expose a module

Choose one of three styles based on the module's symbols. The goal is that **every imported symbol
is unambiguous at the call site** — either by its name alone, or by a namespace/subpath qualifier.

1. **Re-export from `index.ts`** (flat top-level export) — for modules whose exported symbols
   already include the topic in their names, so they read clearly when imported bare.

   ```ts
   // src/index.ts
   export * from "./regex"; // exports e.g. `escapeRegex`, `RegexBuilder`
   ```

   Use when the symbols are few and self-descriptive (e.g., `escapeRegex`, `assertDeepEqual`). Bad
   fit when the module exports generic names like `parse`, `format`, `merge` — those collide and
   lose meaning without the topic.

2. **Re-export as a namespace from `index.ts`** — for topic-focused modules whose symbols are
   generic on their own but make sense under a namespace.

   ```ts
   // src/index.ts
   export * as Markdown from "./markdown"; // call sites: Markdown.parse(...), Markdown.toPlainText(...)
   export * as Html from "./html";
   export * as Flat from "./flat";
   ```

   Use when the file deals with a specific topic (markdown, html, flattening) and the symbols are
   short generic names. The namespace name supplies the missing context.

3. **Subpath export via `package.json` `exports`** — for larger modules or when callers should opt
   in explicitly.

   ```jsonc
   // package.json
   "exports": {
     "./error":    "./src/error.ts",
     "./datetime": "./src/datetime.ts",
     "./testing":  "./src/testing.ts"
   }
   ```

   ```ts
   // call site
   import { assertDeepEqual } from "@sergei-dyshel/typescript/error";
   ```

   Use for sizable modules with many symbols, or where tree-shaking and explicit imports matter
   (e.g., `error`, `testing`, `datetime`, `array`, `zod`). Do **not** also re-export these from
   `index.ts` — pick one path per module to avoid duplicate import styles across the codebase.

When adding a new module, decide which of the three applies and wire it up accordingly. If unsure,
prefer style 3 (subpath export) — it's the most explicit and easiest to refactor later.

## Code patterns

- **`-ns` file suffix**: Files like `subprocess-ns.ts`, `code-browser-ns.ts` are namespace re-export wrappers (`export * as Subprocess from "./subprocess"`). Logic lives in the non-`-ns` file.
- **Namespace + class merging**: A `namespace Foo` declares companion types (e.g., `Foo.When`) and module-level events immediately above `export class Foo`. The namespace augments the class's public API without adding statics.
