---
name: http-route-docs
description: The standard for documenting the bot's HTTP routes in its OpenAPI document (zod-openapi + Scalar at /docs). Use it whenever a task creates or changes an HTTP route, a controller, a route's validator or zod fields, its responses or its errors — the route's docs must change with it, and a guard test fails otherwise.
---

# Documenting HTTP routes

Every HTTP route documents itself when it registers, as on Fastify: the controller passes its validator and its route doc to the `HttpServer` (ADR-0003, `adr/0003-api-docs-from-validator-schemas.md`). In development, the app turns every registered route into one OpenAPI 3.1 document with [`zod-openapi`](https://github.com/samchungy/zod-openapi), serves it at `GET /openapi.json`, and serves the [Scalar](https://scalar.com) reference with a "Try it" client at `GET /docs`.

Follow this standard whenever you create or change an HTTP route.

## What is automatic

- **Path params and body**: they come from the validator's zod schema. Params are the `:name` segments of the path, and the remaining fields are the JSON body. Never write a second schema for the docs.
- **`operationId`, global tags, the server and the shared `HttpErrorBody` schema** are filled in by the document builder.
- **An undocumented route can't slip in**: a route registered without a `doc` is left out of the document, and the guard test fails.

## What you write

| Piece                           | Location                                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Field descriptions and examples | On the zod fields of `<context>/external/validation/`, with `.meta({ description, examples })` |
| Route doc (`HttpRouteDoc`)      | `<context>/infrastructure/docs/<route>.route-doc.ts`                                           |
| Shared error examples           | `<context>/infrastructure/docs/<concept>.error-examples.ts`                                    |
| Error responses                 | `HttpErrorResponseDocs` from `src/packages/infrastructure/http/docs/`                          |

The controller receives its doc through the constructor (injected by the context's HTTP module) and registers with it. It never imports zod or an OpenAPI library:

```ts
httpServer.patch(ToggleWantedItemHttpController.PATH, (request) => this.handle(request), { input: validator, doc });
```

## Required content

1. **`summary`**: a short imperative title (`"Add a wanted item"`).
2. **`description`**: what the route does for the caller, and any rule the caller must know.
3. **`tags`**: the resource group, from a shared constant.
4. **Every field** of the validator's schema has a `description` and at least one realistic `examples` value, so "Try it" is pre-filled. Put `.meta()` on the **input side** of a transformed field (before `.transform()`); for a path param, repeat the `description` on the outer schema too. Use one coherent example (same account, same item) across a resource's routes.
5. **Every success response**: its status and description.
6. **Every error response**, with realistic examples copied from a real response of the running app:
    - `HttpErrorResponseDocs.badRequest(example)`: 400 validation error with `fields` (malformed JSON is added for you);
    - `notFound(...)` (404) and `conflict(...)` (409), when the route can answer them;
    - `unprocessable(...)` (422): one example per domain error the route can raise;
    - `internalError()` (500): always.

## Checks

- `bun test`: `test/composition-root/api-documentation.test.ts` runs the development app and fails when a served route has no doc, a documented example is rejected by the validator, a path param has no example, or a route lacks its 200 or 500 response.
- `bun run docs:check`, with the app running in development: the [Scalar CLI](https://scalar.com/tools/cli/getting-started) validates and lints `/openapi.json`. Keep it at 0 errors and 0 warnings.
- Open `http://localhost:<HTTP_PORT>/docs` and send the route's pre-filled request with "Try it".
- The Scalar MCP server (`.mcp.json`) gives agents Scalar's tools from the editor.

## Example

```ts
// external/validation/wanted-item.fields.ts
export const enabledField = z.boolean().meta({
    description: "true to bid on the item again, false to pause it",
    examples: [WANTED_ITEM_EXAMPLE.enabled],
});

// infrastructure/docs/toggle-wanted-item.route-doc.ts
export const toggleWantedItemDoc: HttpRouteDoc = {
    summary: "Enable or disable a wanted item",
    description:
        "Pauses the bidding on an item the account wants, or resumes it, without losing its max for and criteria.",
    tags: [WANTED_ITEMS_TAG],
    responses: [
        { status: HttpStatus.OK, description: "The wanted item was enabled or disabled" },
        HttpErrorResponseDocs.badRequest(ENABLED_NOT_BOOLEAN),
        HttpErrorResponseDocs.notFound(NOT_WANTED),
        HttpErrorResponseDocs.unprocessable(BLANK_NAME, NAME_OUT_OF_BOUNDS),
        HttpErrorResponseDocs.internalError(),
    ],
};

// external/di/<context>-http.module.ts
new ToggleWantedItemHttpController(http, bus, validator, toggleWantedItemDoc);
```
