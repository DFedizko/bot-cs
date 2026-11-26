# shared-kernel

The shared kernel holds **domain concepts that mean exactly the same thing in more than one bounded context**: the CS2 vocabulary every context speaks (wear names and their acronyms, item and sticker rarities, sticker types), the item's Steam market hash name (`MarketHashName`), the marketplace account id (`AccountId`), the currencies the bot handles (`COIN`, `USD`, `BRL`) and fixed facts of the game (`CS_APP_ID`).

## What belongs here

A concept moves here only when **all** of these hold:

- Two or more bounded contexts use it today, not "maybe later".
- It has the same meaning, the same values and the same rules in each of them. If one context needs a different rule or extra data, it's not shared: each context models its own version.
- It is pure domain: no I/O, no library, no provider's format.

When a concept is shared only by the subdomains of one context, it belongs in that context's `shared/` (e.g. `trading/shared/domain`), not here.

## What doesn't belong here

- Aggregates, entities, repositories, use cases, commands or events: those belong to one bounded context.
- A provider's vocabulary or payload types (e.g. CSGOEmpire's field names): those stay in the context's `infrastructure/`.
- Generic building blocks with no CS2 meaning (`Money`, `Percentage`, `BoundedString`, `ValueObject`): those are in `src/packages/`.

## Rules

- Folder structure: `domain/` only, one concept per file, named after the concept (`wear-name.ts`, `sticker-rarity.ts`).
- Fixed sets of values are `enum`s whose members are `UPPER_SNAKE_CASE` and whose values are the official CS2 / marketplace display names (`WearName.FIELD_TESTED = "Field-Tested"`).
- Fixed values are exported `UPPER_SNAKE_CASE` constants (`CS_APP_ID`, `COIN`), built from `src/packages/domain-primitives` when they need behaviour (`Currency.create(...)`).
- Imports only from `src/packages/domain-primitives`, `src/packages/building-blocks` and `src/packages/error`. Never from a bounded context.
- Every context depends on this folder, so a change here is a change everywhere: run the whole test suite (`bun test`) after touching it, and prefer adding over renaming or removing.
