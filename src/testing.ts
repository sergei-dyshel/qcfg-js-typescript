/** This file should be only imported by unit tests. */

import { test as nodeTest } from "node:test";
import type { Awaitable } from "./types";

export function test(name: string, fn: () => Awaitable<unknown>) {
  void nodeTest(name, fn);
}
