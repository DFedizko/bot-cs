---
name: cqrs-query
description: The standard for the read side of the bot's CQRS (query, query handler, query bus, DAO, response DTO, pagination and filters). Use it whenever a task reads state for a caller — a new query, a GET route, a DAO, a list, a search, a detail view, pagination or filters — even when the request only says "show X" or "return Y from the API". Reading an aggregate inside a command handler is not a query: that goes through a repository.
---

# Queries: the read side

Decided in ADR-0004 (`adr/0004-query-side-query-bus-daos-and-dtos.md`). The reference implementation is `list-wanted-items` in `src/contexts/trading/bidding/`: copy its shape.

## Rules

1. **Only drivers ask queries**: HTTP controllers today (WebSocket controllers or a CLI later). Command handlers and event listeners never use the `QueryBus`; the write side reads aggregates through repositories.
2. **A query handler never asks another query.** Shared reading logic goes into the DAO.
3. **Validation lives only at the driver**: the controller's zod schema checks input, pagination and filters; the handler trusts the query. No domain validation on reads.
4. **DAO, not repository.** Each query reads through a DAO port owned by its use case, shaped for what the driver needs, with optional filters and pagination. It returns DTOs of primitives, never aggregates or entities. The handler stays thin: defaults, one DAO call, the response.
5. **Layers:** DAO port in `application/<use-case>/`; DAO adapter (maps the data source to DTOs) in `infrastructure/daos/`; a real data source (ORM, SQL client, HTTP source) in `external/`, behind a port, so swapping the library touches only `external/`.
6. **One store for both sides in memory** (ADR-0001): the in-memory DAO and the in-memory repository of the same aggregate share one store in `infrastructure/stores/`, bound once in DI, holding records of primitives.
7. **Errors, not `Result`:** a get-by-id that finds nothing throws a domain not-found error (mapped to 404 by an `HTTP_ERROR_MAPPING`). Never return errors as values.
8. **Responses are objects** (`{ items, page, pageSize, total }`), never bare arrays. A list uses `Paginated<T>` and `Pagination` from `src/packages/building-blocks/`.

## Files

| File                                                       | Holds                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `application/<use-case>/<use-case>.query.ts`               | `XQuery extends Query<XResponse>`, `QUERY_NAME`                                                         |
| `application/<use-case>/<use-case>.query-handler.ts`       | `implements QueryHandler<XQuery, XResponse>`                                                            |
| `application/<use-case>/<use-case>.response.ts`            | The DTO type and `XResponse` (often `Paginated<XDto>`)                                                  |
| `application/<use-case>/<name>.dao.ts`                     | DAO port and its criteria type                                                                          |
| `infrastructure/daos/<name>.dao.in-memory.ts`              | In-memory DAO adapter over the shared store                                                             |
| `infrastructure/stores/<aggregate>.store.in-memory.ts`     | The store the repository and the DAO share                                                              |
| `infrastructure/controllers/<use-case>.http-controller.ts` | GET controller, with its `<Name>Input` type declared in the same file                                   |
| `external/validation/<use-case>.response-schema.ts`        | zod schema of the response, for the docs                                                                |
| `external/validation/<use-case>.schema.ts`                 | zod schema built with `queryOptionsSchema` (`src/packages/external/validation/query-options.schema.ts`) |
| `infrastructure/docs/<use-case>.route-doc.ts`              | Route doc (see the `http-route-docs` skill)                                                             |

## Recipe (test first at every step, see `test/CLAUDE.md`)

1. **Query** (`.spec.ts`: name from `QUERY_NAME`, carries its fields). A query has only `QUERY_NAME` (snake_case) and typed `readonly` fields: no id, no timestamp, no `toPrimitives`.

    ```ts
    export class ListWantedItemsQuery extends Query<ListWantedItemsResponse> {
        static readonly QUERY_NAME = "list_wanted_items";
        readonly accountId: number;
        readonly page?: number;
        readonly pageSize?: number;
        readonly sort?: WantedItemsSort;
        readonly filters?: WantedItemsFilters;
    ```

2. **Response and DAO port**: DTO fields are primitives the driver shows; the DAO takes the query's criteria (its scope, its filters and its sort) and a `Pagination`. Declare the response and DTO with `type`, not `interface` (`QueryResponse` is `Record<string, unknown>`, which an interface doesn't satisfy).

    ```ts
    export type WantedItemsCriteria = {
        accountId: number;
        filters?: WantedItemsFilters;
        sort: WantedItemsSort;
    };

    export interface WantedItemsDao {
        list(criteria: WantedItemsCriteria, pagination: Pagination): Promise<ListWantedItemsResponse>;
    }
    ```

3. **Handler** (`.test.ts`: stub the DAO with `jest.spyOn(container.get(X_DAO), "list").mockResolvedValue(page)`, assert the defaults and the response, and ask it once through `QUERY_BUS`):

    ```ts
    handle({ accountId, filters, sort = DEFAULT_WANTED_ITEMS_SORT, page, pageSize }: ListWantedItemsQuery) {
        return this.dao.list({ accountId, filters, sort }, withDefaultPage({ page, pageSize }));
    }
    ```

4. **DAO adapter** (`.test.ts`: each filter, each sort field in both orders, the page, the total, an empty result, and an item saved through the repository is listed by the DAO). Filter, then sort, then page, then map only the DTO's fields:

    ```ts
    const records = this.store.listOf(accountId).filter((record) => this.matchesEnabled(record, filters?.enabled));
    const page = PaginatorInMemory.paginate(this.sortBy(records, sort), pagination);
    return { ...page, items: page.items.map((record) => this.mapToDto(record)) };
    ```

    With a database: select only the DTO's columns, build the `WHERE` from the filters that are set and the `ORDER BY` from the sort, and get the page and its total in one atomic call.

5. **DI**: bind the DAO and the handler in the context module and add the handler to its `QUERY_HANDLERS` list (registered as `QUERY_HANDLER`); `PackagesModule` puts every `QUERY_HANDLER` on the `QueryBusInMemory`.
6. **Driver**: schema (`.spec.ts`), then controller (`.test.ts` through the context's HTTP test builder: the listed data, each filter, the page, 400 for invalid pagination and filters). Query strings arrive as strings: convert in zod. Put `.optional().meta({ description })` on the outside of each optional query field so the param gets a description.

    ```ts
    async handle(request: HttpRequest): Promise<HttpResponse> {
        const input = this.validator.validate(HttpRequestInput.fromQuery(request));
        const body = await this.queryBus.ask(new ListWantedItemsQuery(input));
        return { status: HttpStatus.OK, body };
    }
    ```

    Page, page size, limit, sort and filters come from one shared, all-optional type, typed per query. A sort is generic: a field of the query plus an order (`Sort<TField>` and `ASCENDING` / `DESCENDING` from `src/packages/building-blocks/sort.ts`). Each query names only its sortable fields and its default sort:

    ```ts
    export const WANTED_ITEMS_SORT_FIELDS = ["addedAt", "name", "max", "rarity"] as const;
    export type WantedItemsSortField = (typeof WANTED_ITEMS_SORT_FIELDS)[number];
    export type WantedItemsSort = Sort<WantedItemsSortField>;
    export const DEFAULT_WANTED_ITEMS_SORT: WantedItemsSort = { field: "addedAt", order: DESCENDING };
    export type WantedItemsFilters = { enabled?: boolean };
    export type ListWantedItemsOptions = QueryOptions<WantedItemsSortField, WantedItemsFilters>;
    ```

    The controller's input type is `ListWantedItemsOptions & { accountId: number }`, declared in the controller file, and the schema is built from the same options. Filters arrive flat in the query string and are gathered under `filters`. The sort arrives as two params, `sort` (one of the fields) and `order` (`asc` or `desc`), each falling back to the default sort; the shared helper (`src/packages/external/validation/sort.fields.ts`) gathers them into a `Sort`:

    ```ts
    export const listWantedItemsSchema = queryOptionsSchema(
        { accountId: accountIdField },
        {
            sort: { fields: WANTED_ITEMS_SORT_FIELDS, default: DEFAULT_WANTED_ITEMS_SORT },
            filters: { enabled: enabledFilterField },
        },
    ) satisfies z.ZodType<ListWantedItemsInput>;
    ```

    In the DAO, each sort field has one comparator for ascending order; `desc` reverses it.

7. **Docs**: the route doc is a function of the response body (`listWantedItemsDoc(body)`), and the HTTP module passes `new ValidatorZodAdapter(<use-case>ResponseSchema)`. That schema lives in `external/validation/<use-case>.response-schema.ts`, uses `paginatedSchema(item, examplePage)` (`src/packages/external/validation/paginated.schema.ts`) for a list, gives every field an example (or `docs:check` warns), has a spec that parses the documented example, and ends with `satisfies z.ZodType<XResponse>`, so it can't drift from the DTO; the frontend's types are generated from it. Add the 200 example, `HttpErrorResponseDocs.badQuery(...)` for 400 (no JSON body on a GET) with the shared examples of `src/packages/infrastructure/http/docs/query-options.error-examples.ts` (`PAGE_TOO_SMALL`, `PAGE_SIZE_TOO_BIG`, `unknownSortField(fields)`, `INVALID_SORT_ORDER`…), `notFound(...)` for a get-by-id, `internalError()`. `bun test` (the api-documentation guard) and `bun run docs:check` must stay clean.

## Checklist

- [ ] `queryBus.ask(new XQuery(...))` infers the response: no generic, no cast at the call site.
- [ ] The response is an object; lists are `Paginated<T>` with `total`.
- [ ] The DAO returns DTOs of primitives built field by field, never an aggregate, an entity or a stored object a caller could mutate.
- [ ] Filters are optional and applied only when set; nothing is hard-coded.
- [ ] Pagination and filters are validated only in the schema, with `MAX_PAGE_SIZE` as the cap.
- [ ] In memory, the DAO reads the same store the repository writes, bound once in DI.

## Pitfalls

- Returning an entity or aggregate from a query, or building one in the DAO (`WantedItem.fromPrimitives`, a `toDomain` mapper) just to read its fields.
- Selecting everything and trimming later; reading every row to count them.
- Data and count in two calls to the database: the page and its total can disagree.
- Hard-coded filters (`enabled: true` in the adapter) instead of optional filter fields.
- A handler asking another query, or a command handler or listener using the `QueryBus`.
- A new in-memory map in the DAO: it never sees what the repository saved.
- A bare array response, or a `Result` value instead of a thrown not-found error.
- `HttpRequestInput.from` in a GET controller: it reads the body, not the query string (`fromQuery` does).
- A 200 documented without its body schema: the frontend gets `unknown`.
