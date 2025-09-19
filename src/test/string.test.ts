import { assertDeepEqual } from "../error";
import { dashesToUnderscores, expandTemplateLiteral } from "../string";
import { test } from "../testing";

void test("expandTemplateLiteral", async (t) => {
  await t.test("no vars", () => {
    const x = expandTemplateLiteral("5", {});
    assertDeepEqual(x, "5");
  });

  await t.test("simple vars", () => {
    const x = expandTemplateLiteral("${x}${y}", { x: "str", y: 5 });
    assertDeepEqual(x, "str5");
  });

  await t.test("imported funcs", () => {
    const x = expandTemplateLiteral("${dashesToUnderscores(x)}", { dashesToUnderscores, x: "x-y" });
    assertDeepEqual(x, "x_y");
  });

  await t.test("lots of vars", () => {
    const vars: Record<string, unknown> = {};
    let str = "'argument'";
    for (let i = 0; i < 50; i++) {
      const name = `f${i}`;
      vars[name] = (x: string) => x;
      str = `${name}(${str})`;
    }
    const x = expandTemplateLiteral("${" + str + "}", vars);
    assertDeepEqual(x, "argument");
  });
});
