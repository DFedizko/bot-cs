import z from "zod";
import type { HttpErrorBody } from "@/packages/infrastructure/http/http-error.mapper";

const invalidFieldSchema = z.object({
    path: z.string().meta({ description: "The dotted path of the invalid field", examples: ["name"] }),
    message: z.string().meta({ description: "Why the field is invalid" }),
});

export const httpErrorBodySchema = z
    .object({
        code: z.string().meta({ description: "The UPPER_SNAKE_CASE code of the error" }),
        message: z.string().meta({ description: "A readable explanation of the error" }),
        fields: z.array(invalidFieldSchema).optional().meta({ description: "The invalid fields of a bad request" }),
    })
    .meta({ title: "HttpErrorBody" }) satisfies z.ZodType<HttpErrorBody>;
