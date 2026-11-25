# ADR-0005: Catalog without a domain model

- **Date:** 2026-11-24
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The `catalog` bounded context is a supporting subdomain. It loads the list of CS2 items that exist from an external source (ByMykel/CSGO-API) once at startup and answers searches by name, so the frontend can pick the exact market name of a wanted item.

That list is reference data: the bot never changes an item, no item has behaviour, and there is no invariant to protect beyond what the source's contract already checks at the boundary. A first version modelled it with a `CatalogItem`, value objects for its name and image, a domain `Rarity` and a `CatalogSearch` domain service. That model only copied fields and wrapped a text match, adding layers to maintain with nothing to decide.

The rich domain model (aggregates, value objects, domain events) is worth its cost where the business rules are: the core domain, bidding.

## Decision

We will build the catalog with Clean Architecture **without a domain layer**:

- **Loading is a transaction script.** `LoadCatalogCommandHandler` asks the `CatalogSource` port for plain rows (`CatalogRow`, a DTO of primitives in `application/`) and writes them through the `CatalogStore` port. The ByMykel adapter validates every entry with zod at the boundary, skips and counts the bad ones, keeps one row per market name and maps the source's fields to rows.
- **Searching is a DAO**, per [ADR-0004](0004-query-side-query-bus-daos-and-dtos.md). The search rule (every word in the market name ignoring case, bars and parentheses; names that start with the text first, then alphabetical; a limit) is a data query, a `WHERE` and an `ORDER BY` with a database, so it lives in the DAO adapter, not in a domain service.
- **No repository.** A repository persists an aggregate, and the catalog has none. The load writes through a store port named after what it does (`CatalogStore.replaceAll`), implemented by the in-memory store the search DAO reads ([ADR-0001](0001-keep-in-memory-repositories.md)).
- Shared CS2 vocabulary (rarity, wear) comes from the shared kernel. The HTTP API keeps its own keys and maps them in `infrastructure/`.

## Consequences

- Fewer files and no mapping between rows and domain objects: what is loaded is what is searched.
- The catalog's code reads as what it is, a cache of an external list with a query on top, so nobody mistakes it for a place to put business rules.
- Agents must not add a domain layer to the catalog by habit; its `CLAUDE.md` says so.
- Revisit this decision if the catalog gains rules of its own, such as user-curated items, item states that change, or rules other contexts rely on. That would be the moment to introduce aggregates and a domain layer.
