import jsonStableStringify from "json-stable-stringify";
import * as jsoncParser from "jsonc-parser";

export { jsonStableStringify, jsoncParser };

export function jsonDeepEqual(actual: unknown, expected: unknown) {
  return jsonStableStringify(actual) === jsonStableStringify(expected);
}

export class JsoncEditor {
  options: jsoncParser.ModificationOptions = {};
  json: any;

  constructor(public text: string) {
    this.parse();
  }

  modify(jsonPath: jsoncParser.JSONPath, value: unknown) {
    const edits = jsoncParser.modify(this.text, jsonPath, value, this.options);
    this.text = jsoncParser.applyEdits(this.text, edits);
    this.parse();
  }

  private parse() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.json = jsoncParser.parse(this.text);
  }
}
