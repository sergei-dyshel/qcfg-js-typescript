import { Data as Dataclass } from "dataclass";

export { Dataclass };

export type DataclassParams<T> = T extends Dataclass ? Omit<Partial<T>, keyof Dataclass> : never;
