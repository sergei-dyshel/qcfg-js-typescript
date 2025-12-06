import { assertDeepEqual } from "../error";
import * as Flat from "../flat";
import { suite, test } from "../testing";

function verify<S extends Flat.Schema>(ref: Flat.Instance<S>, obj: Flat.Object<S>) {
  assertDeepEqual(ref._obj, obj);
  assertDeepEqual(ref._equals(obj), true);
  assertDeepEqual(ref._equals(ref), true);
}

void suite("flat", () => {
  void test("sanity", () => {
    const schema1 = { a: Number, c: [Boolean, undefined] };
    const Flat1 = Flat.create(schema1);
    const data1 = { a: 5, c: undefined };
    const inst1 = new Flat1(data1);
    verify(inst1, data1);

    const schema2 = { b: String };
    const Flat2 = Flat1.extend(schema2);
    const data2 = { b: "hello" };
    const inst2 = new Flat2({ ...inst1, ...data2 });
    const fullData2 = { ...data1, ...data2 };
    verify(inst2, fullData2);

    const inst3 = inst2._as(Flat1);
    assertDeepEqual(inst3, inst1);
    verify(inst3, data1);
  });
});
