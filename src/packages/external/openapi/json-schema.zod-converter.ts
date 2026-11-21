import z from "zod";
import type { JsonSchema } from "./openapi-document";

const DIALECT_KEYWORD = "$schema";

type FieldSchema = JsonSchema & { examples?: unknown[]; description?: string };

export class JsonSchemaZodConverter {
    static convert(schema: z.ZodType): FieldSchema {
        const entries = Object.entries(z.toJSONSchema(schema, { io: "input" }));
        return Object.fromEntries(entries.filter(([keyword]) => keyword !== DIALECT_KEYWORD));
    }

    static exampleOf(schema: z.ZodType): unknown {
        return JsonSchemaZodConverter.convert(schema).examples?.[0];
    }

    static descriptionOf(schema: z.ZodType): string | undefined {
        return JsonSchemaZodConverter.convert(schema).description;
    }
}
