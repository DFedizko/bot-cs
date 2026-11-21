# ADR-0003: API documentation generated from the validator schemas

- **Date:** 2026-11-21
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The bot exposes an HTTP API (wanted items: add, edit, remove, enable/disable per account). Its input is validated by zod schemas in each context's `external/validation/`, behind the `Validator<T>` port, and its errors are mapped to `{ code, message, fields? }`. We want interactive documentation with a working "Try it" client, and it must never drift from the real validation.

Three ways to produce OpenAPI from zod were considered: zod 4's native `z.toJSONSchema`, the `zod-openapi` library and `@asteasolutions/zod-to-openapi`. Libraries may only be imported in `external/`, contexts expose only contracts, and controllers must keep a single job.

## Decision

We will generate one OpenAPI 3.1 document from the same zod schemas the validators use, with zod 4's native `z.toJSONSchema` (JSON Schema 2020-12, the dialect of OpenAPI 3.1) and a small builder of our own, with no OpenAPI library.

- The route documentation contract (`HttpRouteDoc<TSchema>`) and the ports `ApiDocument` and `ApiReferencePage` live in `src/packages/infrastructure/http/docs/`, with the controllers that serve `GET /openapi.json` and `GET /docs`.
- The builder (`ApiDocumentZodAdapter`), the shared error body schema and the Scalar page (`ApiReferenceScalarAdapter`, loading a pinned `@scalar/api-reference` ESM build from jsDelivr) live in `src/packages/external/openapi/`.
- Each context documents its routes in `<context>/external/docs/<route>.route-doc.ts`, reusing its validator's schema, and binds them on the `HTTP_ROUTE_DOC` multi-binding. HTTP controllers are bound on the `HTTP_CONTROLLER` multi-binding, which the bootstrap starts. Controllers know nothing about their documentation.
- The documentation is served only in development (`PackagesDevModule`), because the API has no authentication.
- A guard test runs the development app and fails when a served route is undocumented, or when the documented examples or fields disagree with what the validator accepts.

## Consequences

- No new dependency, and the documented schemas are the validation schemas, so they cannot drift; the guard test catches a route left undocumented.
- Examples live on the zod fields (`.meta({ description, examples })`). zod drops metadata placed after a `transform`, so the metadata goes on the input side of transformed fields.
- We maintain the OpenAPI builder ourselves (path params, bodies, responses). If we need `$ref` components, callbacks or other OpenAPI features it doesn't cover, we revisit this and consider `zod-openapi`.
- The docs page needs the jsDelivr CDN in the browser; serving the docs in production would need authentication first.
