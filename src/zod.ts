import jsonStableStringify from "json-stable-stringify";
import { z as zod } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { fromZodError } from "zod-validation-error";
import { registerErrorFormatter } from "./error";
import { MapAdapter } from "./map";
import { SetAdapter } from "./set";

export { zod, zodToJsonSchema };

export function schemaStringify<T extends zod.ZodTypeAny>(schema: T, val: zod.infer<T>) {
  return jsonStableStringify(schema.parse(val));
}

export function schemaEqual<T extends zod.ZodTypeAny>(
  schema: T,
  s1: zod.infer<T>,
  s2: zod.infer<T>,
) {
  return schemaStringify(schema, s1) === schemaStringify(schema, s2);
}

export class SchemaMap<T extends zod.ZodTypeAny, V> extends MapAdapter<zod.infer<T>, V, string> {
  constructor(schema: T) {
    super((value) => schemaStringify(schema, value));
  }
}

/**
 * Set of arbitrary objects matching given schema.
 *
 * Stores "parsed" version of given objects (e.g. stripped of unknown properties)
 */
export class SchemaSet<T extends zod.ZodTypeAny> extends SetAdapter<zod.infer<T>, string> {
  constructor(schema: T, values?: zod.infer<T>[]) {
    super(
      {
        adapter: (value) => schemaStringify(schema, value),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        sanitizer: (value) => schema.parse(value),
      },
      values,
    );
  }
}

registerErrorFormatter(zod.ZodError, (err: zod.ZodError) => fromZodError(err).toString());
