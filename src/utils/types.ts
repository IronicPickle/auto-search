export type Abstract<T> = Function & {prototype: T};
export type Constructable<T> = new (...args: any[]) => T;