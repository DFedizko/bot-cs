# catalog

The **catalog** bounded context is a supporting subdomain: it owns the list of **CS2 items that exist** (every skin × wear × StatTrak/Souvenir version, plus vanilla knives and gloves), with each item's picture and rarity, and lets drivers search it by name. It knows nothing about accounts, wanted items, auctions or bids; those are `trading`.

## Responsibilities

- Cache the catalog in memory (ADR-0001), downloaded from a free third-party source (ByMykel/CSGO-API) and warmed when the bot starts.
- Answer searches by name, so the frontend can pick an item's exact market name for a wanted item.

Out of scope: prices, inventories, images on wanted items or auctions (a later task), and proxying or downloading images.

The catalog has **no domain layer by design** ([ADR-0005](../../../adr/0005-catalog-without-a-domain-model.md)): it is a read-through cache of the provider's data; no use case loads it, and searching is a DAO. Don't add `domain/`, aggregates, a repository or a load command to it.

## Ubiquitous language

| Term             | Meaning                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Catalog          | Every CS2 item the source lists, one row per market name.                                                                                                                                                                                                                                        |
| Catalog row      | One item of the catalog (`CatalogRow` in `infrastructure/sources/`, primitives only): market name, weapon, skin (null for a vanilla item), wear (null when it has none), StatTrak, Souvenir, category, rarity and image URL.                                                                     |
| Market hash name | The item's market name (`AWP \| Asiimov (Field-Tested)`), the one wanted items use. Unique in the catalog: the source adapter keeps the first entry of a name (Doppler phases share one).                                                                                                        |
| Rarity           | The shared kernel's `Rarity` (official CS2 names) in rows and DTOs. The HTTP API answers its own keys (`consumer`, `industrial`, `milspec`, `restricted`, `classified`, `covert`, `extraordinary`, `contraband`), mapped in one place (`infrastructure/controllers/catalog-items.http-body.ts`). |
| Catalog search   | The search rule, implemented by the DAO: every word of the text in the market name, case-insensitive, ignoring `\|`, `(` and `)`; names that start with the text first, then the rest, each alphabetical; at most a limit.                                                                       |
| Catalog source   | The infrastructure port the cache downloads the rows through.                                                                                                                                                                                                                                    |

## Folders

- `application/search-catalog-items/`: the only use case: the query (with its limits), its handler, response DTOs, the DAO port and `CatalogUnavailableError`.
- `infrastructure/sources/`: the `CatalogSource` port and `CatalogRow`.
- `infrastructure/daos/`: the read-through cache, which implements the DAO and the search rule.
- `infrastructure/`: also the ByMykel contract types (`http/bymykel/`), the source adapter that validates, de-duplicates and maps entries to rows (`gateways/`), the startup controller that warms the cache, the HTTP controller with the rarity-to-key mapping, and the route docs.
- `external/`: the ByMykel HTTP adapter, the zod schemas and the DI modules.

## Rules

- Warming never runs on the bidding path (ADR-0002): the bootstrap starts it without awaiting it. Until a download succeeds, searches answer 503 `CATALOG_UNAVAILABLE`. A failed download is logged, and the next warm-up or search starts a new one; once loaded, searches never call the network.
- Source entries the contract rejects are skipped and counted in one warning log; they never fail the load.
- No repository and no command: nothing the application decides is saved. The cache keeps its own copy of the rows and returns DTO copies, never the cached rows.
- `imageUrl` is the source's URL as is: the bot never downloads or proxies images.
- Other contexts use the catalog only through its barrel (`index.ts`).
- The source's shape comes from the real file; tests use the trimmed fixture in `test/.../external/http/bymykel/__mocks__/` and never touch the network.
