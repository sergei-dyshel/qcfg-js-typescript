import jsonStableStringify from "json-stable-stringify";
import * as jsoncParser from "jsonc-parser";

export { jsonStableStringify, jsoncParser };

export function jsonDeepEqual(actual: unknown, expected: unknown) {
  return jsonStableStringify(actual) === jsonStableStringify(expected);
}
