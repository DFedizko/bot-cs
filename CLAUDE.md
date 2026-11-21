# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

`bot-cs` is a Bun + TypeScript trading bot for CS2 skin marketplaces. It operates on CSGOEmpire today, and is built so other marketplaces (e.g. Steam) can be added as new bounded contexts.

What it does:

- Connects to the marketplace's WebSocket and listens to new items and auction updates in real time.
- Evaluates each new item against the user's **wanted items**: the maximum price over the recommended price (`maxFor`) and criteria such as wear.
- Bids in auctions for approved items, counter-bids when outbid, and leaves the auction when the next bid would exceed the item's max price.
- Keeps the user's account balance and reservations in sync, so it never bids more than it can pay.

It is built with DDD, Clean Architecture, and CQRS with events (see [Architecture](#architecture)).

## Marketplace API docs (read on demand)

CSGOEmpire's API reference, as an index written for LLMs: `https://docs.csgoempire.com/reference/llms.txt`

- **Read it only** when the task creates or changes code that talks to CSGOEmpire: an HTTP endpoint, a WebSocket event, their contract types in `infrastructure/http/csgoempire/` or `shared/infrastructure/csgoempire/`, an adapter in `external/`, or a fake/mock of them in `test/`.
- **Don't read it** for domain, application or refactoring work that doesn't touch the API.
- Fetch the index first, then only the pages of the endpoints or events you need, never the whole reference.
- The docs are the source of truth for contract types, mocks and fakes: see [`test/CLAUDE.md`](test/CLAUDE.md#external-api-contracts-mocks-and-fakes).

## Steam integration (read on demand)

Read this only when the task touches Steam: logging in, trade offers, mobile confirmations or inventories.

- **Libraries** (Node, used through adapters in `external/` only):
    - [`steam-user`](https://github.com/DoctorMcKay/node-steam-user): Steam client login and session (web cookies).
    - [`steamcommunity`](https://github.com/DoctorMcKay/node-steamcommunity): community session, mobile trade confirmations (`acceptConfirmationForObject`).
    - [`steam-tradeoffer-manager`](https://github.com/DoctorMcKay/node-steam-tradeoffer-manager): list, poll, accept and cancel trade offers (`newOffer`, `pollInterval`, `getOffers`, `offer.accept`, `offer.getUserDetails` for escrow).
    - [`steam-totp`](https://github.com/DoctorMcKay/node-steam-totp): 2FA login codes from `shared_secret`, confirmation keys from `identity_secret`.
    - Docs and Q&A: the libraries' GitHub wikis and `https://dev.doctormckay.com` (rate limits, polling).
- **Reference bot:** [`kevalane/csgoempire-bot`](https://github.com/kevalane/csgoempire-bot), a small CSGOEmpire + Steam trading bot (`src/lib/SteamBot.ts` for the Steam session and trade actions, `src/services/` for the buy/sell flows). Use it to understand behaviour only: it is procedural, single-account and untested, so never copy its structure; this repo's architecture and rules always apply.

## Tests

**Strict TDD (Kent Beck): never write production code without a failing test written first.** Red → green → refactor.

Before writing or changing any test, read [`test/CLAUDE.md`](test/CLAUDE.md). It covers the TDD cycle, the folder layout, file suffixes, test doubles, FIRST and AAA.

## Architecture

Before adding a use case, a port, an adapter or a bounded context, read [`ARCHITECTURE.md`](ARCHITECTURE.md). It covers:

- **Strategic DDD:** the subdomains and bounded contexts and how they talk to each other.
- **Clean Architecture:** the layers inside each context (`domain`, `application`, `infrastructure`, `external`) and their dependency direction.
- **Tactical DDD and patterns:** the building blocks, plus the GoF and PoEAA patterns in use.
- **CQRS and events:** every state change is a command with one handler, handlers publish events, and listeners react by dispatching commands.

Summary: `src/contexts/<context>/<subdomain>/` holds each bounded context, with use-case folders in `application/` and domain-concept folders in `domain/`, and dependencies point `external → infrastructure → application → domain`.

Shared folders have their own `CLAUDE.md`; read it before changing anything inside them:

- [`src/contexts/shared-kernel/CLAUDE.md`](src/contexts/shared-kernel/CLAUDE.md): domain concepts with the same meaning in more than one bounded context.
- [`src/contexts/trading/shared/CLAUDE.md`](src/contexts/trading/shared/CLAUDE.md): concepts and CSGOEmpire integration shared by the trading subdomains.
- [`src/packages/CLAUDE.md`](src/packages/CLAUDE.md): shared infrastructure with no business meaning (building blocks, ports and adapters, shared and HTTP errors, TypeScript type helpers).

## Architecture Decision Records

Architecture decisions are recorded in [`adr/`](adr/README.md). Follow the accepted ones. When the user makes a new architectural decision, register it there as a new ADR, following the format and numbering in `adr/README.md`.

## Conventions

### File naming

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

### Imports

Use the `@/` alias (`@/packages/...`, `@/contexts/...`) for anything outside the current bounded context. Relative imports are fine inside the same context. Use `import type` for interfaces and types.

Another bounded context is imported only through its barrel (`@/contexts/trading/bidding`), which exports contracts only (commands, events, ports, DTOs). Deep imports into another context and use of its implementations are forbidden, except in composition roots. See "Communication between bounded contexts" in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Code rules

- **Dependency inversion always.** Classes receive their collaborators through the constructor, typed by a port interface. Never `new` a concrete dependency inside a class; only composition roots (`src/main.ts` and the context wiring) create concrete classes.
- **OOP first.** Model behaviour with classes. Use standalone functions only for small, specific cases, such as a pure helper with no state (e.g. `CoinCent`).
- **SOLID.** In particular: one responsibility per class, small focused interfaces, and extend by adding new adapters, not by editing use cases.
- **No generator functions** (`function*`, `yield`) unless there's no reasonable alternative.
- **No `for` / `while` loops.** Use array methods: `map`, `filter`, `reduce`, `forEach`, `some`, `every`, `find`, `flatMap`, `Promise.all`.
- **Extract logic into declarative private methods** named with an imperative verb (`mapToDto`, `rejectInvalidBid`). The callback of a loop method that does more than one trivial expression becomes its own named method.
- **At most 300 lines per file**, and each file has a single responsibility. Split before you reach the limit.
- **No magic numbers or strings.** Name them as `UPPER_SNAKE_CASE` constants (`MIN_BID_CENTS`, `CS_APP_ID`), or as static constants on the class they belong to (`COMMAND_NAME`).
- **No comments.** The code must explain itself through names.
- **Variables, functions, methods and constants have at most 30 characters.** Class and file names follow the naming pattern above and may be longer.
- **Libraries stay behind adapters.** Only `packages/external`, `<context>/external` and domain primitives import third-party libraries. Prefer Bun-native adapters when adding new ones.

Generated files (type definitions, lockfiles and the like) are exempt from these rules. Never edit them by hand; regenerate them with their tool, and gitignore them when the tool can rebuild them.

## Documentation files

**Never create, edit or delete any `.md` file** (`CLAUDE.md` at any level, `ARCHITECTURE.md`, `README.md`, or any other Markdown file) unless the user explicitly asks for that change. If you believe a doc should change, propose the change in your final summary and let the user decide.

## Commands

- `bun install`: install dependencies
- `bun test`: run all tests (`bun test <path or name filter>` to run a subset)
- `bun run lint` / `bun run lint:fix`: ESLint
- `bun run format`: Prettier on `src` and `test` (4 spaces, double quotes, 120 columns)

## Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv. Read it only through the `Env` port (`EnvZodAdapter`), never `Bun.env` / `process.env` elsewhere.

### APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes (see `http-server.bun-adapter.ts`, `ws-server.bun-adapter.ts`).
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

### Test runner

Test globals (`describe`, `it`, `test`, `expect`, `beforeEach`, `jest`, `expectTypeOf`...) are available without importing them (see `bun-test.d.ts`). Import only types from `bun:test` (e.g. `import type { Mock } from "bun:test"`).

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
