# catalog

The **catalog** bounded context is a supporting subdomain: it owns the list of **CS2 items that exist** (every skin × wear × StatTrak/Souvenir version, plus vanilla knives and gloves), with each item's picture and rarity, and lets drivers search it by name. It knows nothing about accounts, wanted items, auctions or bids; those are `trading`.

## Responsibilities

- Load the catalog once when the bot starts, from a free third-party source (ByMykel/CSGO-API), into memory (ADR-0001).
- Answer searches by name, so the frontend can pick an item's exact market name for a wanted item.

Out of scope: prices, inventories, images on wanted items or auctions (a later task), and proxying or downloading images.

## Ubiquitous language

| Term             | Meaning                                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog          | Every CS2 item the source lists, one per market name.                                                                                                                                                          |
| Catalog item     | One item of the catalog: market name, weapon, skin (null for a vanilla item), wear (null when it has none), StatTrak, Souvenir, category, rarity and image URL.                                                |
| Market hash name | The item's market name (`AWP \| Asiimov (Field-Tested)`), the one wanted items use. Unique in the catalog: the first entry of a name wins (Doppler phases share one).                                          |
| Rarity           | Our own vocabulary, never the source's ids: `consumer`, `industrial`, `milspec`, `restricted`, `classified`, `covert`, `extraordinary`, `contraband`.                                                          |
| Catalog search   | The domain rule of a search: every word of the text in the market name, case-insensitive, ignoring `\|`, `(` and `)`; names that start with the text first, then the rest, each alphabetical; at most a limit. |
| Catalog source   | The port that loads the catalog from the outside world.                                                                                                                                                        |

## Folders

- `domain/catalog-item/`: `CatalogItem`, its value objects and `Rarity`.
- `domain/catalog-search/`: `CatalogSearch`, the search rule and its limits.
- `application/load-catalog/`: `LoadCatalogCommand`, its handler and the ports it uses (`CatalogSource`, `CatalogRepository`).
- `application/search-catalog-items/`: the query, its handler, response DTOs, the DAO port and `CatalogUnavailableError`.
- `infrastructure/`: the ByMykel contract types (`http/bymykel/`), the source adapter that validates and maps them (`gateways/`), the shared store with its repository and DAO, the startup and HTTP controllers, and the route docs.
- `external/`: the ByMykel HTTP adapter, the zod schemas and the DI modules.

## Rules

- Loading never runs on the bidding path (ADR-0002): the bootstrap starts it without awaiting it, through the error-boundary command dispatcher, so a failed load is logged and the bot keeps running. Until a load succeeds, searches answer 503 `CATALOG_UNAVAILABLE`.
- Source entries the contract rejects are skipped and counted in one warning log; they never fail the load.
- The repository and the DAO share one in-memory store; the DAO returns DTOs, never `CatalogItem`s.
- `imageUrl` is the source's URL as is: the bot never downloads or proxies images.
- Other contexts use the catalog only through its barrel (`index.ts`).
- The source's shape comes from the real file; tests use the trimmed fixture in `test/.../external/http/bymykel/__mocks__/` and never touch the network.
