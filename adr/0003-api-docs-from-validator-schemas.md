# ADR-0003: API documentation generated from the validator schemas

- **Date:** 2026-11-21
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The bot exposes an HTTP API (wanted items: add, edit, remove, enable/disable per account). Its input is validated by zod schemas in each context's `external/validation/`, behind the `Validator<T>` port, and its errors are mapped to `{ code, message, fields? }`. We want interactive documentation with a working "Try it" client, and it must never drift from the real validation.

Three ways to produce OpenAPI from zod were considered: zod 4's native `z.toJSONSchema`, the `zod-openapi` library and `@asteasolutions/zod-to-openapi`. For how each route gets its docs, we considered separate route-doc bindings, docs registered with the route (Fastify style) and switching the server to Fastify with `@fastify/swagger`. Libraries may only be imported in `external/`, contexts expose only contracts, controllers must keep a single job, and the repo prefers Bun-native adapters.

## Decision

We will document each route where it is registered, as Fastify does with a route schema, and generate the OpenAPI 3.1 document and the reference page with ready-made libraries instead of our own code.

- The `HttpServer` port takes optional route options, `{ input, doc }`: the route's `Validator` and its `HttpRouteDoc` (summary, description, tags, responses). Controllers receive their doc through the constructor and register with it, so they never import zod or an OpenAPI library.
- `HttpServerRouteRecordingDecorator` (`src/packages/infrastructure/http/`) wraps the real server and records every route; it is also the `HttpRouteCatalog`.
- `ApiDocumentZodOpenApiAdapter` (`src/packages/external/openapi/`) builds the document with `zod-openapi`'s `createDocument`, taking each route's params and body from its validator's zod schema, and fills in operation ids, tags, the server and the shared `HttpErrorBody` schema.
- `ApiReferenceScalarAdapter` renders the page with Scalar's `renderApiReference` (`@scalar/client-side-rendering`).
- The docs are served only in development (`PackagesDevModule`), because the API has no authentication.
- The Scalar MCP server is configured for the project (`.mcp.json`), and `bun run docs:check` validates and lints the served document with the Scalar CLI.
- A guard test runs the development app and fails when a served route has no doc or its documented examples are rejected by the validator.

## Consequences

- The documented input is the validator's schema by construction, so it cannot drift, and no OpenAPI builder or HTML template is ours to maintain.
- Summaries, descriptions and error responses are still written by hand: no library can infer which domain errors a route raises.
- Field examples live on the zod fields (`.meta({ description, examples })`). zod drops metadata placed after a `transform`, so it goes on the input side, and a path param repeats its description on the outer schema.
- `docs:check` runs the Scalar CLI with `npm exec`, because under `bun run` the CLI's linter binary is blocked by Bun's postinstall policy.
- The docs page loads Scalar from the jsDelivr CDN; serving the docs in production would need authentication first.
