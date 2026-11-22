# trading/shared

Code shared by the **subdomains of the trading bounded context** (today `bidding`; future trading subdomains reuse it). It is a shared kernel scoped to one context: the concepts here mean the same thing in every trading subdomain, but not necessarily outside trading.

## Folders

- `domain/`: trading concepts used by more than one subdomain, one per file, named after the concept: `CoinCent`, `MarketPrice`, `SuggestedPrice`, `Float`, `PercentageWear`, `Sticker`, `StickerName`, `StickerSlot`.
- `infrastructure/`: what every trading subdomain needs to talk to CSGOEmpire.
    - `csgoempire/csg.ws-client.ts`: the WebSocket client port.
    - `csgoempire/http/`: shared HTTP contracts (e.g. socket metadata).
    - `csgoempire/types/`: provider types reused by several endpoints or events.
    - `csgoempire/ws-events/`: one contract per WebSocket event (`new-item.ts`, `auction-update.ts`).
    - `controllers/`: controllers every subdomain depends on (`init-csg-session.ws-controller.ts`).
- `external/csgoempire/`: the concrete CSGOEmpire WebSocket and HTTP clients implementing those contracts.

## Rules

- A concept moves here only when a second trading subdomain uses it with the same meaning. Concepts shared with other bounded contexts go to `src/contexts/shared-kernel/`; generic ones go to `src/packages/`.
- Never import from a trading subdomain (`bidding/`, ...). Subdomains depend on `shared/`, not the reverse.
- The same layer rules apply as in a subdomain (see `src/ARCHITECTURE.md`): `domain/` stays pure, contracts live in `infrastructure/`, libraries only in `external/`.
- Contract types for CSGOEmpire follow the `external-api-contract` skill and come from the docs it points to.
- Every trading subdomain depends on this folder: run the whole test suite (`bun test`) after changing it.
