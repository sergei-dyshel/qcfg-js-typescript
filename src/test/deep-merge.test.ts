/* eslint-disable @typescript-eslint/no-floating-promises */
import { DeepMergeError, deepMerge } from "../deep-merge";
import { assertDeepEqual, assertThrows } from "../error";
import { test } from "../testing";

const someDate = new Date();
const anotherDate = new Date();

test("override primitive property", () => {
  assertDeepEqual(deepMerge({ a: 1 }, { a: 2 }), { a: 2 });
});

test("override property of non-plain object type", () => {
  assertDeepEqual(deepMerge({ date: someDate }, { date: anotherDate }), { date: anotherDate });
});

test("override property of plain object type with non-plain ojbect", () => {
  assertThrows(() => deepMerge({ date: {} }, { date: someDate }), DeepMergeError);
});

test("override with undefined", () => {
  assertDeepEqual(deepMerge({ a: 1 }, { a: undefined }), { a: 1 });
});

test("merge arrays", () => {
  assertDeepEqual(deepMerge({ a: [1, 2] }, { a: [3, 4] }), { a: [1, 2, 3, 4] });
});

test("deep nested", () => {
  assertDeepEqual(
    deepMerge(
      { outer: { a: [1, 2], date: someDate } },
      { outer: { a: [3, 4], date: anotherDate } },
    ),
    { outer: { a: [1, 2, 3, 4], date: anotherDate } },
  );
});
