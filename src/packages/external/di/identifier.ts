import type { AbstractNewable } from "inversify";

export type Identifier<T> = symbol & AbstractNewable<T>;

export const identifier = <T>(description: string): Identifier<T> => Symbol(description) as Identifier<T>;
