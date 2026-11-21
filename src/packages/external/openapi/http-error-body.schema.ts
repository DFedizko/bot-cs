import z from "zod";
import type { HttpErrorBody } from "@/packages/infrastructure/http/http-error.mapper";

const INVALID_FIELD_EXAMPLE = { path: "name", message: "Invalid input: expected string, received undefined" };

const invalidFieldSchema = z.object({
    path: z
        .string()
        .meta({ description: "The dotted path of the invalid field", examples: [INVALID_FIELD_EXAMPLE.path] }),
    message: z.string().meta({ description: "Why the field is invalid", examples: [INVALID_FIELD_EXAMPLE.message] }),
});

export const httpErrorBodySchema = z
    .object({
        code: z
            .string()
            .meta({ description: "The UPPER_SNAKE_CASE code of the error", examples: ["VALIDATION_ERROR"] }),
        message: z
            .string()
            .meta({ description: "A readable explanation of the error", examples: ["Invalid input: name"] }),
        fields: z
            .array(invalidFieldSchema)
            .optional()
            .meta({ description: "The invalid fields of a bad request", examples: [[INVALID_FIELD_EXAMPLE]] }),
    })
    .meta({
        id: "HttpErrorBody",
        description: "The body of every error response: a code, a message and, for a bad request, the invalid fields",
    }) satisfies z.ZodType<HttpErrorBody>;
