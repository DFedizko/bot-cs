# ADR-0004: Query side: query bus, DAOs and DTOs

- **Date:** 2026-11-23
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The bot follows CQRS, but only its write side existed: commands, a command bus, command handlers and repositories. Commands return nothing ([ADR-0002](0002-synchronous-buses-for-the-core.md) keeps them void and synchronous for the core flow), so nothing could read state back. The frontend needs to read it, starting with the wanted items of an account and then a catalog search.

Reading through the write side would leak aggregates (with their invariants and behaviour) to callers, load whole aggregates to show a few fields, and couple display needs to the domain model. Every later read must follow one standard, so it is decided once.

## Decision

We will build a read side next to the write side, in process, with request/response queries.

**Contract** (`src/packages/`):

- `Query<TResponse>` (`building-blocks/query.ts`): built like `Command`, its `name` comes from the class's `static readonly QUERY_NAME` (snake_case). It carries only typed `readonly` fields: no id, no timestamp, no `toPrimitives`, since a query is never published. A phantom `response` field carries the response type, so `queryBus.ask(new XQuery(...))` infers the response with no generic and no cast at the call site.
- `QueryResponse` (`building-blocks/query-response.ts`): a plain object type. Responses are always objects (`{ items, page, pageSize, total }`), never bare arrays.
- `QueryHandler<TQuery, TResponse>` (`building-blocks/query-handler.ts`): `subscribedTo()` and `handle(query): Promise<TResponse>`.
- `QueryBus` (`application/query-bus.ts`): `register(handler)` and `ask(query)`. `QueryBusInMemory` (`infrastructure/query-bus/`) keeps one handler per `QUERY_NAME` and throws `QueryNotRegisteredError` (`error/`) when none is registered; the only cast of the chain lives there. The composition root registers every handler bound as `QUERY_HANDLER`.
- Pagination: `Pagination` (`page`, `pageSize`) with `FIRST_PAGE`, `DEFAULT_PAGE_SIZE` and `MAX_PAGE_SIZE` (`building-blocks/pagination.ts`), and `Paginated<T>` (`items`, `page`, `pageSize`, `total`) as the response of a list.

**Rules:**

1. Only drivers ask queries: HTTP controllers today, WebSocket controllers or a CLI later. The controller validates its input with its zod schema, builds the query and calls `queryBus.ask`. Command handlers and event listeners never use the query bus; the write side reads aggregates through repositories.
2. A query handler never asks another query, as a command handler never dispatches another command. Shared reading logic goes into the DAO.
3. Validation lives only at the driver: input, pagination and filters are checked by the controller's validator; the handler trusts the query. No domain validation on reads.
4. Each query reads through a DAO port owned by its use case (`application/<use-case>/<name>.dao.ts`), shaped for what the driver needs, with optional filters and pagination. It returns DTOs of primitives, never aggregates or entities. The handler stays thin: defaults, one DAO call, the response. A DAO selects only the fields its DTO needs; with a database, a page and its total come from one atomic call.
5. The DAO port lives in `application/`; its adapter, which maps the data source to DTOs, in `infrastructure/`; a real data source (an ORM, a SQL client, an HTTP source) in `external/`, behind a port, so swapping the library touches only `external/`.
6. While storage is in memory ([ADR-0001](0001-keep-in-memory-repositories.md)), the in-memory DAO and the in-memory repository of the same aggregate share one store of records in the context's `infrastructure/`, bound once in DI, so the DAO reads what the repository wrote.
7. Errors are thrown, never returned as values: a get-by-id that finds nothing throws a domain not-found error, mapped to 404 by the HTTP error mapper.

The `cqrs-query` skill (`.claude/skills/cqrs-query/`) teaches the recipe, with `list-wanted-items` in bidding as the reference implementation.

## Consequences

- Reads no longer touch aggregates: the frontend gets DTOs shaped for it, and the domain model can change without breaking them.
- Every read follows one shape (query, handler, DAO port, adapter, response), so a new `GET` route is a recipe, checked by the api-documentation guard.
- A query is always in-process request/response, unlike events. Commands stay void and synchronous (ADR-0002); a caller that needs state after a command asks a query.
- The in-memory repository now stores records and rebuilds the aggregate on each read, a small cost on the core flow in exchange for one store both sides share, as a database would be.
- A database later means a DAO adapter per query and a data-source port in `external/`; the handlers, controllers and DTOs stay as they are.
