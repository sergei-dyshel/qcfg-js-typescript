import { DeepMergeError, deepMerge } from "../deep-merge";
import { assertDeepEqual, assertThrows } from "../error";
import { test } from "../testing";

const someDate = new Date();
const anotherDate = new Date();

void test("override primitive property", () => {
  assertDeepEqual(deepMerge({ a: 1 }, { a: 2 }), { a: 2 });
});

void test("override property of non-plain object type", () => {
  assertDeepEqual(deepMerge({ date: someDate }, { date: anotherDate }), { date: anotherDate });
});

void test("override property of plain object type with non-plain ojbect", () => {
  assertThrows(() => deepMerge({ date: {} }, { date: someDate }), DeepMergeError);
});

void test("override with undefined", () => {
  assertDeepEqual(deepMerge({ a: 1 }, { a: undefined }), { a: 1 });
});

void test("merge arrays", () => {
  assertDeepEqual(deepMerge({ a: [1, 2] }, { a: [3, 4] }), { a: [1, 2, 3, 4] });
});

void test("deep nested", () => {
  assertDeepEqual(
    deepMerge(
      { outer: { a: [1, 2], date: someDate } },
      { outer: { a: [3, 4], date: anotherDate } },
    ),
    { outer: { a: [1, 2, 3, 4], date: anotherDate } },
  );
});

void test("no modifying source object", () => {
  const a1 = { a: { b: 1 } };
  const a2 = { a: { b: 2 } };
  const merged = deepMerge(a1, a2);
  assertDeepEqual(merged, { a: { b: 2 } });
  assertDeepEqual(a1, { a: { b: 1 } });
});
