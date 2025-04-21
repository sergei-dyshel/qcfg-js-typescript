export function roundUp(value: number, multiple: number) {
  return Math.ceil(value / multiple) * multiple;
}

export function roundDown(value: number, multiple: number) {
  return Math.floor(value / multiple) * multiple;
}
