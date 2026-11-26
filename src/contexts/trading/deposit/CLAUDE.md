# trading/deposit

The **deposit** subdomain of `trading` **sells our items on CSGOEmpire**: it lists them at a price (a deposit), changes or cancels a listing, sells an auction now, and tells CSGOEmpire when the buyer's trade offer was sent. Delivering the item through Steam is `delivery`'s job. Deposit and delivery meet only through the integration events in `shared-kernel/events/`.

Deposit has **no domain model by design** ([ADR-0006](../../../../adr/0006-selling-on-csgoempire.md), like [ADR-0005](../../../../adr/0005-catalog-without-a-domain-model.md)). CSGOEmpire owns a deposit's state and rules, so use cases are transaction scripts over gateways, and every state is rebuilt from CSGOEmpire. Don't add `domain/`, aggregates or a repository.

## Responsibilities

- List the account's CSGOEmpire inventory, deposit an item at a price, update the price, cancel a deposit (only without bids) and sell an auction now (only with at least one bid), through HTTP routes.
- React to CSGOEmpire `trade_status` events for our deposits. When a buyer must receive the item (an auction winner, or a direct buyer of a listing above +6%), publish `ItemSold`.
- On `SaleOfferSent`, mark the trade as sent on CSGOEmpire (`POST /trading/deposit/{deposit_id}/sent`) before its deadline.
- On `Credited` (10), sync the account balance. On `TradeReversed` (14), log an alert.
- Run the **reconciler** while at least one deposit is active, so a missed event or a crash never loses a step.
- In development, capture the raw CSGOEmpire deposit payloads to `captures/csgoempire/<date>.jsonl` so that contracts are typed from real data.

Out of scope: sending, confirming, re-sending and cancelling Steam offers, and renewing the trade-tracking token (`delivery`); buying (`trading/bidding`).

## Ubiquitous language

| Term              | Meaning                                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deposit           | One of our items listed on CSGOEmpire, identified by CSGOEmpire's deposit id (also called the trade id). Not modelled here: CSGOEmpire owns it.    |
| Auction / listing | A deposit priced at most +6% over the recommended price goes through a 3-minute auction; above that it is a market listing.                        |
| Sell now          | Ending an auction that has at least one bid, selling to the highest bidder.                                                                        |
| Sold              | A buyer must receive the item: the auction winner, or a direct buyer of a listing. Announced as `ItemSold`.                                        |
| Deadline          | The trade's `metadata.expires_at`: when sending and marking the offer as sent must be done. Never a hard-coded time.                               |
| Mark as sent      | Telling CSGOEmpire that the Steam offer was sent (`POST /trading/deposit/{deposit_id}/sent`). Missing the deadline cancels the trade and fines us. |
| Credited          | CSGOEmpire paid the coins, after Steam's trade protection (7–8 days).                                                                              |
| Reconciler        | The pass that compares CSGOEmpire's active deposits with our sent Steam offers and dispatches the missing step.                                    |
| Raw capture       | The development-only JSON lines file of raw CSGOEmpire payloads (`trade_status`, `deposit_failed`, `auction_update`, `deleted_item`).              |

## Folders

- `application/<use-case>/`: one folder per intention (deposit, update the price, cancel, sell now, publish the sale, mark as sent, sync on credit, reconcile), each with its command, handler, the gateways it owns and the listeners that trigger it.
- `infrastructure/`: gateway adapters (CSGOEmpire and dry run), controllers (HTTP, WebSocket, startup), the CSGOEmpire contracts `external/` implements, and the raw capture (`capture/`, `controllers/raw-csg-events-capture.ws-controller.ts`).
- `external/`: the CSGOEmpire HTTP adapters, the JSON lines file sink of the capture, the zod schemas of the HTTP routes, and the DI modules.

## Rules

- **Every step is an idempotent command** that re-reads CSGOEmpire (and, through delivery, Steam) before acting, and does nothing when the step already happened. Events and the reconciler dispatch the same commands.
- The reconciler runs at startup and about every 60 seconds **only while CSGOEmpire shows at least one active deposit**. Creating a deposit or receiving any deposit `trade_status` wakes it, and it stops when the last deposit ends (`Completed`, `Credited`, `Canceled`, `Timed Out`). Stay within 120 requests per 60 seconds, and back off on 429.
- Never act after the deadline or when CSGOEmpire's trade no longer waits for us. Never reverse a trade.
- **Development mode never acts**: no deposit, price change, cancel, sell now, mark as sent or balance change. Dry-run adapters log what they would do. The raw capture runs in development only and is never bound in production.
- Talk to `delivery` only through `shared-kernel/events/` (`ItemSold` out; `SaleOfferSent`, `SaleOfferAccepted`, `SaleOfferCancelled` in). Never import delivery.
- Type CSGOEmpire contracts only from its docs and from the user's raw captures. The docs show no deposit `trade_status` payload, so never guess one.
- Alerts are `Logger` messages at error level with a stable prefix. Never log secrets.
