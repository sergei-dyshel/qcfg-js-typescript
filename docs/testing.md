# Writing tests

## Framework and structure

Tests use `node:test` via wrappers from `@sergei-dyshel/typescript/testing`. Test files live in `src/test/` within each package and are named `<module>.test.ts`.

```typescript
import { suite, test } from "@sergei-dyshel/typescript/testing";

void suite("suite-name", () => {
  void test("test name", async () => {
    /* ... */
  });
});
```

Always prefix `suite(...)` and `test(...)` calls with `void` to suppress floating-promise warnings.

## Assertions

Import from `@sergei-dyshel/typescript/error`:

- `assertDeepEqual(actual, expected)` — type-safe deep equality (both args must be same type)
- `assertRejects(asyncFn, ErrorClass?)` — verify async function rejects, optionally with specific error class
- `assertThrows(fn, ErrorClass?)` — same for sync functions
- `assert(condition, message, ...data)` — boolean assertion

## Running a single test file

```bash
cd packages/<package-name>
npx qcfg-build test src/test/<name>.test.ts
```

This is faster than `mise run test` for iterating on a single test file.

## Filesystem tests

For tests that need a temporary directory, use `testInDir` from the package's `../lib/testing`:

```typescript
import { testInDir } from "../lib/testing";

void test(
  "my fs test",
  testInDir(async () => {
    // process.cwd() is a clean temp directory
  }),
);
```

## Testing type-level constraints

To verify that invalid code produces a compile error, use `@ts-expect-error`. The annotation itself acts as the assertion — TypeScript will error if the next line is actually valid:

```typescript
await assertRejects(
  // @ts-expect-error description of the type error
  async () => await someCall(invalidArgs),
  ExpectedErrorClass,
);
```

## Gotchas

- **Filesystem mtime precision**: When comparing file timestamps (`Date` objects from `stat`), truncate to whole seconds. Filesystem mtime can lose sub-second precision, causing flaky 1ms mismatches. Use fixed past dates (e.g. `new Date(2026, 3, 12, 14, 30, 0)`) instead of `Date.now()`-based values.
- **Look at existing tests**: Before writing a new test file, read 1–2 existing tests in the same `src/test/` directory to match the local patterns (imports, helpers, structure).
