# ADR-0005: Catalog without a domain model

- **Date:** 2026-11-24
- **Status:** Accepted
- **Deciders:** DFedizko

## Context

The `catalog` bounded context is a supporting subdomain. It reads the list of CS2 items that exist from an external source (ByMykel/CSGO-API) and answers searches by name, so the frontend can pick the exact market name of a wanted item.

That list is reference data: the bot never changes an item, no item has behaviour, and there is no invariant to protect beyond what the source's contract already checks at the boundary. A first version modelled it with a `CatalogItem`, value objects for its name and image, a domain `Rarity` and a `CatalogSearch` domain service. That model only copied fields and wrapped a text match, adding layers to maintain with nothing to decide.

The rich domain model (aggregates, value objects, domain events) is worth its cost where the business rules are: the core domain, bidding.

## Decision

We will build the catalog with Clean Architecture **without a domain layer and without a use case to load it**. The catalog is a cache of the provider's data, not something the application saves:

- **The application layer holds only the search query**: `SearchCatalogItemsQuery`, its handler, the `CatalogItemsDao` port and the response DTOs, per [ADR-0004](0004-query-side-query-bus-daos-and-dtos.md).
- **The DAO is a read-through cache** in `infrastructure/`, over a `CatalogSource` port: it downloads the rows (`CatalogRow`, primitives only) once, keeps them in memory and searches them; once loaded, a search never calls the network. While nothing is loaded it throws `CatalogUnavailableError` (503 `CATALOG_UNAVAILABLE`). A failed download is logged and forgotten, so the next warm-up or search starts a new one; a search made while nothing is loaded starts one in the background, and concurrent requests share the download in flight. A startup controller warms the cache at boot without blocking the bot ([ADR-0002](0002-synchronous-buses-for-the-core.md)).
- **The search rule** (every word in the market name ignoring case, bars and parentheses; names that start with the text first, then alphabetical; a limit) is a data query, a `WHERE` and an `ORDER BY` with a database, so it lives in that DAO, not in a domain service.
- **The ByMykel adapter** behind `CatalogSource` validates every entry with zod at the boundary (non-blank market name, image URL, known rarity), skips and counts the bad ones in one warning, keeps one row per market name and maps the source's fields to rows.
- **No repository, no command.** A repository persists an aggregate, and the catalog has none; nothing the application decides is saved, so there is no command or store port to write through ([ADR-0001](0001-keep-in-memory-repositories.md) still holds: the cache lives in memory).
- Shared CS2 vocabulary (rarity, wear) comes from the shared kernel. The HTTP API keeps its own keys and maps them in `infrastructure/`.

## Consequences

- Fewer files and no mapping between rows and domain objects: what is downloaded is what is searched.
- Retrying stays simple: a failed download is retried on the next warm-up or search, with no back-off. A source that keeps failing is downloaded again on each search made while the catalog is unavailable.
- The catalog's code reads as what it is, a read-through cache of an external list with a query on top, so nobody mistakes it for a place to put business rules.
- Agents must not add a domain layer to the catalog by habit; its `CLAUDE.md` says so.
- Revisit this decision if the catalog gains rules of its own, such as user-curated items, item states that change, or rules other contexts rely on. That would be the moment to introduce aggregates and a domain layer.
