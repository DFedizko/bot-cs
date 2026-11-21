import z from "zod";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";

export const FOO_ID = "7";
export const FOO_NAME = "Bar";
export const FOO_SIZE = 3;

export const fooErrorSchema = z.object({ code: z.string(), message: z.string() });

export const fooSchema = z.object({
    fooId: z.string().meta({ description: "The id of the foo", examples: [FOO_ID] }),
    name: z.string().meta({ description: "The name of the foo", examples: [FOO_NAME] }),
    size: z
        .number()
        .optional()
        .meta({ examples: [FOO_SIZE] }),
});

export const fooConflict = { code: "FOO_ALREADY_EXISTS", message: "The foo 7 already exists" };

export const addFooRoute: HttpRouteDoc<z.ZodObject> = {
    method: HttpMethod.POST,
    path: "/foos/:fooId",
    summary: "Add a foo",
    description: "Adds a foo with its name",
    tags: ["Foos"],
    input: fooSchema,
    responses: [
        { status: HttpStatus.OK, description: "The foo was added" },
        {
            status: HttpStatus.CONFLICT,
            description: "The foo already exists",
            body: fooErrorSchema,
            examples: { fooAlreadyExists: { summary: "Foo already exists", value: fooConflict } },
        },
    ],
};

export const removeFooRoute: HttpRouteDoc<z.ZodObject> = {
    method: HttpMethod.DELETE,
    path: "/foos/:fooId",
    summary: "Remove a foo",
    description: "Removes the foo",
    tags: ["Foos"],
    input: fooSchema.pick({ fooId: true }),
    responses: [{ status: HttpStatus.OK, description: "The foo was removed" }],
};
