import type { z } from "zod";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import { ValidationError, type InvalidField } from "@/packages/infrastructure/validation/validation.error";

const PATH_SEPARATOR = ".";

export class ZodValidatorAdapter<T> implements Validator<T> {
    constructor(private readonly schema: z.ZodType<T>) {}

    validate(input: unknown): T {
        const result = this.schema.safeParse(input);
        if (!result.success) throw new ValidationError(result.error.issues.map((issue) => this.mapToField(issue)));
        return result.data;
    }

    private mapToField(issue: z.core.$ZodIssue): InvalidField {
        return { path: issue.path.join(PATH_SEPARATOR), message: issue.message };
    }
}
