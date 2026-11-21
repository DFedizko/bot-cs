# API documentation standard

Every HTTP route is documented in one OpenAPI 3.1 document, built from the same zod schema its validator uses ([ADR-0003](adr/0003-api-docs-from-validator-schemas.md)). In development, the app serves it at `GET /openapi.json`, and as an interactive Scalar reference with a "Try it" client at `GET /docs`.

Follow this standard whenever you create or change an HTTP route.

## Where things live

| Piece                                  | Location                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Validator schema (the single source)   | `<context>/external/validation/<route>.schema.ts`                                 |
| Field descriptions and examples        | On the zod fields, with `.meta({ description, examples })`                        |
| Route documentation                    | `<context>/external/docs/<route>.route-doc.ts`, typed `HttpRouteDoc<z.ZodObject>` |
| Shared error examples of the context   | `<context>/external/docs/<concept>.error-examples.ts`                             |
| Shared error responses and body schema | `HttpErrorResponseDocs` in `src/packages/external/openapi/`                       |
| Registration                           | `bind(HTTP_ROUTE_DOC).toConstantValue(route)` in the context's HTTP module        |

The controller never imports zod or its documentation. Bind it on `HTTP_CONTROLLER` (`bind(HTTP_CONTROLLER).toService(ID)`) so the bootstrap starts it and the guard test finds its routes.

## Reuse the validator's schema

- Set `input` to the **same schema constant** the validator is built from. Never write a second schema for the docs.
- Path params are read from the route's `path` (`:accountId`), and the builder splits them out of `input`. The remaining fields become the JSON request body. Don't declare params or the body separately.
- Put `.meta()` on the **input side** of a transformed field (before `.transform()`), or zod drops it from the JSON Schema.

## Required sections

Every route doc has:

1. **`summary`**: a short imperative title (`"Add a wanted item"`).
2. **`description`**: what the route does for the caller, and any rule a caller must know.
3. **`tags`**: the resource group, from a shared constant.
4. **Path params and body**: through `input`. **Every field** has a `description` and at least one realistic `examples` value, so "Try it" is pre-filled. Use one coherent example (same account, same item) across a resource's routes, so a person can add, then edit, toggle and remove it.
5. **Every success response**: status and description, plus a `body` schema when it returns one.
6. **Every error response**, each with the shared error body and realistic examples copied from a real response of the running app:
    - `HttpErrorResponseDocs.badRequest(example)`: 400 validation error with `fields` (malformed JSON is added for you);
    - `notFound(...)` (404), `conflict(...)` (409), when the route can answer them;
    - `unprocessable(...)` (422): one example per domain error the route can raise;
    - `internalError()` (500): always.

## Checks

`test/composition-root/api-documentation.test.ts` runs the development app and fails when:

- a served route has no documentation, or a documented route isn't served;
- the documented example request is rejected by the validator;
- the documented required fields, or the documented body fields, differ from what the validator checks;
- a path param has no example, or a route lacks its 200 or 500 response.

Then open `http://localhost:<HTTP_PORT>/docs` in development and send the route's pre-filled request with "Try it".

## Example

```ts
// external/validation/wanted-item.fields.ts
export const enabledField = z.boolean().meta({
    description: "true to bid on the item again, false to pause it",
    examples: [WANTED_ITEM_EXAMPLE.enabled],
});

// external/validation/toggle-wanted-item.schema.ts
export const toggleWantedItemSchema = z.object({
    accountId: accountIdField,
    name: itemNameField,
    enabled: enabledField,
}) satisfies z.ZodType<ToggleWantedItemInput>;

// external/docs/toggle-wanted-item.route-doc.ts
export const toggleWantedItemRoute: HttpRouteDoc<z.ZodObject> = {
    method: HttpMethod.PATCH,
    path: ToggleWantedItemHttpController.PATH,
    summary: "Enable or disable a wanted item",
    description:
        "Pauses the bidding on an item the account wants, or resumes it, without losing its max for and criteria.",
    tags: [WANTED_ITEMS_TAG],
    input: toggleWantedItemSchema,
    responses: [
        { status: HttpStatus.OK, description: "The wanted item was enabled or disabled" },
        HttpErrorResponseDocs.badRequest(ENABLED_NOT_BOOLEAN),
        HttpErrorResponseDocs.notFound(NOT_WANTED),
        HttpErrorResponseDocs.unprocessable(BLANK_NAME, NAME_OUT_OF_BOUNDS),
        HttpErrorResponseDocs.internalError(),
    ],
};

// external/di/<context>-http.module.ts
bind(HTTP_ROUTE_DOC).toConstantValue(toggleWantedItemRoute);
```
