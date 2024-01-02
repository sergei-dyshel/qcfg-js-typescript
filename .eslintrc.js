/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: ["@sergei-dyshel"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
};
