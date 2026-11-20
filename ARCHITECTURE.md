# Architecture

`bot-cs` trades CS2 skins on CSGOEmpire: it watches new items and auction updates over WebSocket, evaluates items against the user's wanted items, and bids in auctions within the user's limits.

The architecture combines four ideas, each at its own level:

| Level                    | Approach                            | What it decides                                                      |
| ------------------------ | ----------------------------------- | -------------------------------------------------------------------- |
| System                   | Strategic DDD                       | Subdomains and bounded contexts, and what each one owns              |
| Inside a bounded context | Clean Architecture                  | Layers and the direction of their dependencies                       |
| Inside a layer           | Tactical DDD + GoF + PoEAA patterns | How the model and the adapters are built                             |
| Behaviour                | CQRS + event driven                 | How state changes (commands) and how the app reacts to them (events) |

## 1. Strategic DDD: subdomains and bounded contexts

The problem space is split into subdomains, and each subdomain is implemented by a bounded context with its own ubiquitous language and model. A concept may exist in two contexts with different meanings; each context models only what it needs.

```
src/contexts/
  shared-kernel/            model every context agrees on (wear names, rarities, sticker types, currencies, CS app id)
  trading/                  core domain: buying skins for profit
    shared/                 model shared by the trading subdomains (CoinCent, Float, Sticker, CSGOEmpire session)
    bidding/                subdomain: wanted items, item evaluation, auction participation, account balance and bids
```

Rules:

- `shared-kernel/` holds only what every context truly shares. Changing it affects everyone, so keep it small and stable.
- `<context>/shared/` is a shared kernel scoped to the subdomains of one context.
- `src/packages/` is not a context: it holds shared infrastructure with no business meaning (building blocks, shared ports and adapters, shared and HTTP errors, TypeScript type helpers). See `src/packages/CLAUDE.md`.

### Communication between bounded contexts

A bounded context owns its data and its implementations. Another context may **read its contracts, never its internals**:

- Each bounded context exposes what others may use through a **barrel**: the `index.ts` at the context's root folder (create it if the context doesn't have one). It exports **only contracts**: event classes and their payload types, command classes, port interfaces and DTO types.
- A context imports another context **only through its barrel** (`@/contexts/trading/bidding`), never a deep path into its `domain/`, `application/`, `infrastructure/` or `external/`.
- A context never writes or changes another context's data, and never uses another context's implementations (repositories, gateways, handlers, adapters, aggregates). To make another context act, dispatch one of its exported commands; to react to it, listen to one of its exported events.
- When the consumer needs the other context's data in its own terms, it translates at its edge (an anti-corruption layer in its own `infrastructure/`), so the other context's model doesn't leak into its domain.
- **Exception: composition roots.** `src/main.ts` (and any other composition root, such as a context's wiring module) may know every implementation of every context, because wiring them together is its only job.

## Screaming architecture

The folder tree must shout what the application does, not which framework it uses. Every bounded context follows the same naming:

- **`application/` folders are intentions**, one per use case, named as a verb phrase in kebab-case: `add-wanted-item/`, `evaluate-item/`, `place-bid/`, `leave-auction/`, `track-auction-update/`, `synchronize-account/`, `withdraw-item/`, `remove-wanted-item/`. Everything that use case owns lives inside: the command, its handler, the events it publishes, the listeners that trigger it, and the ports only it needs.
- **`domain/` folders are domain concepts**, named as nouns from the ubiquitous language: `wanted-item/`, `auction-participation/`, `account/`. Each folder holds the aggregate and everything that belongs to it (value objects, specifications, factories, `errors/`). Domain services or policies that belong to no single aggregate sit at the `domain/` root (`bid-incrementer.ts`).
- Never group by technical type (`commands/`, `handlers/`, `services/`, `entities/`, `utils/`) inside `domain/` or `application/`. Technical names belong only in `infrastructure/` and `external/` (`controllers/`, `repositories/`, `gateways/`, `http/`).

Reading `ls application/` tells what the context can do; reading `ls domain/` tells what it's about.

## 2. Clean Architecture inside each bounded context

Each folder of a bounded context is one layer of Clean Architecture:

| Folder            | Clean Architecture layer | Holds                                                                                                                                              |
| ----------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/`         | Entities                 | Enterprise rules: aggregates, entities, value objects, specifications, domain services, domain errors                                              |
| `application/`    | Use cases                | One folder per use case (command, handler, events, listeners) and the contracts (ports) the use cases need                                         |
| `infrastructure/` | Interface adapters       | Implementations of application ports (repositories, gateways), inbound controllers, and the contracts the external layer must implement            |
| `external/`       | Frameworks and drivers   | Implementations that use a library, a runtime API or the outside world: HTTP clients (fetch, axios), servers (Bun, Express), WebSockets, databases |

`src/packages/` uses the same split (`application/`, `infrastructure/`, `external/`); see `src/packages/CLAUDE.md`.

### The dependency rule

Source code dependencies point inward only: `external → infrastructure → application → domain`. No layer knows about a library or the outside world except `external/`, and no inner layer knows about an outer one. Dependency inversion makes this possible everywhere an inner layer needs something done by an outer one.

### The interface belongs to whoever uses it

A contract (interface) lives in the layer that **uses** it; its implementation lives in the next layer out. This is a rule for every kind of dependency: repositories, gateways, HTTP/WS clients, databases, communication protocols, integrations, loggers.

| Contract                                            | Used by                     | Contract lives in                                                                          | Implementation lives in                                                                 |
| --------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Repository (`WantedItemRepository`)                 | Command handlers            | `application/` (root if shared by use cases, else the use case folder)                     | `infrastructure/repositories/` (`wanted-item.repository.in-memory.ts`)                  |
| Repository used by a domain service                 | Domain service              | `domain/` (move it there only then, following the dependency rule)                         | `infrastructure/repositories/`                                                          |
| Gateway (`AuctionGateway`)                          | Command handlers, listeners | `application/<use-case>/` (`place-bid/auction.gateway.ts`)                                 | `infrastructure/gateways/` (`auction.gateway.csgoempire-adapter.ts`)                    |
| External API client (`CsgoempireAuctionHttp`)       | Gateways                    | `infrastructure/http/<provider>/` (`csgoempire-auction.http.ts` + endpoint contract types) | `external/http/<provider>/` (`csgoempire-auction.http.adapter.ts`)                      |
| Generic technical client (`HttpClient`, `WsClient`) | External API clients        | `packages/infrastructure/`                                                                 | `packages/external/` (`http-client.axios-adapter.ts`, `ws-client.socket-io-adapter.ts`) |
| Database driver, queue, server, any new protocol    | Interface adapters          | `infrastructure/`                                                                          | `external/`                                                                             |

### What each layer does

- **Domain** imports only `packages/building-blocks`, `packages/domain-primitives`, `packages/error`, `shared-kernel` and its context's `shared/domain`. No library, except through a domain primitive (`decimal.js` lives inside `Decimal`).
- **Application** orchestrates the domain and talks to the world only through its own ports. Ports speak in domain objects or in plain DTO types declared beside them, shaped for the use case, never in a provider's types.
- **Infrastructure (interface adapters)** converts data between the format that suits the use cases and the domain and the format that suits the outside. It doesn't care which library or provider runs underneath: it depends on contracts it declares itself.
    - Gateways adapt a provider's model to the port's DTOs (`AuctionGatewayCsgoempireAdapter` maps `ActiveAuction` to `AuctionDTO`).
    - Repositories adapt aggregates to a storage format.
    - Controllers adapt protocol input into a command and dispatch it on the `CommandBus`; no business rules.
    - It declares the contracts `external/` must implement, typed exactly as the provider documents them (see `test/CLAUDE.md`).
- **External (frameworks and drivers)** is the only layer that imports a library, a runtime API or talks to the outside world. It implements the infrastructure contracts and contains no business rules and no mapping to the domain. Swapping fetch for axios, Express for Bun, or a provider for a fake means replacing only this layer.
- **Composition roots** (`src/main.ts`, each context's wiring) are the only places that instantiate concrete classes. Everything else receives its collaborators through the constructor, typed by a contract.

## 3. Tactical DDD and design patterns

### Tactical DDD

| Building block | Base class / contract                    | Rules                                                                                                                                                                              | Example                                         |
| -------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Value object   | `ValueObject<T>` or a domain primitive   | Immutable (frozen), validated in the constructor, throws `DomainError`; equality by value (`equals`); value read with `getValue()`                                                 | `ItemName extends BoundedString`, `AuctionId`   |
| Entity         | `Entity<TId>`                            | Identity is a value object                                                                                                                                                         | —                                               |
| Aggregate      | `AggregateRoot<TId>`                     | Consistency boundary; private constructor and `static create(primitives)`; all changes go through its methods; records domain events with `record()`; one repository per aggregate | `WantedItem`, `Account`, `AuctionParticipation` |
| Domain error   | `DomainError`                            | One class per file in `errors/`, with a message and an `UPPER_SNAKE_CASE` code                                                                                                     | `InsufficientBalanceError`                      |
| Domain service | plain class / static methods             | Domain logic that belongs to no single aggregate                                                                                                                                   | `BidIncrementer`                                |
| Specification  | `Specification<T>` / `ISpecification<T>` | Composable business predicates (`and`, `or`, `not`)                                                                                                                                | `IsWear`, `ItemCriterion`                       |
| Repository     | port in `application/`                   | Loads and saves whole aggregates; collection-like interface                                                                                                                        | `WantedItemRepository`                          |
| Domain event   | `DomainEvent<TPayload>`                  | Something that happened inside an aggregate, carrying the `aggregateId`                                                                                                            | —                                               |

### Design patterns in use

| Pattern                         | Source       | Where                                                                                   |
| ------------------------------- | ------------ | --------------------------------------------------------------------------------------- |
| Value Object, Money             | PoEAA        | `ValueObject`, `Money`, `PositiveMoney`, `CoinCent`, `Percentage`                       |
| Repository                      | PoEAA        | `*.repository.ts` ports, `*.repository.in-memory.ts` adapters                           |
| Gateway                         | PoEAA        | `auction.gateway.ts`, `active-trades.gateway.ts` and their `*-adapter.ts`               |
| Data Transfer Object            | PoEAA        | `AuctionDTO`, command and event payloads                                                |
| Service Layer                   | PoEAA        | Command handlers orchestrate domain and ports; they hold no business rules of their own |
| Separated Interface, Plugin     | PoEAA        | Ports in inner layers, implementations in outer layers, chosen at the composition root  |
| Specification                   | Evans/Fowler | `Specification<T>`, item criteria                                                       |
| Adapter                         | GoF          | Every `*.adapter.ts` / `*-adapter.ts`: wraps a library or API behind a port             |
| Factory Method / Simple Factory | GoF          | `WantedItem.create`, `Money.fromCents`, `CriteriaFactory`, `HttpClientFactoryAdapter`   |
| Builder (fluent)                | GoF          | `FluentAccountBalance`; test builders in `__builders__/`                                |
| Composite                       | GoF          | `AndSpecification`, `OrSpecification`, `NotSpecification`                               |
| Command                         | GoF          | `Command` objects dispatched on the `CommandBus`                                        |
| Observer                        | GoF          | `EventBus` + `EventListener`                                                            |
| Mediator                        | GoF          | `CommandBus` routes each command to its handler; senders never know the handler         |

Prefer one of these before inventing a new structure. Introducing a new pattern is always welcome and is an architecture decision: record it in this file.

## 4. CQRS and event-driven flow

### Commands change state

Every mutation of the application's state is a **command** handled by exactly one **command handler**.

- A command is an intention in the imperative (`PlaceBidCommand`, `AddWantedItemCommand`). It extends `Command`, has a `static readonly COMMAND_NAME` in snake_case (`"place_bid"`), and carries only read-only primitives, so it can cross any boundary (WebSocket, HTTP, queue).
- A handler implements `CommandHandler<TCommand>`. `subscribedTo()` returns the command's `COMMAND_NAME`; `handle()` runs the use case:
    1. load the aggregate through a repository (or data through a gateway);
    2. convert primitives into value objects and let the **domain** decide (`wantedItem.evaluate(...)`, `account.reserveFor(...)`);
    3. persist through the repository and call gateways for side effects;
    4. publish what happened as **events** on the `EventBus`.
- Handlers return `Promise<void>`. A command doesn't return data; whoever needs the outcome listens to the event or reads it through a query.
- Commands are sent with `CommandBus.dispatch(command)`. The in-memory bus (`CommandBusInMemory`) keeps one handler per `COMMAND_NAME` and throws `CommandNotRegisteredError` when none is registered. Handlers are registered by the composition root.
- Who dispatches commands: inbound controllers (from WebSocket events), event listeners, and the bootstrap.

### Queries read state

Reads have no side effects and don't go through the command bus. A client that needs to read state gets it from a query and its query handler, placed next to the use case, never from a command's return value.

### Events announce what happened

- An event is a fact in the past tense (`BidPlacedEvent`, `OutbidEvent`, `ItemApprovedInAuctionEvent`). It extends `ApplicationEvent<TPayload>` (or `DomainEvent<TPayload>` when it comes from an aggregate), has a `static readonly EVENT_NAME` in snake_case, a typed payload of primitives, an `eventId` and an `ocurredAt`.
- The event lives in the folder of the use case that **produces** it (`evaluate-item/item-approved-in-auction.event.ts`).
- Command handlers publish events with `EventBus.publish([...])`. The current bus (`EventBusInMemoryAsync`) is fire-and-forget: the handler doesn't wait for the listeners, and a listener's failure doesn't fail the command.

### Event listeners react and dispatch commands

An **event listener** implements `EventListener<TEvent>`, subscribes to one event (`subscribedTo()` returns its `EVENT_NAME`) and reacts in `on(event)`. It may apply business rules to decide what to do, or none at all, and then dispatch zero, one or more commands. It never mutates state directly: the state change is always a command.

- Named `On<Event><Action>`, file `on-<event>-<action>.ts`, placed in the folder of the use case it **triggers** (`place-bid/on-outbid-counter-bid.ts`).
- A pure relay: `OnItemApprovedInAuctionPlaceBid` turns `ItemApprovedInAuctionEvent` into a `PlaceBidCommand`.
- With business rules: `OnOutbidCounterBid` loads the `AuctionParticipation`, asks the domain for the next bid (`BidIncrementer.nextFor`), and either dispatches `PlaceBidCommand` (counter-bid) or `LeaveAuctionCommand` when the next bid exceeds the participation's max bid.

### The bidding flow

```
CSGOEmpire WS "new_item"
  → NewItemWsController ──dispatch──▶ EvaluateItemCommand
      → EvaluateItemCommandHandler (WantedItem.evaluate)
          ├─publish─▶ ItemApprovedInAuctionEvent
          │             → OnItemApprovedInAuctionPlaceBid ──dispatch──▶ PlaceBidCommand
          │                 → PlaceBidCommandHandler (Account.reserveFor, AuctionGateway.placeBid)
          │                     └─publish─▶ BidPlacedEvent
          └─publish─▶ ItemApprovedOffAuctionEvent
                        → OnItemApprovedOffAuctionWithdraw ──dispatch──▶ WithdrawItemCommand

CSGOEmpire WS "auction_update"
  → AuctionUpdateWsController ──dispatch──▶ TrackAuctionUpdateCommand
      → TrackAuctionUpdateCommandHandler
          └─publish─▶ OutbidEvent
                        → OnOutbidCounterBid
                            ├─ next bid ≤ max bid ──dispatch──▶ PlaceBidCommand
                            └─ next bid > max bid ──dispatch──▶ LeaveAuctionCommand
```

### Adding a use case

1. Create `application/<use-case>/` with `<use-case>.command.ts` and `<use-case>.command-handler.ts` (tests first, see `test/CLAUDE.md`).
2. Put the domain decisions in the aggregate or a domain service, not in the handler.
3. Declare any new port in the use case folder (or at the `application/` root if shared) and implement it in `infrastructure/`.
4. Publish an event for every fact other use cases may care about, in this use case's folder.
5. To react to another use case's event, add an `on-<event>-<action>.ts` listener in the folder of the use case it triggers.
6. Register the handler and listeners in the composition root, export any command or event other contexts need from the context's barrel (`index.ts`), and add the flow to the diagram above.
