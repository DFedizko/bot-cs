import z from "zod";
import { ZodValidatorAdapter } from "@/packages/external/validation/validator.zod-adapter";
import { ValidationError } from "@/packages/infrastructure/validation/validation.error";

type FooInput = { id: number; name: string };

const fooSchema = z.object({ id: z.coerce.number().int(), name: z.string() }) satisfies z.ZodType<FooInput>;

describe("ZodValidatorAdapter", () => {
    it("Should return the input converted by its schema", () => {
        const validator = new ZodValidatorAdapter(fooSchema);

        const input = validator.validate({ id: "7", name: "Foo" });

        expect(input).toEqual({ id: 7, name: "Foo" });
    });

    it("Should drop the keys its schema doesn't know", () => {
        const validator = new ZodValidatorAdapter(fooSchema);

        const input = validator.validate({ id: 7, name: "Foo", extra: true });

        expect(input).toEqual({ id: 7, name: "Foo" });
    });

    it("Should throw a validation error for an invalid input", () => {
        const validator = new ZodValidatorAdapter(fooSchema);

        const validate = () => validator.validate({ id: "seven" });

        expect(validate).toThrow(ValidationError);
    });

    it("Should name every failing field", () => {
        const validator = new ZodValidatorAdapter(fooSchema);

        const failingPaths = () => {
            try {
                validator.validate({ id: "seven" });
            } catch (error) {
                return (error as ValidationError).fields.map(({ path }) => path);
            }
        };

        expect(failingPaths()).toEqual(["id", "name"]);
    });

    it("Should name a nested failing field by its full path", () => {
        const validator = new ZodValidatorAdapter(z.object({ items: z.array(z.object({ type: z.string() })) }));

        const validate = () => validator.validate({ items: [{ type: 1 }] });

        expect(validate).toThrow("Invalid input: items.0.type");
    });
});
