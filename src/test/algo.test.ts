import { binarySearch, binarySearchPred } from "../algo";
import { assertDeepEqual } from "../error";
import { suite, test } from "../testing";

void suite("binary search", () => {
  void suite("predicate", () => {
    void suite("left", () => {
      void test("empty", () => {
        assertDeepEqual(
          -1,
          binarySearchPred([] as boolean[], (x) => x, "left"),
        );
      });

      void test("all false", () => {
        assertDeepEqual(
          1,
          binarySearchPred([false, false], (x) => x, "left"),
        );
      });

      void test("all true", () => {
        assertDeepEqual(
          -1,
          binarySearchPred([true, true], (x) => x, "left"),
        );
      });
    });

    void suite("right", () => {
      void test("empty", () => {
        assertDeepEqual(
          0,
          binarySearchPred([] as boolean[], (x) => x, "right"),
        );
      });

      void test("all false", () => {
        assertDeepEqual(
          2,
          binarySearchPred([false, false], (x) => x, "right"),
        );
      });

      void test("all true", () => {
        assertDeepEqual(
          0,
          binarySearchPred([true, true], (x) => x, "right"),
        );
      });
    });
  });

  void suite("number", () => {
    void suite("left", () => {
      void test("empty", () => {
        assertDeepEqual(-1, binarySearch([] as number[], 2.5, undefined, "left"));
      });

      void test("all bigger", () => {
        assertDeepEqual(-1, binarySearch([1, 2, 3], 0, undefined, "left"));
      });

      void test("all smaller", () => {
        assertDeepEqual(2, binarySearch([1, 2, 3], 4, undefined, "left"));
      });

      void test("midle", () => {
        assertDeepEqual(1, binarySearch([1, 2, 3], 2.5, undefined, "left"));
      });
    });

    void suite("right", () => {
      void test("empty", () => {
        assertDeepEqual(0, binarySearch([] as number[], 2.5, undefined, "right"));
      });

      void test("all bigger", () => {
        assertDeepEqual(0, binarySearch([1, 2, 3], 0, undefined, "right"));
      });

      void test("all smaller", () => {
        assertDeepEqual(3, binarySearch([1, 2, 3], 4, undefined, "right"));
      });

      void test("[1, 2, 3] value 2.5", () => {
        assertDeepEqual(2, binarySearch([1, 2, 3], 2.5, undefined, "right"));
      });
    });
  });
});
