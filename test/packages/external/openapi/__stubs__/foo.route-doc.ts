import z from "zod";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import type { HttpRoute, HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import type { HttpRouteCatalog } from "@/packages/infrastructure/http/docs/http-route.catalog";
import { ValidatorZodAdapter } from "@/packages/external/validation/validator.zod-adapter";

export const FOO_ID = "7";
export const FOO_NAME = "Bar";
export const FOO_SIZE = 3;
export const FOO_PATH = "/foos/:fooId";

export const fooSchema = z.object({
    fooId: z.string().meta({ description: "The id of the foo", examples: [FOO_ID] }),
    name: z.string().meta({ description: "The name of the foo", examples: [FOO_NAME] }),
    size: z
        .number()
        .optional()
        .meta({ examples: [FOO_SIZE] }),
});

export const fooConflict = { code: "FOO_ALREADY_EXISTS", message: "The foo 7 already exists" };

export const addFooDoc: HttpRouteDoc = {
    summary: "Add a foo",
    description: "Adds a foo with its name",
    tags: ["Foos"],
    responses: [
        { status: HttpStatus.OK, description: "The foo was added" },
        {
            status: HttpStatus.CONFLICT,
            description: "The foo already exists",
            examples: { fooAlreadyExists: { summary: "Foo already exists", value: fooConflict } },
        },
    ],
};

export const addFooRoute: HttpRoute = {
    method: HttpMethod.POST,
    path: FOO_PATH,
    input: new ValidatorZodAdapter(fooSchema),
    doc: addFooDoc,
};

export const removeFooRoute: HttpRoute = {
    method: HttpMethod.DELETE,
    path: FOO_PATH,
    input: new ValidatorZodAdapter(fooSchema.pick({ fooId: true })),
    doc: {
        summary: "Remove a foo",
        description: "Removes the foo",
        tags: ["Foos"],
        responses: [{ status: HttpStatus.OK, description: "The foo was removed" }],
    },
};

export const undocumentedRoute: HttpRoute = { method: HttpMethod.GET, path: "/health" };

export const fooCatalog = (routes: HttpRoute[]): HttpRouteCatalog => ({ routes: () => routes });

export const listFoosRoute: HttpRoute = {
    method: HttpMethod.GET,
    path: "/foos",
    doc: {
        summary: "List the foos",
        description: "Lists every foo",
        tags: ["Foos"],
        responses: [{ status: HttpStatus.OK, description: "The foos" }],
    },
};
