import { FooValueObject } from "./__mocks__/FooValueObject";
import { InheritedValueObject } from "./__mocks__/InheritedValueObject";

test("Should create a value object", () => expect(new FooValueObject("test").getValue()).toBe("test"));
test("Should vo properties must immutable", () => {
    const fooVo = new FooValueObject("test");
    // @ts-expect-error Expected error to test
    expect(() => (fooVo.props.value = "")).toThrow(Error);
});
test("Should create a subclassed value object and ensure it has the same behavior", () =>
    expect(InheritedValueObject.create().getValue()).toBeTypeOf("string"));
