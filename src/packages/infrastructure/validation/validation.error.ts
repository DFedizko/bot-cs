import { BaseError } from "@/packages/building-blocks/base-error";

export type InvalidField = {
    path: string;
    message: string;
};

const FIELD_SEPARATOR = ", ";

export class ValidationError extends BaseError {
    constructor(public readonly fields: InvalidField[]) {
        super({
            message: `Invalid input: ${fields.map(({ path }) => path).join(FIELD_SEPARATOR)}`,
            code: "VALIDATION_ERROR",
        });
    }
}
