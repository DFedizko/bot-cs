import { PositiveInteger } from "@/shared/domain-primitives/positive-integer";
import { DomainError } from "@/shared/error/domain-error";

test("Should throw an error when create a positive integer object with negative integer", () =>
    expect(() => new PositiveInteger(-1)).toThrow(DomainError));
