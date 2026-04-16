export function stringify(x: unknown): string {
  if (typeof x === "object") return stringifyObject(x);
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  return "" + x;
}

export function registerStringifier(str: Stringifier) {
  stringifiers.push(str);
}

export function str(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = strings[0];
  for (const [i, value] of values.entries()) {
    result += stringify(value) + strings[i + 1];
  }
  return result;
}

/* Private */

type Stringifier = (value: object) => string | undefined;

const stringifiers: Stringifier[] = [];

function stringifyObject(x: object | null): string {
  if (x === null) return "<null>";
  if (x instanceof Error) {
    return `${x.message}: ${x.name}`;
  }
  if (Array.isArray(x)) {
    const arr = x;
    return "[ " + arr.map((elem) => stringify(elem)).join(", ") + " ]";
  }
  for (const str of stringifiers) {
    const s = str(x);
    if (s) return s;
  }
  if ("toString" in x) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const s = x.toString();
    if (s !== "[object Object]") return s;
  }
  return JSON.stringify(x);
}
