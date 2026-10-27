import { TrimmedString } from "@/packages/domain-primitives/trimmed-string";
import { EmptyStringError } from "@/packages/error/empty-string.error";

test("Should trim a string", () => expect(new FooTrimmedString("  Random String ").getValue()).toBe("Random String"));
test("Should throw an error when use empty string", () =>
    expect(() => new FooTrimmedString("  ")).toThrow(EmptyStringError));

class FooTrimmedString extends TrimmedString {}
