# catalog

The **catalog** bounded context is a supporting subdomain: it owns the list of **CS2 items that exist** (every skin × wear × StatTrak/Souvenir version, plus vanilla knives and gloves), with each item's picture and rarity, and lets drivers search it by name. It knows nothing about accounts, wanted items, auctions or bids; those are `trading`.

## Responsibilities

- Load the catalog once when the bot starts, from a free third-party source (ByMykel/CSGO-API), into memory (ADR-0001).
- Answer searches by name, so the frontend can pick an item's exact market name for a wanted item.

Out of scope: prices, inventories, images on wanted items or auctions (a later task), and proxying or downloading images.

The catalog has **no domain layer by design** ([ADR-0005](../../../adr/0005-catalog-without-a-domain-model.md)): it is reference data, so loading is a transaction script and searching is a DAO. Don't add `domain/`, aggregates or a repository to it.

## Ubiquitous language

| Term             | Meaning                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Catalog          | Every CS2 item the source lists, one row per market name.                                                                                                                                                                                                                                        |
| Catalog row      | One item of the catalog (`CatalogRow`, primitives only): market name, weapon, skin (null for a vanilla item), wear (null when it has none), StatTrak, Souvenir, category, rarity and image URL.                                                                                                  |
| Market hash name | The item's market name (`AWP \| Asiimov (Field-Tested)`), the one wanted items use. Unique in the catalog: the source adapter keeps the first entry of a name (Doppler phases share one).                                                                                                        |
| Rarity           | The shared kernel's `Rarity` (official CS2 names) in rows and DTOs. The HTTP API answers its own keys (`consumer`, `industrial`, `milspec`, `restricted`, `classified`, `covert`, `extraordinary`, `contraband`), mapped in one place (`infrastructure/controllers/catalog-items.http-body.ts`). |
| Catalog search   | The search rule, implemented by the DAO: every word of the text in the market name, case-insensitive, ignoring `\|`, `(` and `)`; names that start with the text first, then the rest, each alphabetical; at most a limit.                                                                       |
| Catalog source   | The port that loads the rows from the outside world.                                                                                                                                                                                                                                             |
| Catalog store    | The port the load writes the rows through; its in-memory implementation is the store the search DAO reads.                                                                                                                                                                                       |

## Folders

- `application/`: `CatalogRow` at its root, shared by both use cases.
- `application/load-catalog/`: `LoadCatalogCommand` and its handler (the transaction script), with the ports it uses (`CatalogSource`, `CatalogStore`).
- `application/search-catalog-items/`: the query (with its limits), its handler, response DTOs, the DAO port and `CatalogUnavailableError`.
- `infrastructure/`: the ByMykel contract types (`http/bymykel/`), the source adapter that validates, de-duplicates and maps entries to rows (`gateways/`), the in-memory store and the search DAO, the startup and HTTP controllers with the rarity-to-key mapping, and the route docs.
- `external/`: the ByMykel HTTP adapter, the zod schemas and the DI modules.

## Rules

- Loading never runs on the bidding path (ADR-0002): the bootstrap starts it without awaiting it, through the error-boundary command dispatcher, so a failed load is logged and the bot keeps running. Until a load succeeds, searches answer 503 `CATALOG_UNAVAILABLE`.
- Source entries the contract rejects are skipped and counted in one warning log; they never fail the load.
- No repository: the load writes through `CatalogStore`, and the search DAO reads the same in-memory store, bound once in DI. The DAO returns DTO copies, never the stored rows.
- `imageUrl` is the source's URL as is: the bot never downloads or proxies images.
- Other contexts use the catalog only through its barrel (`index.ts`).
- The source's shape comes from the real file; tests use the trimmed fixture in `test/.../external/http/bymykel/__mocks__/` and never touch the network.
