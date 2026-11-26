# shared-kernel

The shared kernel holds **domain concepts that mean exactly the same thing in more than one bounded context**: the CS2 vocabulary every context speaks (wear names and their acronyms, item and sticker rarities, sticker types), the item's Steam market hash name (`MarketHashName`), the marketplace account id (`AccountId`), the currencies the bot handles (`COIN`, `USD`, `BRL`) and fixed facts of the game (`CS_APP_ID`).

## What belongs here

A concept moves here only when **all** of these hold:

- Two or more bounded contexts use it today, not "maybe later".
- It has the same meaning, the same values and the same rules in each of them. If one context needs a different rule or extra data, it's not shared: each context models its own version.
- It is pure domain: no I/O, no library, no provider's format.

When a concept is shared only by the subdomains of one context, it belongs in that context's `shared/` (e.g. `trading/shared/domain`), not here.

## What doesn't belong here

- Aggregates, entities, repositories, use cases, commands or events: those belong to one bounded context. The one exception is `events/` (below).
- A provider's vocabulary or payload types (e.g. CSGOEmpire's field names): those stay in the context's `infrastructure/`.
- Generic building blocks with no CS2 meaning (`Money`, `Percentage`, `BoundedString`, `ValueObject`): those are in `src/packages/`.

## Integration events (`events/`)

`events/` holds the **integration events** two bounded contexts exchange when neither should depend on the other (today the sale flow between `trading/deposit` and `delivery`, [ADR-0006](../../../adr/0006-selling-on-csgoempire.md)): `ItemSold`, `SaleOfferSent`, `SaleOfferAccepted`, `SaleOfferCancelled` and the types their payloads share.

- Contracts only: each event extends `IntegrationEvent` (`src/packages/building-blocks`), which deep-freezes a copy of its payload; no behaviour, no validation, no handlers or listeners.
- Payloads carry primitives (and enums of this folder), so they can later cross a process boundary.
- `bun run lint` enforces that this folder imports only `src/packages` core building blocks and the shared kernel's `domain/`, and that only application, infrastructure and external layers import it, never a domain layer.
- Prefer adding a field over renaming or removing one: every producer and consumer changes with it.

## Rules

- Folder structure: `domain/` for concepts and `events/` for integration events, one concept or event per file, named after it (`wear-name.ts`, `item-sold.event.ts`).
- Fixed sets of values are `enum`s whose members are `UPPER_SNAKE_CASE` and whose values are the official CS2 / marketplace display names (`WearName.FIELD_TESTED = "Field-Tested"`).
- Fixed values are exported `UPPER_SNAKE_CASE` constants (`CS_APP_ID`, `COIN`), built from `src/packages/domain-primitives` when they need behaviour (`Currency.create(...)`).
- Imports only from `src/packages/domain-primitives`, `src/packages/building-blocks` and `src/packages/error`. Never from a bounded context.
- Every context depends on this folder, so a change here is a change everywhere: run the whole test suite (`bun test`) after touching it, and prefer adding over renaming or removing.
