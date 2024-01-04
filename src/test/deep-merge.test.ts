/* eslint-disable @typescript-eslint/no-floating-promises */
import { DeepMergeError, deepMerge } from "../deep-merge";
import { Assert, Test } from "../testing";

const someDate = new Date();
const anotherDate = new Date();

Test.test("override primitive property", () => {
  Assert.deepEqual(deepMerge({ a: 1 }, { a: 2 }), { a: 2 });
});

Test.test("override property of non-plain object type", () => {
  Assert.deepEqual(deepMerge({ date: someDate }, { date: anotherDate }), { date: anotherDate });
});

Test.test("override property of plain object type with non-plain ojbect", () => {
  Assert.throws(() => deepMerge({ date: {} }, { date: someDate }), DeepMergeError);
});

Test.test("override with undefined", () => {
  Assert.deepEqual(deepMerge({ a: 1 }, { a: undefined }), { a: 1 });
});

Test.test("merge arrays", () => {
  Assert.deepEqual(deepMerge({ a: [1, 2] }, { a: [3, 4] }), { a: [1, 2, 3, 4] });
});

Test.test("deep nested", () => {
  Assert.deepEqual(
    deepMerge(
      { outer: { a: [1, 2], date: someDate } },
      { outer: { a: [3, 4], date: anotherDate } },
    ),
    { outer: { a: [1, 2, 3, 4], date: anotherDate } },
  );
});
