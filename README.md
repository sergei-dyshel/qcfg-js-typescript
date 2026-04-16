# `qcfg-js-typescript` aka `@sergei-dyshel/typescript`

Personal Typescript package, providing:

- Library to use in both browser and Node.
- Exporting Typescript package version to be used in dependent packages.
- Exporting `tsconfig.json` to be used in dependent packages.

## Development

### Tasks

This package exports the following `mise` tasks:

- `dpdm` - scan for cyclic dependencies
- `test` - run all tests in package
- `compile` - run Typescript compiler for all files in package
- `check` - run all code-checking tools (compile/lint/formatting)
-
