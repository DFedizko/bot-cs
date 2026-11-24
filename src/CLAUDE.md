# The bot (backend)

Bun + TypeScript. It connects to CSGOEmpire's WebSocket, evaluates new items against the wanted items, bids in auctions, keeps balances and reservations in sync per account, receives bought items through Steam, and exposes an HTTP API for the frontend. The rules of the root `CLAUDE.md` apply here too.

## Read before you change

- **Tests:** [`test/CLAUDE.md`](../test/CLAUDE.md) before writing or changing any test.
- **Architecture:** [`src/ARCHITECTURE.md`](ARCHITECTURE.md) before adding a use case, a port, an adapter, an event or a bounded context. It covers strategic DDD, the Clean Architecture layers, tactical DDD and patterns, and CQRS with events.

Summary: `src/contexts/<context>/<subdomain>/` holds each bounded context, with use-case folders in `application/` and domain-concept folders in `domain/`; dependencies point `external → infrastructure → application → domain`, and `bun run lint` enforces it.

Shared folders and bounded contexts have their own `CLAUDE.md`, which loads when you work inside them:

- [`contexts/shared-kernel/CLAUDE.md`](contexts/shared-kernel/CLAUDE.md): domain concepts with the same meaning in more than one bounded context.
- [`contexts/trading/shared/CLAUDE.md`](contexts/trading/shared/CLAUDE.md): concepts and CSGOEmpire integration shared by the trading subdomains.
- [`packages/CLAUDE.md`](packages/CLAUDE.md): shared infrastructure with no business meaning (building blocks, ports and adapters, shared and HTTP errors, TypeScript type helpers).
- [`contexts/delivery/CLAUDE.md`](contexts/delivery/CLAUDE.md): the delivery bounded context (receiving bought items through Steam trade offers): its responsibilities, language and safety rules.
- [`contexts/trading/bidding/CLAUDE.md`](contexts/trading/bidding/CLAUDE.md): the bidding bounded context, the core of the bot (wanted items, evaluating items, bidding): its responsibilities, language and rules.

## File naming

kebab-case, `<name>.<role>[.<implementation>].ts`:

| Kind                           | Pattern                                          | Example                                                                        |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| Command / handler              | `<use-case>.command.ts` / `.command-handler.ts`  | `add-wanted-item.command-handler.ts`                                           |
| Event                          | `<event>.event.ts`                               | `bid-placed.event.ts`                                                          |
| Event listener                 | `on-<event>-<action>.ts`                         | `on-outbid-counter-bid.ts`                                                     |
| Port                           | `<name>.repository.ts`, `<name>.gateway.ts`      | `auction-participation.repository.ts`                                          |
| Port implementation            | `<port>.<implementation>.ts`                     | `wanted-item.repository.in-memory.ts`, `auction.gateway.csgoempire-adapter.ts` |
| External API contract / client | `<provider>-<area>.http.ts` / `.http.adapter.ts` | `csgoempire-auction.http.adapter.ts`                                           |
| Controller                     | `<event>.ws-controller.ts`                       | `new-item.ws-controller.ts`                                                    |
| Domain error                   | `<name>.error.ts`                                | `insufficient-balance.error.ts`                                                |
| Factory                        | `<name>.factory.ts`                              | `criteria.factory.ts`                                                          |

Class names follow the file name in PascalCase (`WantedItemRepositoryInMemory`, `AuctionGatewayCsgoempireAdapter`).

## Imports

Use the `@/` alias (`@/packages/...`, `@/contexts/...`) for anything outside the current bounded context; relative imports inside it. Use `import type` for interfaces and types. Another bounded context is imported only through its barrel (`index.ts`, contracts only), except in composition roots.

## Backend code rules

- **Dependency inversion always.** Classes receive their collaborators through the constructor, typed by a port interface. Never `new` a concrete dependency inside a class; only composition roots (`src/composition-root/`, each context's `external/di/`) create concrete classes.
- **OOP first.** Model behaviour with classes. Use standalone functions only for small, specific cases, such as a pure helper with no state.
- **SOLID.** One responsibility per class, small focused interfaces, extend by adding adapters instead of editing use cases.
- **No generator functions** (`function*`, `yield`) unless there's no reasonable alternative.
- **Libraries stay behind adapters.** Only `packages/external`, `<context>/external` and domain primitives import third-party libraries or runtime modules. Prefer Bun-native adapters when adding new ones.

## Bun APIs

- `Bun.serve()` for HTTP and WebSockets (see `http-server.bun-adapter.ts`, `ws-server.bun-adapter.ts`); built-in `WebSocket`, not `ws`.
- `bun:sqlite`, `Bun.redis`, `Bun.sql` instead of `better-sqlite3`, `ioredis`, `pg`.
- `Bun.file` over `node:fs`, Bun.$`cmd` instead of execa.
- Bun loads `.env` by itself; read it only through the `Env` port (`EnvZodAdapter`), never `Bun.env` / `process.env` elsewhere.
- Test globals (`describe`, `it`, `expect`, `beforeEach`, `jest`, `expectTypeOf`...) need no import (`bun-test.d.ts`); import only types from `bun:test`.
- More: `node_modules/bun-types/docs/**.md`.
