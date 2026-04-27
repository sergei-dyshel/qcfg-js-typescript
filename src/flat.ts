/**
 * Tiny validation library for "flat"-object schema, use for objects with only values of primitive
 * type (boolean/string/number/null/undefined) or union of primitive types. Example:
 *
 * ```js
 * {
 *    a: Number;
 *    b: [String | null];
 *    c: [Boolean | undefined];
 * }
 * ```
 */

import { MapAdapter } from "./map";
import { isPlainObject, objectEntries, objectKeys, pick } from "./object";
import { SetAdapter } from "./set";
import type { OptionalFromUndefined, StringKeyOf } from "./types";

/**
 * Create schema {@link Class} for handling schema.
 */
export function create<S extends Schema>(schema: S) {
  const cls = class {
    static schema = schema;
    static keys = objectKeys(schema);

    readonly _obj: any;
    readonly _class: Class<S>;

    constructor(obj: Object<S>, validate = true) {
      this._obj = cls.parse(obj);
      this._class = cls;
      if (validate) cls.validate(obj);
      Object.assign(this, this._obj);
    }

    _as<S1 extends Schema>(cls: Class<S1>) {
      return new cls(cls.parse(this._obj as Object<S1>));
    }

    _equals(other: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return cls.equal(this._obj, other);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      for (const [key, value] of Object.entries(this._obj)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (value !== other[key]) return false;
      }
      return true;
    }

    toString() {
      return cls.stringify(this._obj as Object<S>);
    }

    static extend(arg: any) {
      if (isPlainObject(arg)) {
        // this is a schema
        const schema = arg as Schema;
        return create({ ...this.schema, ...schema });
      } else {
        // this is a class
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        const otherCls = arg as Class<{}>;
        return create({ ...this.schema, ...otherCls.schema });
      }
    }

    static validate(obj: Object<S>) {
      for (const [key, property] of objectEntries(this.schema)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const value = (obj as any)[key];
        if (!match(value, property))
          throw new Error(
            `value for key "${key}" does not match schema: expected ${propertyTypeToString(property)}, got ${typeof value}`,
          );
      }
    }

    static match(obj: unknown): obj is Object<S> {
      if (!isPlainObject(obj)) return false;
      try {
        this.validate(obj as Object<S>);
        return true;
      } catch {
        return false;
      }
    }

    static stringify(obj: Object<S>, space?: string | number) {
      return JSON.stringify(this.parse(obj), undefined, space);
    }

    static parse(obj: Object<S>, validate = true) {
      if (validate) this.validate(obj);
      return pick(obj as any, ...Object.keys(schema)) as Object<S>;
    }

    static equal(obj1: any, obj2: any): boolean {
      for (const key of this.keys) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (obj1[key] !== obj2[key]) return false;
      }
      return true;
    }
  } as Class<S>;

  return cls;
}

type SimpleProperty = typeof Boolean | typeof String | typeof Number | undefined | null;

type SimplePropertyType<P extends SimpleProperty> = P extends typeof Boolean
  ? boolean
  : P extends typeof String
    ? string
    : P extends typeof Number
      ? number
      : P extends null
        ? null
        : P extends undefined
          ? undefined
          : never;

type Property<P extends SimpleProperty = SimpleProperty> = P | P[];

type PropertyType<P extends Property> =
  P extends Property<infer P1>
    ? P extends P1[]
      ? SimplePropertyType<P1>
      : P extends SimpleProperty
        ? SimplePropertyType<P>
        : never
    : never;

export type Schema = Record<string, Property>;

/**
 * Infer plain object type from schema.
 *
 * Similar to `infer` type in other libraries.
 */
export type Object<S extends Schema> = OptionalFromUndefined<{
  [K in StringKeyOf<S>]: PropertyType<S[K]>;
}>;

/**
 * Schema class instance.
 *
 * Behaves like Python's dataclass:
 *
 * - Instantiated with object that matches schema.
 * - Provides helpful methods .
 */
export type Instance<S extends Schema> = Object<S> & {
  /** Object that was used to instantiate the class (only keys that are in the schema) */
  readonly _obj: Object<S>;

  /** Schema class for this instance */
  readonly _class: Class<S>;

  /**
   * Downcase to base schema instance.
   */
  _as<S1 extends Schema>(cls: Class<S1>): AsInstance<S, S1>;

  /**
   * Only checks keys that are in schema.
   */
  _equals(other: Object<S>): boolean;

  /**
   * Stable stringification - order of keys like in the schema.
   */
  toString(): string;
};

/**
 * Schema class that is used for dealing with objects matching that schema and creating schema
 * instances.
 */
export interface Class<S extends Schema> {
  new (obj: Object<S>, validate?: boolean): Instance<S>;

  readonly schema: S;
  readonly keys: readonly StringKeyOf<S>[];

  /**
   * Create new class by extending this class's schema with given schema
   */
  extend<S1 extends Schema>(schema: S1): Class<S & S1>;
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  extend<S1 extends Schema>(cls: Class<S1>): Class<S & S1>;

  validate(obj: Object<S>): void;

  match(obj: unknown): obj is Object<S>;

  /**
   * Stable stringification - keys will appear in the same order as in schema
   */
  stringify(obj: Object<S>, space?: string | number): string;

  /**
   * Parse (and validate) object.
   *
   * Without validation this only filters the keys.
   */
  parse(obj: Object<S>, validate?: boolean): Object<S>;

  /**
   * Compare two objects matching schema.
   *
   * Only keys present in schema are compared.
   */
  equal(obj1: Object<S>, obj2: Object<S>): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type AsInstance<S extends Schema, S1 extends Schema> = S extends S1 ? Instance<S1> : void;

export type InstanceOf<C> = C extends Class<infer S> ? Instance<S> : never;

export type ObjectOf<C> = C extends Class<infer S> ? Object<S> : never;

export type SchemaOf<C> = C extends Class<infer S> ? S : never;

/**
 * Set of arbitrary objects matching given schema.
 *
 * Stores "parsed" version of given objects (e.g. stripped of unknown properties)
 */
export class Set<S extends Schema> extends SetAdapter<Object<S>, string> {
  constructor(cls: Class<S>, values?: Object<S>[]) {
    super(
      {
        adapter: (value) => cls.stringify(value),
        sanitizer: (value) => cls.parse(value),
      },
      values,
    );
  }
}

/**
 * Map from arbitrary objects matching schema.
 */
export class Map<S extends Schema, V> extends MapAdapter<Object<S>, V, string> {
  constructor(cls: Class<S>) {
    super((value) => cls.stringify(value));
  }
}

function match(value: any, property: Property) {
  if (Array.isArray(property)) {
    for (const p of property) {
      if (match(value, p)) return true;
    }
    return false;
  }

  switch (property) {
    case Number:
      return typeof value === "number";
    case String:
      return typeof value === "string";
    case Boolean:
      return typeof value === "boolean";
    case null:
      return value === null;
    case undefined:
      return value === undefined;
    default:
      return false;
  }
}

function propertyTypeToString(p: Property): string {
  if (Array.isArray(p)) {
    return p.map(propertyTypeToString).join(" | ");
  }
  switch (p) {
    case Number:
      return "number";
    case String:
      return "string";
    case Boolean:
      return "boolean";
    case null:
      return "null";
    case undefined:
      return "undefined";
    default:
      return String(p);
  }
}
