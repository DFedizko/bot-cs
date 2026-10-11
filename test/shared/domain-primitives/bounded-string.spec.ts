import { BoundedString } from "@/shared/domain-primitives/bounded-string";
import { DomainError } from "@/shared/error/domain-error";

test("Should throw an error when create with more characters than allowed", () =>
    expect(() => new FooBoundedString("AAAAAAA", { min: 2, max: 6, label: "foo bounded string" })).toThrow(
        DomainError,
    ));
test("Should throw an error when create with less characters than allowed", () =>
    expect(() => new FooBoundedString("A", { min: 2, max: 6, label: "foo bounded string" })).toThrow(DomainError));

class FooBoundedString extends BoundedString {}
